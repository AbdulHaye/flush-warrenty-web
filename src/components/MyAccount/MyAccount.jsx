import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";
import "./AuthStyles.css";

// Constants for rate limiting
const RESET_LIMIT = 5;
const RESET_WINDOW_HOURS = 1;

const getResetAttempts = (email) => {
  if (!email) return 0;

  try {
    const attemptsData = localStorage.getItem("resetAttempts");
    let attemptsMap = {};

    if (attemptsData) {
      try {
        attemptsMap = JSON.parse(attemptsData) || {};
      } catch (e) {
        attemptsMap = {};
      }
    }

    // If email doesn't exist in map or structure is invalid, initialize it
    if (!attemptsMap[email] || typeof attemptsMap[email] !== "object") {
      return 0;
    }

    // Check if time window has expired (1 hour from first attempt)
    const timeElapsed = Date.now() - attemptsMap[email].firstAttemptTime;
    if (timeElapsed > RESET_WINDOW_HOURS * 60 * 60 * 1000) {
      // Time window expired, reset this email's attempts
      delete attemptsMap[email];
      localStorage.setItem("resetAttempts", JSON.stringify(attemptsMap));
      return 0;
    }

    return attemptsMap[email].count || 0;
  } catch (e) {
    console.error("Error getting reset attempts:", e);
    return 0;
  }
};

const incrementResetAttempts = (email) => {
  if (!email) return 0;

  try {
    const attemptsData = localStorage.getItem("resetAttempts");
    let attemptsMap = {};

    if (attemptsData) {
      try {
        attemptsMap = JSON.parse(attemptsData) || {};
      } catch (e) {
        attemptsMap = {};
      }
    }

    // Initialize if this is the first attempt for this email
    if (!attemptsMap[email] || typeof attemptsMap[email] !== "object") {
      attemptsMap[email] = {
        count: 0,
        firstAttemptTime: Date.now(), // Record first attempt time
        lastAttemptTime: Date.now(),
      };
    }

    // Increment count and update last attempt time
    attemptsMap[email].count += 1;
    attemptsMap[email].lastAttemptTime = Date.now();

    localStorage.setItem("resetAttempts", JSON.stringify(attemptsMap));
    return attemptsMap[email].count;
  } catch (e) {
    console.error("Error incrementing reset attempts:", e);
    return 0;
  }
};

const getRemainingTime = (email) => {
  if (!email) return 0;

  try {
    const attemptsData = localStorage.getItem("resetAttempts");
    if (!attemptsData) return 0;

    const attemptsMap = JSON.parse(attemptsData) || {};
    if (!attemptsMap[email] || !attemptsMap[email].firstAttemptTime) return 0;

    const timeElapsed = Date.now() - attemptsMap[email].firstAttemptTime;
    const remainingTime = Math.max(
      0,
      RESET_WINDOW_HOURS * 60 * 60 * 1000 - timeElapsed
    );

    return Math.ceil(remainingTime / (60 * 1000)); // Return remaining minutes
  } catch (e) {
    return 0;
  }
};

function MyAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const response = await axios.get(
        `https://rest.gohighlevel.com/v1/contacts?query=${email}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          },
        }
      );

      const contacts = response.data.contacts;
      const contact = contacts.find(
        (contact) => contact.email?.toLowerCase() === email.toLowerCase()
      );

      if (!contact) {
        setError("No contact found with this email");
        return;
      }

      const storedPassword = contact.customField?.find(
        (f) => f.id === "bPKri73yB589zkIAnxeC"
      )?.value;

      if (
        storedPassword === undefined ||
        storedPassword === null ||
        storedPassword === ""
      ) {
        setError("No password set for this account. Please sign up first.");
        return;
      }

      if (storedPassword === password) {
        localStorage.setItem("contactId", contact.id);
        navigate("/dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Error logging in. Please try again.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    // Check reset attempts for this specific email
    const attempts = getResetAttempts(forgotPasswordEmail);
    if (attempts >= RESET_LIMIT) {
      const remainingMinutes = getRemainingTime(forgotPasswordEmail);
      setForgotPasswordError(
        `You've reached the maximum number of password reset attempts (${RESET_LIMIT}). ` +
          `Please try again in ${remainingMinutes} minute(s).`
      );
      return;
    }

    setIsSendingReset(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    try {
      // Send only the email to the webhook
      await axios.post(
        "https://services.leadconnectorhq.com/hooks/YihBpZKyQw1X7pKsmqdp/webhook-trigger/b45a2287-8989-4205-967b-545143ee656e",
        { email: forgotPasswordEmail },
        { headers: { "Content-Type": "application/json" } }
      );

      // Increment attempts only on successful request
      incrementResetAttempts(forgotPasswordEmail);

      setForgotPasswordSuccess(
        "Password reset instructions have been sent to your email"
      );
      setForgotPasswordEmail("");
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotPasswordSuccess("");
      }, 3000);
    } catch (err) {
      setForgotPasswordError("Failed to send reset request. Please try again.");
      console.error("Webhook error:", err);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h3 className="auth-title myaccount-title">My Account</h3>

        <div className="auth-form-wrapper">
          <form onSubmit={handleSubmit}>
            <h4 className="auth-subtitle login-text">Login</h4>

            <div className="auth-field">
              <label className="auth-label">
                Email address <span className="required-star">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Password <span className="required-star">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="forgot-password-link">
              <button
                type="button"
                className="text-button"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Forgot Password?
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-button-group">
              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <span className="button-spinner"></span>
                    Processing...
                  </>
                ) : (
                  "LOG IN"
                )}
              </button>
              <button
                type="button"
                className="auth-button auth-button-secondary"
                onClick={() => navigate("/signup")}
              >
                SIGN UP
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Custom Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => {
            setShowForgotPasswordModal(false);
            setForgotPasswordError("");
            setForgotPasswordSuccess("");
          }}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>Reset Your Password</h3>
              <button
                className="custom-modal-close"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordError("");
                  setForgotPasswordSuccess("");
                }}
                aria-label="Close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 4L12 12"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="custom-modal-body">
              <div className="modal-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="modal-description">
                Please provide your email address to recover your password.
              </p>

              <div className="auth-field">
                <label className="auth-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="auth-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {forgotPasswordEmail &&
                getResetAttempts(forgotPasswordEmail) > 0 && (
                  <div className="attempts-remaining">
                    Attempts remaining for {forgotPasswordEmail}:{" "}
                    {RESET_LIMIT - getResetAttempts(forgotPasswordEmail)} of{" "}
                    {RESET_LIMIT}
                    <br />
                    {getResetAttempts(forgotPasswordEmail) >= RESET_LIMIT && (
                      <>
                        Time remaining: {getRemainingTime(forgotPasswordEmail)}{" "}
                        minute(s)
                      </>
                    )}
                  </div>
                )}

              {forgotPasswordError && (
                <div className="auth-error-message">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5V8M8 11H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{forgotPasswordError}</span>
                </div>
              )}
              {forgotPasswordSuccess && (
                <div className="auth-success-message">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 4L6 12L3 9"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{forgotPasswordSuccess}</span>
                </div>
              )}
            </div>
            <div className="custom-modal-footer">
              <button
                type="button"
                className="auth-button auth-button-tertiary"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordError("");
                  setForgotPasswordSuccess("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="auth-button auth-button-primary"
                onClick={handleForgotPassword}
                disabled={
                  isSendingReset ||
                  getResetAttempts(forgotPasswordEmail) >= RESET_LIMIT
                }
              >
                {isSendingReset ? (
                  <>
                    <span className="button-spinner"></span>
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <FlushWarrantyFooter />
    </>
  );
}

export default MyAccount;
