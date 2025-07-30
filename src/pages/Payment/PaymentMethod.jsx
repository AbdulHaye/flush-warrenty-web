import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import axios from "axios";
import "./paymentMethod.css";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css"; // Import your loader CSS

function PaymentMethod() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPlans, totalPayment, contactData, contactId } =
    location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [minLoading, setMinLoading] = useState(true);

  // NMI Configuration
  const NMI_SECURITY_KEY = import.meta.env.VITE_NMI_SECURITY_KEY;
  const NMI_API_URL = import.meta.env.VITE_NMI_API_URL;
  const CORS_PROXY = import.meta.env.VITE_CORS_PROXY;

  useEffect(() => {
    if (!selectedPlans || !contactData || !contactId) {
      navigate("/");
    }

    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 3000); // 2000ms = 2 seconds

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [selectedPlans, contactData, contactId, navigate]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{2,4}/g);
    const match = matches && matches[0];
    let parts = [];

    if (match && match.length >= 2) {
      parts = [match.substring(0, 2)];
      if (match.length > 2) {
        parts.push(match.substring(2, 4));
      }
      return parts.join("/");
    }
    return value;
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setCardDetails((prev) => ({
      ...prev,
      expiry: formatted,
    }));
  };

  const validateForm = () => {
    setError(null);

    if (paymentMethod === "creditCard") {
      if (
        !cardDetails.number ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        setError("Please fill in all credit card details");
        return false;
      }

      if (cardDetails.number.replace(/\s/g, "").length < 15) {
        setError("Please enter a valid card number");
        return false;
      }

      if (!cardDetails.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        setError("Please enter a valid expiry date (MM/YY)");
        return false;
      }

      if (cardDetails.cvv.length < 3) {
        setError("Please enter a valid CVV");
        return false;
      }
    } else {
      if (
        !bankDetails.accountNumber ||
        !bankDetails.routingNumber ||
        !bankDetails.name
      ) {
        setError("Please fill in all bank account details");
        return false;
      }

      if (bankDetails.accountNumber.length < 5) {
        setError("Please enter a valid account number");
        return false;
      }

      if (bankDetails.routingNumber.length !== 9) {
        setError("Please enter a valid 9-digit routing number");
        return false;
      }
    }

    return true;
  };

  const createNMIRecurringSubscription = async () => {
    try {
      // Filter out plans with $0 value
      const nonZeroPlans = selectedPlans.filter((plan) => {
        const monthlyAmount =
          parseFloat(plan.price.match(/\d+\.\d+/)?.[0]) || 0;
        return monthlyAmount > 0;
      });
      // If no plans with actual payment, just return success
      if (nonZeroPlans.length === 0) {
        return true;
      }
      // For each selected plan, create a recurring subscription
      for (const plan of nonZeroPlans) {
        const durationMonths = parseInt(plan.duration.match(/\d+/)[0]);
        const monthlyAmount = parseFloat(plan.price.match(/\d+\.\d+/)[0]);

        const params = new URLSearchParams();
        params.append("security_key", NMI_SECURITY_KEY);
        params.append("recurring", "add_subscription");
        params.append("start_date", getNextMonthFirstDay());
        params.append("plan_amount", monthlyAmount.toFixed(2));
        params.append("plan_payments", durationMonths);
        params.append("month_frequency", "1");
        params.append("day_of_month", "1");

        // Add payment details based on payment method
        if (paymentMethod === "creditCard") {
          params.append("ccnumber", cardDetails.number.replace(/\s/g, ""));
          params.append("ccexp", cardDetails.expiry.replace(/\s/g, ""));
          params.append("payment", "creditcard");
        } else {
          params.append("payment", "check");
          params.append("checkaba", bankDetails.routingNumber); // Changed from check_routing
          params.append("check_account", bankDetails.accountNumber);
          params.append("check_name", bankDetails.name);
          params.append("account_type", "checking"); // or 'savings'
          params.append("check_type", "web");
        }

        // Customer details
        params.append("first_name", contactData.firstName);
        params.append("last_name", contactData.lastName);
        params.append("address1", contactData.address1);
        params.append("city", contactData.city || "");
        params.append("state", contactData.state || "");
        params.append("zip", contactData.zip || "");
        params.append("country", contactData.country || "US");
        params.append("email", contactData.email);
        params.append("phone", contactData.phone);
        params.append("order_description", `${plan.title} - ${plan.duration}`);

        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_BASE_URL}/api/nmi-subscription`,
          {
            params: params.toString(),
            contactId: contactId,
            contactData: contactData,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        // Parse NMI response (they return a query string)
        const responseData = Object.fromEntries(
          new URLSearchParams(response.data).entries()
        );

        if (responseData.response !== "1") {
          throw new Error(
            responseData.responsetext || "Failed to create subscription"
          );
        }
      }

      return true;
    } catch (error) {
      console.error("NMI Subscription Error:", error);
      throw error;
    }
  };

  const getNextMonthFirstDay = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return formatDate(nextMonth);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`; // Format as YYYYMMDD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create recurring subscriptions
      await createNMIRecurringSubscription();

      setSuccess(true);
    } catch (error) {
      console.error("Payment Error:", error);
      setError(error.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || minLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "#1f78bc" }}
      >
        <Loader />
      </div>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="payment-success-container">
          <div className="payment-success">
            <h2>Payment Successful!</h2>
            <p>Your recurring payment has been set up successfully.</p>
            {/* <p>You will receive a confirmation email shortly.</p> */}

            <div className="order-summary">
              <h3>Order Summary</h3>
              <ul>
                {selectedPlans.map((plan, index) => (
                  <li key={index}>
                    {plan.title} - {plan.price}
                  </li>
                ))}
              </ul>
              <p className="total">Total: ${totalPayment.toFixed(2)}/month</p>
            </div>

            <button onClick={() => navigate("/")} className="btn btn-primary">
              Return to Home
            </button>
          </div>
        </div>
        <FlushWarrantyFooter />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-method-container">
        <div className="payment-method-form">
          <h2 className="text-center">Payment Method</h2>

          <div className="payment-tabs">
            <button
              type="button"
              className={`tab ${
                paymentMethod === "creditCard" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("creditCard")}
            >
              Credit Card
            </button>
            <button
              type="button"
              className={`tab ${
                paymentMethod === "bankAccount" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("bankAccount")}
            >
              Bank Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {paymentMethod === "creditCard" ? (
              <div className="credit-card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="number"
                    value={cardDetails.number}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            ) : (
              <div className="bank-account-form">
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={handleBankChange}
                    placeholder="123456789"
                  />
                </div>

                <div className="form-group">
                  <label>Routing Number</label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={bankDetails.routingNumber}
                    onChange={handleBankChange}
                    placeholder="011401533"
                  />
                </div>

                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    name="name"
                    value={bankDetails.name}
                    onChange={handleBankChange}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="order-summary">
              <h3>Order Summary</h3>
              <ul>
                {selectedPlans.map((plan, index) => (
                  <li key={index}>
                    {plan.title} - {plan.price}
                  </li>
                ))}
              </ul>
            </div>
            <p className="total-amount">
              Total: ${totalPayment.toFixed(2)}/month
            </p>
            <div className="terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I authorize Flush Warranty to charge my{" "}
                {paymentMethod === "creditCard"
                  ? "credit card"
                  : "bank account"}
                according to the terms of my plan(s) until I cancel.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary margin-auto"
              disabled={loading}
            >
              {loading ? (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  style={{ backgroundColor: "#1f78bc" }}
                >
                  <Loader />
                </div>
              ) : (
                "Ready To Pay"
              )}
            </button>
          </form>
        </div>
      </div>
      <FlushWarrantyFooter />
    </>
  );
}

export default PaymentMethod;
