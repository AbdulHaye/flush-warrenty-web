import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";
import "./AuthStyles.css";

function MyAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Loading state for login button
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return; // Prevent multiple submissions
    setIsLoggingIn(true); // Start loading
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

      // Find the contact with exact email match
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
      setIsLoggingIn(false); // Stop loading
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

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-button-group">
              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={isLoggingIn} // Disable button during loading
              >
                {isLoggingIn ? "Processing..." : "LOG IN"}{" "}
                {/* Show processing */}
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
      <FlushWarrantyFooter />
    </>
  );
}

export default MyAccount;
