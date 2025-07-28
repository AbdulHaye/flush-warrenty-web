import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";
import Toast from "../Toast/Toast";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css";
import "./billingForm.css";

// Enhanced Modal component
const Modal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Application Submitted!
        </h2>

        {/* Content */}
        <div className="mb-6">
          {/* <p className="text-gray-600 mb-4 text-center">
            Thank you for your submission. Here's a summary:
          </p> */}
          <p className="text-gray-600 mb-4 text-center">
            Thank you for submitting your application. We will contact you to
            schedule a septic inspection.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-blue-100 last:border-b-0"
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-blue-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const BillingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPrices, selectedTitles, selectedIds } = location.state || {
    selectedPrices: [],
    selectedTitles: [],
    selectedIds: [],
  };

  const BEARER_TOKEN = import.meta.env.VITE_GHL_API_TOKEN;
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [minLoading, setMinLoading] = useState(true);
  const [formData, setFormData] = useState({
    billing_full_name: "",
    billing_address: "",
    billing_phone: "",
    billing_email: "",
    bedrooms: "",
    waterType: "Well",
    waterConditioning: "Yes",
    residents: "",
    fullTimeResidence: "Yes",
    energyEfficient: "Yes",
    homeAge: "",
    septicAge: "",
    fullBasement: "Yes",
    garbageDisposal: "Yes",
    cookingFrequency: "",
  });
  const [errors, setErrors] = useState({});
  const [modalState, setModalState] = useState({ isOpen: false, data: [] });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const FIELD_IDS = {
    BEDROOMS: "DgvC20xu7CROjWvmLJm4",
    WATER_TYPE: "SY9Ez0MyFCZAmdP5BuQN",
    WATER_CONDITIONING: "S2Abn6ZZq6sbaDvCzZyr",
    RESIDENTS: "FzYelB2DnbOTaCi7B7mb",
    FULL_TIME_RESIDENCE: "bog3Ei7sHhJmvdmdSwIi",
    ENERGY_EFFICIENT: "CqrohDSQNpC3JjRzP54n",
    HOME_AGE: "dEkcI7aiBSjktddENZdI",
    SEPTIC_AGE: "6f9udpWZ7EGe9ecLZTYs",
    FULL_BASEMENT: "DMdvnmxoNQQC3xE0L7gS",
    GARBAGE_DISPOSAL: "BiHcK3zuOzvuNqReRNEl",
    COOKING_FREQUENCY: "AiWiIix5L46ioRnXkKFs",
    BILLING_FULL_NAME: "cdPUpkv4BxtoDeJiV7QZ",
    BILLING_ADDRESS: "ajt8ZWrwYbwHk1c3ygsD",
    BILLING_PHONE: "KQ5UIyIMEvMDSi9JISjp",
    BILLING_EMAIL: "giKvkQYHEA7fgjyz2E3Y",
  };

  const PRICE_FIELD_IDS = {
    PRICE_36_MONTHS: "23Lqqqu1H8qfeEMEb8uc",
    PRICE_72_MONTHS: "FIELD_ID_FOR_72_MONTHS_PRICE",
    PRICE_108_MONTHS: "FIELD_ID_FOR_108_MONTHS_PRICE",
  };

  const api = axios.create({
    baseURL: "https://rest.gohighlevel.com/v1",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const contactId = localStorage.getItem("contactId");
        if (!contactId) {
          console.error("No contactId found in localStorage");
          setLoading(false);
          return;
        }

        const response = await api.get(`/contacts/${contactId}`);
        setContactData(response.data.contact);

        if (response.data.contact.customField) {
          const customFields = response.data.contact.customField;
          setFormData({
            billing_full_name:
              customFields.find((f) => f.id === FIELD_IDS.BILLING_FULL_NAME)
                ?.value || "",
            billing_address:
              customFields.find((f) => f.id === FIELD_IDS.BILLING_ADDRESS)
                ?.value || "",
            billing_phone:
              customFields.find((f) => f.id === FIELD_IDS.BILLING_PHONE)
                ?.value || "",
            billing_email:
              customFields.find((f) => f.id === FIELD_IDS.BILLING_EMAIL)
                ?.value || "",
            bedrooms:
              customFields.find((f) => f.id === FIELD_IDS.BEDROOMS)?.value ||
              "",
            waterType:
              customFields.find((f) => f.id === FIELD_IDS.WATER_TYPE)?.value ||
              "Well",
            waterConditioning:
              customFields.find((f) => f.id === FIELD_IDS.WATER_CONDITIONING)
                ?.value || "Yes",
            residents:
              customFields.find((f) => f.id === FIELD_IDS.RESIDENTS)?.value ||
              "",
            fullTimeResidence:
              customFields.find((f) => f.id === FIELD_IDS.FULL_TIME_RESIDENCE)
                ?.value || "Yes",
            energyEfficient:
              customFields.find((f) => f.id === FIELD_IDS.ENERGY_EFFICIENT)
                ?.value || "Yes",
            homeAge:
              customFields.find((f) => f.id === FIELD_IDS.HOME_AGE)?.value ||
              "",
            septicAge:
              customFields.find((f) => f.id === FIELD_IDS.SEPTIC_AGE)?.value ||
              "",
            fullBasement:
              customFields.find((f) => f.id === FIELD_IDS.FULL_BASEMENT)
                ?.value || "Yes",
            garbageDisposal:
              customFields.find((f) => f.id === FIELD_IDS.GARBAGE_DISPOSAL)
                ?.value || "Yes",
            cookingFrequency:
              customFields.find((f) => f.id === FIELD_IDS.COOKING_FREQUENCY)
                ?.value || "",
          });
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
    const timer = setTimeout(() => setMinLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "billing_full_name",
      "billing_address",
      "billing_phone",
      "billing_email",
      "bedrooms",
      "waterType",
      "waterConditioning",
      "residents",
      "fullTimeResidence",
      "energyEfficient",
      "homeAge",
      "septicAge",
      "fullBasement",
      "garbageDisposal",
      "cookingFrequency",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    });

    if (
      formData.billing_email &&
      !/\S+@\S+\.\S+/.test(formData.billing_email)
    ) {
      newErrors.billing_email = "Please enter a valid email address";
    }

    if (
      formData.billing_phone &&
      !/^\+?\d{10,15}$/.test(formData.billing_phone.replace(/\D/g, ""))
    ) {
      newErrors.billing_phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = (selectedPrices) => {
    let totalMonthlyPrice = 0;
    let maxMonths = 0;

    selectedPrices.forEach((priceString) => {
      const priceMatch = priceString.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        totalMonthlyPrice += parseFloat(priceMatch[1]);
      }
      const durationMatch = priceString.match(/for (\d+) Months?/);
      if (durationMatch) {
        maxMonths = Math.max(maxMonths, parseInt(durationMatch[1]));
      }
    });

    return {
      monthlyTotal: totalMonthlyPrice.toFixed(2),
      maxDuration: maxMonths,
    };
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, data: [] });
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fill in all required fields correctly", "error");
      return;
    }

    setSubmitLoading(true);

    try {
      const contactId = localStorage.getItem("contactId");
      if (!contactId) {
        console.error("No contactId found in localStorage");
        showToast("No contact found. Please try again.", "error");
        return;
      }

      const customFields = [
        ...selectedIds.flatMap((id, index) => {
          const priceString = selectedPrices[index];
          const durationMatch = priceString.match(/(\d+\sMonths)/);
          const duration = durationMatch ? durationMatch[1] : "";

          return [
            { id, value: duration },
            { id: PRICE_FIELD_IDS[duration], value: priceString },
          ];
        }),
        { id: FIELD_IDS.BILLING_FULL_NAME, value: formData.billing_full_name },
        { id: FIELD_IDS.BILLING_ADDRESS, value: formData.billing_address },
        { id: FIELD_IDS.BILLING_PHONE, value: formData.billing_phone },
        { id: FIELD_IDS.BILLING_EMAIL, value: formData.billing_email },
        { id: FIELD_IDS.BEDROOMS, value: formData.bedrooms },
        { id: FIELD_IDS.WATER_TYPE, value: formData.waterType },
        {
          id: FIELD_IDS.WATER_CONDITIONING,
          value: formData.waterConditioning,
        },
        { id: FIELD_IDS.RESIDENTS, value: formData.residents },
        {
          id: FIELD_IDS.FULL_TIME_RESIDENCE,
          value: formData.fullTimeResidence,
        },
        { id: FIELD_IDS.ENERGY_EFFICIENT, value: formData.energyEfficient },
        { id: FIELD_IDS.HOME_AGE, value: formData.homeAge },
        { id: FIELD_IDS.SEPTIC_AGE, value: formData.septicAge },
        { id: FIELD_IDS.FULL_BASEMENT, value: formData.fullBasement },
        { id: FIELD_IDS.GARBAGE_DISPOSAL, value: formData.garbageDisposal },
        { id: FIELD_IDS.COOKING_FREQUENCY, value: formData.cookingFrequency },
      ].filter((field) => field.value !== "" && field.value !== undefined);

      await api.put(`/contacts/${contactId}`, {
        customField: customFields,
      });

      // Prepare modal data based on the provided image
      const modalData = [
        ...selectedTitles.map((title, index) => ({
          label: title,
          value: selectedPrices[index],
        })),
        {
          label: "Subtotal",
          value: `$${calculateSubtotal(selectedPrices).monthlyTotal} / ${
            calculateSubtotal(selectedPrices).maxDuration
          } Months`,
        },
        { label: "Full Name", value: formData.billing_full_name },
        { label: "Email", value: formData.billing_email },
      ];

      setModalState({
        isOpen: true,
        data: modalData,
      });
      localStorage.removeItem("contactId");
    } catch (error) {
      console.error("Error updating contact:", error);
      showToast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || minLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "#1f78bc" }} // Blue background
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
      <div className="flex flex-col lg:flex-row justify-center items-start p-8 bg-blue-100 min-h-screen">
        <div className="w-full lg:w-2/3 p-8 bg-white shadow-lg rounded-2xl">
          <h2 className="text-4xl font-extrabold mb-6">Billing details</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-lg">
                Full Name: *
              </label>
              <input
                name="billing_full_name"
                type="text"
                placeholder="Full Name"
                className={`w-full p-3 border ${
                  errors.billing_full_name
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                defaultValue={
                  contactData
                    ? `${contactData.firstName} ${contactData.lastName}`
                    : ""
                }
                value={formData.billing_full_name}
                onChange={handleInputChange}
                required
              />
              {errors.billing_full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billing_full_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Address: *</label>
              <input
                name="billing_address"
                type="text"
                placeholder="House number and street name"
                className={`w-full p-3 border ${
                  errors.billing_address ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                defaultValue={contactData ? contactData.address1 : ""}
                value={formData.billing_address}
                onChange={handleInputChange}
                required
              />
              {errors.billing_address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billing_address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-lg">
                Phone Number: *
              </label>
              <input
                name="billing_phone"
                type="tel"
                placeholder="Phone Number"
                className={`w-full p-3 border ${
                  errors.billing_phone ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                defaultValue={contactData ? contactData.phone : ""}
                value={formData.billing_phone}
                onChange={handleInputChange}
                required
              />
              {errors.billing_phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billing_phone}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-lg">
                Email address: *
              </label>
              <input
                name="billing_email"
                type="email"
                placeholder="Email address"
                className={`w-full p-3 border ${
                  errors.billing_email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                defaultValue={contactData ? contactData.email : ""}
                value={formData.billing_email}
                onChange={handleInputChange}
                required
              />
              {errors.billing_email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billing_email}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mt-6">
                Additional information
              </h3>
              <label className="block text-gray-700 text-lg mt-4">
                How many bedrooms are in the house? *
              </label>
              <input
                type="number"
                name="bedrooms"
                placeholder="Number of bedrooms"
                className={`w-full p-3 border ${
                  errors.bedrooms ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="1"
                required
              />
              {errors.bedrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Do you have well water or city water? *
              </label>
              <select
                name="waterType"
                className={`w-full p-3 border ${
                  errors.waterType ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.waterType}
                onChange={handleInputChange}
                required
              >
                <option value="Well">Well</option>
                <option value="City">City</option>
              </select>
              {errors.waterType && (
                <p className="text-red-500 text-sm mt-1">{errors.waterType}</p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                If well water, do you have a water conditioning system? *
              </label>
              <select
                name="waterConditioning"
                className={`w-full p-3 border ${
                  errors.waterConditioning
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.waterConditioning}
                onChange={handleInputChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.waterConditioning && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.waterConditioning}
                </p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                How many people live in the house full-time? *
              </label>
              <input
                type="number"
                name="residents"
                placeholder="Number of residents"
                className={`w-full p-3 border ${
                  errors.residents ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.residents}
                onChange={handleInputChange}
                min="1"
                required
              />
              {errors.residents && (
                <p className="text-red-500 text-sm mt-1">{errors.residents}</p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Is this your full-time residence? *
              </label>
              <select
                name="fullTimeResidence"
                className={`w-full p-3 border ${
                  errors.fullTimeResidence
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.fullTimeResidence}
                onChange={handleInputChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.fullTimeResidence && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullTimeResidence}
                </p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Do you have energy-efficient appliances? *
              </label>
              <select
                name="energyEfficient"
                className={`w-full p-3 border ${
                  errors.energyEfficient ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.energyEfficient}
                onChange={handleInputChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.energyEfficient && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.energyEfficient}
                </p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Age of the home: *
              </label>
              <input
                type="number"
                name="homeAge"
                placeholder="Age of the home in years"
                className={`w-full p-3 border ${
                  errors.homeAge ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.homeAge}
                onChange={handleInputChange}
                min="1"
                required
              />
              {errors.homeAge && (
                <p className="text-red-500 text-sm mt-1">{errors.homeAge}</p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Age of the septic system: *
              </label>
              <input
                type="number"
                name="septicAge"
                placeholder="Age of the septic system in years"
                className={`w-full p-3 border ${
                  errors.septicAge ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.septicAge}
                onChange={handleInputChange}
                min="0"
                required
              />
              {errors.septicAge && (
                <p className="text-red-500 text-sm mt-1">{errors.septicAge}</p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Does the house have a full basement? *
              </label>
              <select
                name="fullBasement"
                className={`w-full p-3 border ${
                  errors.fullBasement ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.fullBasement}
                onChange={handleInputChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.fullBasement && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullBasement}
                </p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                Garbage disposal presence *
              </label>
              <select
                name="garbageDisposal"
                className={`w-full p-3 border ${
                  errors.garbageDisposal ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.garbageDisposal}
                onChange={handleInputChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.garbageDisposal && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.garbageDisposal}
                </p>
              )}
              <label className="block text-gray-700 text-lg mt-4">
                How often do you cook at home? *
              </label>
              <select
                name="cookingFrequency"
                className={`w-full p-3 border ${
                  errors.cookingFrequency ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.cookingFrequency}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select frequency
                </option>
                <option value="1 - 3 times in a week">
                  1 - 3 times in a week
                </option>
                <option value="3 - 5 times in a week">
                  3 - 5 times in a week
                </option>
                <option value="5 - 7 times in a week">
                  5 - 7 times in a week
                </option>
                <option value="7 - 10 times in a week">
                  7 - 10 times in a week
                </option>
                <option value="10+ times in a week">10+ times in a week</option>
              </select>
              {errors.cookingFrequency && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cookingFrequency}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md mt-6 hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "SUBMIT APPLICATION"
              )}
            </button>
          </form>
        </div>
        <div className="w-full lg:w-1/3 p-8 bg-white shadow-lg rounded-2xl mt-8 lg:mt-0 lg:ml-8">
          <h2 className="text-4xl font-extrabold mb-6">Your order</h2>
          {selectedTitles.map((title, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-lg">{title}</span>
              <span className="text-lg font-semibold">
                {selectedPrices[index]}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-300 my-4" />
          <div className="flex justify-between font-semibold text-lg mt-4">
            <span>Subtotal</span>
            <span>
              ${calculateSubtotal(selectedPrices).monthlyTotal} /{" "}
              {calculateSubtotal(selectedPrices).maxDuration} Months
            </span>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Your personal data will be used to process your order, support your
            experience throughout the website, and for other purposes described
            in our{" "}
            <a href="#" className="text-blue-600 underline">
              Privacy policy
            </a>
            .
          </p>
        </div>
      </div>
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        data={modalState.data}
      />
      <FlushWarrantyFooter />
    </>
  );
};

export default BillingForm;
