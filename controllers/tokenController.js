const ghlService = require("../services/ghlService");
const config = require("../config/config");

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token is required" });
  }

  try {
    const data = await ghlService.refreshToken(refresh_token);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to refresh token", details: error.message });
  }
};

exports.refreshAndUpdateToken = async (req, res) => {
  try {
    // Validate environment variables
    if (
      !process.env.VITE_GHL_API_TOKEN ||
      !process.env.VITE_GHL_CLIENT_ID ||
      !process.env.VITE_GHL_CLIENT_SECRET
    ) {
      throw new Error("Missing required environment variables");
    }

    // Fetch current token data
    const tokenData = await ghlService.getCustomValue(config.customValueId);
    if (!tokenData.value) throw new Error("Custom value is empty");

    let parsedTokenData;
    try {
      parsedTokenData = JSON.parse(tokenData.value);
    } catch (parseError) {
      throw new Error("Invalid token data format in custom value");
    }

    if (!parsedTokenData.refresh_token)
      throw new Error("No refresh_token found in custom value");

    // Refresh the token
    const newTokenData = await ghlService.refreshToken(
      parsedTokenData.refresh_token
    );
    newTokenData.expiresAt = Date.now() + newTokenData.expires_in * 1000;

    // Update the custom-value with new token data
    await ghlService.updateCustomValue(config.customValueId, {
      value: JSON.stringify(newTokenData),
    });

    res.json({
      message: "Token refreshed and updated successfully",
      newTokenData,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to refresh and update token",
        details: error.message,
      });
  }
};
