const nmiService = require("../services/nmiService");
const ghlService = require("../services/ghlService");
const axios = require("axios");
const crypto = require("crypto");
const config = require("../config/config");

// Temporary in-memory storage
const tempStorage = {};

// Utility function to verify webhook signature
const webhookIsVerified = (webhookBody, signingKey, nonce, signature) => {
  const computedSignature = crypto
    .createHmac("sha256", signingKey)
    .update(`${nonce}.${webhookBody}`)
    .digest("hex");
  return signature === computedSignature;
};

exports.createSubscription = async (req, res) => {
  try {
    console.log("Received request to create subscription:", req.body);
    const data = await nmiService.createSubscription(req.body.params);
    const responseData = Object.fromEntries(
      new URLSearchParams(data).entries()
    );

    if (req.body.contactData) {
      try {
        const contact = await ghlService.getContact(req.body.contactId);
        const currentTags = contact.tags || [];
        let newTags = [...currentTags];

        if (responseData.response === "1") {
          console.log("Payment successful:", responseData);
          console.log("Contact ID:", req.body.contactId);
          console.log("Contact Data:", req.body.contactData);
          newTags = [...new Set([...currentTags, "Payment-Successful"])];
          await ghlService.updateContact(req.body.contactId, {
            tags: newTags,
          });

          // Store data temporarily using transactionId as the key
          const transactionId = responseData.transactionid;
          tempStorage[transactionId] = {
            contactId: req.body.contactId,
            transactionId: transactionId,
            amount: responseData.plan_amount,
            date: new Date().toISOString(),
            contactData: req.body.contactData,
          };
        } else if (
          responseData.response === "2" ||
          responseData.response === "3"
        ) {
          newTags = [...new Set([...currentTags, "Payment-Declined"])];
          await ghlService.updateContact(req.body.contactId, {
            tags: newTags,
          });
        }
      } catch (ghlError) {
        console.error("Failed to update GHL contact:", ghlError);
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  console.log("Received NMI webhook raw buffer:", req.rawBody);
  console.log("Webhook signature header:", req.headers["webhook-signature"]);

  try {
    const signingKey = config.nmiSigningKey;
    console.log("Configured signing key:", signingKey);
    const sigHeader = req.headers["webhook-signature"];

    if (!sigHeader) {
      throw new Error("Invalid webhook - signature header missing");
    }

    const matches = sigHeader.match(/t=(.*),s=(.*)/);
    if (!matches || matches.length < 3) {
      throw new Error("Unrecognized webhook signature format");
    }

    const nonce = matches[1];
    const signature = matches[2];
    console.log("Extracted nonce:", nonce, "signature:", signature);

    if (!webhookIsVerified(req.rawBody, signingKey, nonce, signature)) {
      throw new Error("Invalid webhook - invalid signature");
    }

    const eventData = req.body;
    console.log("Event data:", eventData);

    // Send NMI webhook data directly to GHL webhook
    console.log("Sending data to GHL webhook URL:", config.ghlWebhookUrl);
    const ghlResponse = await axios.post(config.ghlWebhookUrl, eventData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("GHL webhook response:", ghlResponse.status, ghlResponse.data);

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error.message);
    if (error.response) {
      console.error(
        "GHL webhook error response:",
        error.response.status,
        error.response.data
      );
    }
    res.status(400).json({ error: error.message });
  }
};
