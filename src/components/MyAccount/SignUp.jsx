import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";
import "./AuthStyles.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First verify the email exists exactly in GHL
      const response = await axios.get(
        `https://rest.gohighlevel.com/v1/contacts?query=${email}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          },
        }
      );

      const contacts = response.data.contacts;
      
      // Find exact email match (case insensitive)
      const contact = contacts.find(contact => 
        contact.email?.toLowerCase() === email.toLowerCase()
      );

      if (!contact) {
        setError("No contact found with this exact email address");
        return;
      }

      // Check if password is already set (prevent duplicate signups)
      const existingPassword = contact.customField?.find(
        (f) => f.id === "bPKri73yB589zkIAnxeC"
      )?.value;

      if (existingPassword) {
        setError("An account already exists with this email. Please login instead.");
        return;
      }

      // Update the contact with the new password
      await axios.put(
        `https://rest.gohighlevel.com/v1/contacts/${contact.id}`,
        {
          customField: [
            {
              id: "bPKri73yB589zkIAnxeC",
              value: password,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          },
        }
      );

      navigate("/my-account");
    } catch (err) {
      setError("Error signing up. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h3 className="auth-title myaccount-title">Create an Account</h3>

        <div className="auth-form-wrapper">
          <form onSubmit={handleSubmit}>
            <h4 className="auth-subtitle login-text">Sign Up</h4>

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
              <button type="submit" className="auth-button auth-button-primary">
                SIGN UP
              </button>
              <button
                type="button"
                className="auth-button auth-button-secondary"
                onClick={() => navigate("/my-account")}
              >
                BACK TO LOGIN
              </button>
            </div>
          </form>
        </div>
      </div>
      <FlushWarrantyFooter />
    </>
  );
}

export default SignUp;