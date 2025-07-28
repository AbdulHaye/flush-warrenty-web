"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/navbar";
import homePic from "../../assets/familyphtot.png";
import "./flushWarrentyLandingPageStyle.css";
import Toast from "../../components/Toast/Toast";

const token = import.meta.env.VITE_GHL_API_TOKEN;

const validZipCodes = [
  "06443",
  "06419",
  "06437",
  "06405",
  "06498",
  "06472",
  "06422",
  "06441",
  "06442",
  "06475",
  "06417",
];

const Modal = ({ children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-container">
      <button onClick={onClose} className="modal-close-button">
        ✕
      </button>
      {children}
    </div>
  </div>
);

const InvalidZipModal = ({ onClose, showToast }) => {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isRegistering, setIsRegistering] = useState(false); // Loading state for Register button

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setSignupData((prevData) => ({ ...prevData, [name]: numericValue }));
    } else {
      setSignupData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSignup = async () => {
    if (isRegistering) return; // Prevent multiple submissions
    if (signupData.phone.length !== 10) {
      showToast("Please enter a valid 10-digit US phone number.", "error");
      return;
    }
    setIsRegistering(true); // Start loading
    try {
      await axios.post(
        "https://rest.gohighlevel.com/v1/contacts/",
        signupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onClose();
      showToast("Signed up successfully!", "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.email?.message ||
        error.response?.data?.message ||
        "Failed to sign up. Please try again.";
      showToast(errorMessage, "error");
      console.error("Error signing up:", error);
    } finally {
      setIsRegistering(false); // Stop loading
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-content">
        <h3 className="modal-title">
          We're sorry, but Flush Warranty is not currently available in your
          area.
        </h3>
        <p className="modal-text">
          You may Register for a notification list for future availability.
        </p>
        <div className="modal-form">
          <input
            name="name"
            placeholder="Enter your name"
            className="modal-input"
            value={signupData.name}
            onChange={handleSignupChange}
          />
          <input
            name="email"
            placeholder="Enter your email"
            className="modal-input"
            value={signupData.email}
            onChange={handleSignupChange}
          />
          <input
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            className="modal-input"
            value={signupData.phone}
            onChange={handleSignupChange}
            pattern="[0-9]{10}"
            inputMode="numeric"
            maxLength={10}
          />
          <button
            onClick={handleSignup}
            className="modal-submit-button"
            disabled={isRegistering} // Disable button during loading
          >
            {isRegistering ? "Processing..." : "Register"}{" "}
            {/* Show processing */}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const FlushWarrantyLandingPage = () => {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    role: "I am a homeowner.",
  });
  const [isSending, setIsSending] = useState(false); // Loading state for Send button

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prevData) => ({ ...prevData, [name]: numericValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (validZipCodes.includes(zipCode)) {
      setIsValid(true);
      localStorage.setItem("lastZipCode", zipCode);
    } else {
      setIsValid(false);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setZipCode("");
  };

  const extractAddressComponents = (address) => {
    const parts = address.split(" ");
    const state = parts.pop();
    const city = parts.pop();
    const street = parts.join(" ");
    return { street, city, state, postalCode: "" };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return; // Prevent multiple submissions
    if (formData.phone.length !== 10) {
      showToast("Please enter a valid 10-digit US phone number.", "error");
      return;
    }
    setIsSending(true); // Start loading
    const { street, city, state, postalCode } = extractAddressComponents(
      formData.address
    );
    try {
      const response = await axios.post(
        "https://rest.gohighlevel.com/v1/contacts/",
        {
          firstName: formData.name,
          phone: formData.phone,
          email: formData.email,
          address1: street,
          city: city,
          state: state,
          postalCode: postalCode,
          customField: {
            BtRFPx0AxeT6wdt85VnX: formData.role,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            Version: "2021-07-28",
          },
        }
      );

      localStorage.setItem("contactId", response.data.contact.id);
      handleClose();
      navigate("/shop");
    } catch (error) {
      const errorMessage =
        error.response?.data?.email?.message ||
        error.response?.data?.message ||
        "Failed to submit. Please try again.";
      showToast(errorMessage, "error");
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
    } finally {
      setIsSending(false); // Stop loading
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
      <main className="main-content">
        <div className="image-container">
          <img
            src={homePic || "/placeholder.svg"}
            alt="Family"
            className="home-image"
          />
        </div>
        <div className="form-container">
          <h2 className="main-heading">
            Make Expensive Septic Repairs Disappear
          </h2>
          <p className="description-text">
            Take advantage of a discounted septic inspection on your first
            service with FLUSH Warranty. Obtain a quote today to explore our
            plans and see pricing for your area.
          </p>
          <div className="coverage-heading-container">
            <h2 className="coverage-heading">Find Coverage in Your Area</h2>
          </div>
          <div className="zip-input-container">
            <input
              type="text"
              placeholder="Enter ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="zip-input"
            />
          </div>
          <div className="submit-button-container">
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      </main>

      {isModalOpen &&
        (isValid ? (
          <Modal onClose={handleClose}>
            <div className="modal-content">
              <h3 className="modal-title">
                Great! We have coverage in your area based on ZIP code
              </h3>
              <form onSubmit={handleFormSubmit} className="modal-form">
                <input
                  name="name"
                  placeholder="Name"
                  onChange={handleInputChange}
                  className="modal-input"
                  value={formData.name}
                  required
                />
                <input
                  name="address"
                  placeholder="Address"
                  onChange={handleInputChange}
                  className="modal-input"
                  value={formData.address}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  onChange={handleInputChange}
                  className="modal-input"
                  value={formData.phone}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                <input
                  name="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                  className="modal-input"
                  value={formData.email}
                  required
                />
                <select
                  name="role"
                  onChange={handleInputChange}
                  className="modal-input modal-select"
                  value={formData.role}
                >
                  <option value="I am a homeowner.">I am a homeowner.</option>
                  <option value="I am a real estate agent.">
                    I am a real estate agent.
                  </option>
                </select>
                <button
                  type="submit"
                  className="modal-submit-button modal-send-button"
                  disabled={isSending} // Disable button during loading
                >
                  {isSending ? "Processing..." : "SEND"} {/* Show processing */}
                </button>
              </form>
            </div>
          </Modal>
        ) : (
          <InvalidZipModal onClose={handleClose} showToast={showToast} />
        ))}
    </div>
  );
};

export default FlushWarrantyLandingPage;
