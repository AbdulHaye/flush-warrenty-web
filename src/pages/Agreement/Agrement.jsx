import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import qs from "qs";
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import SignaturePad from "react-signature-pad-wrapper";
import "./agreement.css";
import PdfViewer from "./PdfViewer";
import productCards from "./product_cards";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css";
import debounce from "lodash.debounce";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Define plan IDs consistent across components
const MAIN_PACKAGE_ID = "72V55XJap3h5hTBfw3qs";
const SUB_PACKAGE_IDS = [
  "HUe7oRoznbZ9lhH5olWw", // Leaching Field Coverage
  "PnJyfsKECatzdFkbXT4N", // Septic Tank Coverage
  "8PKKH94jrOHDhB3oq5lN", // Sewer Pipe Coverage
];

// Function to fetch token from GHL Custom Values
const fetchTokenFromGHL = async () => {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_SERVER_BASE_URL
      }/api/custom-values/ZKXV4IYMT4uPQkQ0GV3G`
    );
    let tokenData = JSON.parse(response.data.value);
    if (!tokenData.expiresAt && tokenData.expires_in) {
      tokenData.expiresAt = Date.now() + tokenData.expires_in * 1000;
    }
    return tokenData;
  } catch (error) {
    console.error("Failed to fetch token from GHL:", error);
    throw error;
  }
};

// Function to update token in GHL Custom Values
const updateTokenInGHL = async (newTokenData) => {
  try {
    await axios.put(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/custom-values/ZKXV4IYMT4uPQkQ0GV3G`,
      {
        value: JSON.stringify(newTokenData),
      }
    );
  } catch (error) {
    console.error("Failed to update token in GHL:", error);
    throw error;
  }
};

// Function to refresh token
const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/refresh-token`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const newTokens = response.data;
    newTokens.expiresAt = Date.now() + newTokens.expires_in * 1000;
    return newTokens;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

// Function to get a valid access token
const getValidToken = async (tokenData, setTokenData, fallbackToken) => {
  if (!tokenData) {
    tokenData = await fetchTokenFromGHL(fallbackToken);
    setTokenData(tokenData);
  }
  return tokenData.access_token;
};

// Signature Component
const SignatureComponent = ({ onSave }) => {
  const signaturePadRef = useRef(null);

  const handleClear = () => {
    signaturePadRef.current.clear();
  };

  const handleSave = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert("Please provide a signature first");
      return;
    }
    const signatureData = signaturePadRef.current.toDataURL();
    onSave(signatureData);
  };

  return (
    <div className="signature-container">
      <div className="signature-pad-container">
        <SignaturePad
          ref={signaturePadRef}
          options={{ penColor: "black" }}
          canvasProps={{ className: "signature-canvas" }}
        />
      </div>
      <div className="signature-buttons">
        <button onClick={handleClear} className="btn btn-secondary">
          Clear
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          Save Signature
        </button>
      </div>
    </div>
  );
};

function Agreement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [selected, setSelected] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [totalPayment, setTotalPayment] = useState(0);
  const [modifiedPdfBytes, setModifiedPdfBytes] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minLoading, setMinLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [editableFields, setEditableFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    billingName: "",
    billingAddress: "",
    billingPhone: "",
    billingEmail: "",
  });

  // Ref to store pending updates
  const pendingUpdatesRef = useRef({});

  // Environment variables
  const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID;
  const fallbackToken = import.meta.env.VITE_GHL_FILE_UPLOAD_TOKEN;

  // Initialize token on mount
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const initialToken = await fetchTokenFromGHL(fallbackToken);
        setTokenData(initialToken);
      } catch (error) {
        console.error("Failed to initialize token:", error);
        setError("Failed to fetch token from GHL");
      }
    };
    initializeToken();
  }, []);

  // Fetch contact data and initialize states
  const fetchContactData = async () => {
    if (!id) {
      setError("No contact ID provided");
      setLoading(false);
      return;
    }
    try {
      const accessToken = await getValidToken(
        tokenData,
        setTokenData,
        fallbackToken
      );
      const response = await axios.get(
        `https://rest.gohighlevel.com/v1/contacts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          },
        }
      );
      const contact = response.data.contact;
      setContactData(contact);

      // Initialize editable fields
      let customFieldData = contact.customField || [];
      setEditableFields({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address1: contact.address1 || "",
        billingName:
          customFieldData.find((f) => f.id === "cdPUpkv4BxtoDeJiV7QZ")?.value ||
          "",
        billingAddress:
          customFieldData.find((f) => f.id === "ajt8ZWrwYbwHk1c3ygsD")?.value ||
          "",
        billingPhone:
          customFieldData.find((f) => f.id === "KQ5UIyIMEvMDSi9JISjp")?.value ||
          "",
        billingEmail:
          customFieldData.find((f) => f.id === "giKvkQYHEA7fgjyz2E3Y")?.value ||
          "",
      });

      // Filter product cards and initialize selected states
      const filteredCards = productCards.filter((card) => {
        const fieldValue = getCustomFieldValue(card.id);
        return fieldValue && fieldValue.includes("Months");
      });
      setSelected(Array(filteredCards.length).fill(true));

      // Initialize durations
      const initialDurations = {};
      filteredCards.forEach((card) => {
        const fieldValue = getCustomFieldValue(card.id);
        const availableDurations = Object.keys(card.priceFieldIds);
        if (fieldValue && fieldValue.includes("Months")) {
          if (availableDurations.includes(fieldValue)) {
            initialDurations[card.id] = fieldValue;
          } else if (availableDurations.length > 0) {
            initialDurations[card.id] = availableDurations[0];
          } else {
            initialDurations[card.id] = "36 Months";
          }
        }
      });
      setSelectedDurations(initialDurations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
    const timer = setTimeout(() => setMinLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [id, tokenData]);

  // Update contact with batched changes
  const updateContact = async () => {
    const pendingUpdates = { ...pendingUpdatesRef.current };
    if (Object.keys(pendingUpdates).length === 0) return;

    const payload = {};
    const customFields = [];

    Object.keys(pendingUpdates).forEach((field) => {
      const value = pendingUpdates[field];
      if (
        ["firstName", "lastName", "email", "phone", "address1"].includes(field)
      ) {
        payload[field] = value;
      } else {
        let customFieldId;
        switch (field) {
          case "billingName":
            customFieldId = "cdPUpkv4BxtoDeJiV7QZ";
            break;
          case "billingAddress":
            customFieldId = "ajt8ZWrwYbwHk1c3ygsD";
            break;
          case "billingPhone":
            customFieldId = "KQ5UIyIMEvMDSi9JISjp";
            break;
          case "billingEmail":
            customFieldId = "giKvkQYHEA7fgjyz2E3Y";
            break;
          default:
            return;
        }
        customFields.push({ id: customFieldId, value });
      }
    });

    if (customFields.length > 0) {
      payload.customField = customFields;
    }

    try {
      const accessToken = await getValidToken(
        tokenData,
        setTokenData,
        fallbackToken
      );
      await axios.put(
        `https://rest.gohighlevel.com/v1/contacts/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      setContactData((prev) => {
        const newData = { ...prev };
        Object.keys(pendingUpdates).forEach((field) => {
          if (
            ["firstName", "lastName", "email", "phone", "address1"].includes(
              field
            )
          ) {
            newData[field] = pendingUpdates[field];
          } else {
            const customFieldId = getCustomFieldId(field);
            if (customFieldId) {
              const index = newData.customField.findIndex(
                (f) => f.id === customFieldId
              );
              if (index !== -1) {
                newData.customField[index].value = pendingUpdates[field];
              } else {
                newData.customField.push({
                  id: customFieldId,
                  value: pendingUpdates[field],
                });
              }
            }
          }
        });
        return newData;
      });

      pendingUpdatesRef.current = {};
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  // Debounced update function
  const debouncedUpdate = useCallback(debounce(updateContact, 1000), [
    id,
    tokenData,
    setTokenData,
    fallbackToken,
  ]);

  // Upload signature and PDF with token refresh
  const uploadFiles = async () => {
    if (!signatureData || !modifiedPdfBytes) {
      throw new Error("Signature or PDF not available");
    }
    const signatureBlob = await fetch(signatureData).then((res) => res.blob());
    const pdfBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("SQve6zC3OD09c0tyTCH0", pdfBlob, "contract.pdf");
    formData.append("vqQ4QmImBvhSqJuQmOZ5", signatureBlob, "signature.png");

    const uploadUrl = `https://services.leadconnectorhq.com/forms/upload-custom-files?contactId=${id}&locationId=${GHL_LOCATION_ID}`;
    const refreshThreshold = 4 * 60 * 60 * 1000;
    const currentTime = Date.now();
    let accessToken;

    if (
      !tokenData ||
      !tokenData.expiresAt ||
      currentTime >= tokenData.expiresAt
    ) {
      try {
        const newTokenData = await refreshToken(tokenData?.refresh_token || "");
        await updateTokenInGHL(newTokenData);
        setTokenData(newTokenData);
        accessToken = newTokenData.access_token;
      } catch (error) {
        throw new Error("Token refresh failed: " + error.message);
      }
    } else if (tokenData.expiresAt - currentTime <= refreshThreshold) {
      try {
        const newTokenData = await refreshToken(tokenData.refresh_token);
        await updateTokenInGHL(newTokenData);
        setTokenData(newTokenData);
        accessToken = newTokenData.access_token;
      } catch (error) {
        throw new Error("Token refresh failed: " + error.message);
      }
    } else {
      accessToken = tokenData.access_token;
    }

    try {
      await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          Version: "2021-07-28",
        },
      });
    } catch (error) {
      throw new Error("File upload failed: " + error.message);
    }
  };

  const handlePayout = async () => {
    if (!signatureData) {
      alert("Please provide and save a signature before proceeding.");
      return;
    }
    if (!pdfReady) {
      alert("PDF is still processing. Please wait.");
      return;
    }
    setIsPaymentProcessing(true);
    const selectedPlans = filteredProductCards
      .filter((card, index) => selected[index])
      .map((card) => {
        const duration = selectedDurations[card.id] || "36 Months";
        const price = extractPrice(card.id, duration);
        return {
          id: card.id,
          title: card.title,
          price: `$${price.toFixed(2)}/Month for ${duration}`,
          monthlyCost: price,
          duration,
        };
      });
    try {
      await uploadFiles();
      navigate("/payment-method", {
        state: { selectedPlans, totalPayment, contactData: editableFields },
      });
    } catch (error) {
      alert(`Failed to upload files: ${error.message}`);
      setIsPaymentProcessing(false);
    }
  };

  const getCustomFieldValue = (fieldId) => {
    if (!contactData?.customField) return null;
    const field = contactData.customField.find((f) => f.id === fieldId);
    return field ? field.value : null;
  };

  const handleFieldChange = (field, value) => {
    setEditableFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    if (editableFields[field] !== getFieldValue(field)) {
      pendingUpdatesRef.current[field] = editableFields[field];
      debouncedUpdate();
    }
  };

  const getFieldValue = (field) => {
    switch (field) {
      case "firstName":
      case "lastName":
      case "email":
      case "phone":
      case "address1":
        return contactData?.[field] || "";
      case "billingName":
        return (
          contactData?.customField?.find((f) => f.id === "cdPUpkv4BxtoDeJiV7QZ")
            ?.value || ""
        );
      case "billingAddress":
        return (
          contactData?.customField?.find((f) => f.id === "ajt8ZWrwYbwHk1c3ygsD")
            ?.value || ""
        );
      case "billingPhone":
        return (
          contactData?.customField?.find((f) => f.id === "KQ5UIyIMEvMDSi9JISjp")
            ?.value || ""
        );
      case "billingEmail":
        return (
          contactData?.customField?.find((f) => f.id === "giKvkQYHEA7fgjyz2E3Y")
            ?.value || ""
        );
      default:
        return "";
    }
  };

  const getCustomFieldId = (field) => {
    switch (field) {
      case "billingName":
        return "cdPUpkv4BxtoDeJiV7QZ";
      case "billingAddress":
        return "ajt8ZWrwYbwHk1c3ygsD";
      case "billingPhone":
        return "KQ5UIyIMEvMDSi9JISjp";
      case "billingEmail":
        return "giKvkQYHEA7fgjyz2E3Y";
      default:
        return null;
    }
  };

  const getPriceForPlan = (cardId, duration) => {
    if (!contactData?.customField) return 0;
    const card = productCards.find((c) => c.id === cardId);
    if (!card || !card.priceFieldIds) return 0;
    const priceFieldId = card.priceFieldIds[duration];
    if (!priceFieldId) return 0;
    const priceField = contactData.customField.find(
      (f) => f.id === priceFieldId
    );
    return priceField ? parseFloat(priceField.value) || 0 : 0;
  };

  const extractPrice = (cardId, duration) => {
    const mainPackageIndex = filteredProductCards.findIndex(
      (card) => card.id === MAIN_PACKAGE_ID
    );
    const isMainPackageSelected =
      mainPackageIndex !== -1 && selected[mainPackageIndex];
    if (SUB_PACKAGE_IDS.includes(cardId) && isMainPackageSelected) return 0;
    return getPriceForPlan(cardId, duration);
  };

  const handleDurationChange = (cardId, duration) => {
    setSelectedDurations((prev) => ({ ...prev, [cardId]: duration }));
  };

  const filteredProductCards = productCards.filter((card) => {
    const fieldValue = getCustomFieldValue(card.id);
    return fieldValue && fieldValue.includes("Months");
  });

  useEffect(() => {
    const mainPackageIndex = filteredProductCards.findIndex(
      (card) => card.id === MAIN_PACKAGE_ID
    );
    const isMainPackageSelected =
      mainPackageIndex !== -1 && selected[mainPackageIndex];
    const total = filteredProductCards
      .filter((card, index) => selected[index])
      .reduce((sum, card) => {
        if (isMainPackageSelected && SUB_PACKAGE_IDS.includes(card.id))
          return sum;
        const duration = selectedDurations[card.id] || "36 Months";
        return sum + extractPrice(card.id, duration);
      }, 0);
    setTotalPayment(total);
  }, [selected, selectedDurations, filteredProductCards, contactData]);

  const toggle = (cardIndex, sectionIndex) => {
    setOpenItems((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === sectionIndex ? null : sectionIndex,
    }));
  };

  const toggleSelection = (index) => {
    const selectedCount = selected.filter((isSelected) => isSelected).length;
    if (selectedCount <= 1 && selected[index]) {
      alert("At least one plan must remain selected");
      return;
    }

    const mainPackageIndex = filteredProductCards.findIndex(
      (card) => card.id === MAIN_PACKAGE_ID
    );
    const subIndices = SUB_PACKAGE_IDS.map((id) =>
      filteredProductCards.findIndex((card) => card.id === id)
    ).filter((idx) => idx !== -1);

    setSelected((prev) => {
      const newSelected = [...prev];

      if (index === mainPackageIndex) {
        const newValue = !newSelected[mainPackageIndex];
        newSelected[mainPackageIndex] = newValue;
        subIndices.forEach((subIndex) => {
          newSelected[subIndex] = newValue;
        });
      } else if (subIndices.includes(index)) {
        newSelected[index] = !newSelected[index];
        const selectedSubPackages = subIndices.filter(
          (subIndex) => newSelected[subIndex]
        );
        if (selectedSubPackages.length < subIndices.length) {
          newSelected[mainPackageIndex] = false;
        } else {
          newSelected[mainPackageIndex] = true;
        }
      } else {
        newSelected[index] = !newSelected[index];
      }

      return newSelected;
    });
  };

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-5">
          {content.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700 mb-1">
              {item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof content === "object" && content.paragraph) {
      return (
        <div>
          <p className="text-sm text-gray-700 mb-2">{content.paragraph}</p>
          <ul className="list-disc pl-5">
            {content.bullets.map((bullet, idx) => (
              <li key={idx} className="text-sm text-gray-700 mb-1">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return <p className="text-sm text-gray-700">{content}</p>;
  };

  const handleDownload = () => {
    if (!modifiedPdfBytes) {
      alert("PDF is not ready yet. Please wait.");
      return;
    }
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "septic_service_agreement.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfModified = (pdfBytes) => {
    setModifiedPdfBytes(pdfBytes);
    setPdfReady(true);
  };

  const mainPackageIndex = filteredProductCards.findIndex(
    (card) => card.id === MAIN_PACKAGE_ID
  );
  const isMajorPlanSelected =
    mainPackageIndex !== -1 && selected[mainPackageIndex];

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

  if (error) {
    return (
      <>
        <Navbar />
        <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!contactData) {
    return (
      <>
        <Navbar />
        <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
          <div className="text-center">
            <p>No contact data found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
        <div className="text-center mb-[50px]">
          <h3 className="text-[32px] font-bold leading-[44px] mb-[15px] text-black">
            Agreement Information
          </h3>
        </div>

        <div className="agreement-container">
          <div>
            <h2 className="heading">Contact Details</h2>
            <div id="details" className="details">
              <p>
                <strong>First Name:</strong>
                <input
                  type="text"
                  value={editableFields.firstName}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                  onBlur={() => handleBlur("firstName")}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Last Name:</strong>
                <input
                  type="text"
                  value={editableFields.lastName}
                  onChange={(e) =>
                    handleFieldChange("lastName", e.target.value)
                  }
                  onBlur={() => handleBlur("lastName")}
                  className="editable-input"
                />
              </p>
              <p className="user-email-new">
                <strong>Email:</strong>
                <input
                  type="email"
                  value={editableFields.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Phone:</strong>
                <input
                  type="text"
                  value={editableFields.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Address:</strong>
                <input
                  type="text"
                  value={editableFields.address1}
                  onChange={(e) =>
                    handleFieldChange("address1", e.target.value)
                  }
                  onBlur={() => handleBlur("address1")}
                  className="editable-input"
                />
              </p>
            </div>
          </div>
          <div>
            <h2 className="heading">Billing Information</h2>
            <div id="details" className="details">
              <p>
                <strong>Full Name:</strong>
                <input
                  type="text"
                  value={editableFields.billingName}
                  onChange={(e) =>
                    handleFieldChange("billingName", e.target.value)
                  }
                  onBlur={() => handleBlur("billingName")}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Address:</strong>
                <input
                  type="text"
                  value={editableFields.billingAddress}
                  onChange={(e) =>
                    handleFieldChange("billingAddress", e.target.value)
                  }
                  onBlur={() => handleBlur("billingAddress")}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Phone:</strong>
                <input
                  type="text"
                  value={editableFields.billingPhone}
                  onChange={(e) =>
                    handleFieldChange("billingPhone", e.target.value)
                  }
                  onBlur={() => handleBlur("billingPhone")}
                  className="editable-input"
                />
              </p>
              <p className="user-email-new">
                <strong>Email:</strong>
                <input
                  type="text"
                  value={editableFields.billingEmail}
                  onChange={(e) =>
                    handleFieldChange("billingEmail", e.target.value)
                  }
                  onBlur={() => handleBlur("billingEmail")}
                  className="editable-input"
                />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Verify Your Plan Details
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 px-8 mx-auto justify-center">
            {filteredProductCards.map((card, i) => {
              const duration = selectedDurations[card.id] || "36 Months";
              const price = extractPrice(card.id, duration);
              const durationOptions = Object.keys(card.priceFieldIds);
              const isSubPlan = SUB_PACKAGE_IDS.includes(card.id);

              return (
                <div
                  key={i}
                  className={`relative p-6 bg-[#f7fbff] rounded-2xl shadow-lg border ${
                    selected[i] ? "border-blue-500" : "border-gray-300"
                  } w-[300px] mx-auto hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col min-h-[400px]`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <img
                      className="w-12 h-12"
                      src={card.image}
                      alt={card.title}
                    />
                    {isMajorPlanSelected && isSubPlan ? (
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">
                          Included in Major Plan
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Starting From</p>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-900">
                            ${price.toFixed(2)}
                          </h3>
                          <div className="flex items-center justify-end mt-1">
                            <label className="text-xs text-gray-600 mr-2">
                              Contract for
                            </label>
                            <select
                              value={duration}
                              onChange={(e) =>
                                handleDurationChange(card.id, e.target.value)
                              }
                              className="text-xs text-gray-600 border rounded p-1"
                            >
                              {durationOptions.map((dur) => (
                                <option key={dur} value={dur}>
                                  {dur}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-blue-600 text-lg font-medium mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-800 text-sm mb-1">
                    {card.description}
                  </p>
                  <div className="flex-1">
                    {card.sections.map((section, j) => (
                      <div key={j} className="border-t border-gray-300 py-3">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggle(i, j)}
                        >
                          <h4 className="text-lg font-semibold text-gray-900">
                            {section.heading}
                          </h4>
                          <IoIosArrowDown
                            className={`transform transition-transform duration-300 ${
                              openItems[i] === j ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        {openItems[i] === j && (
                          <div className="mt-2">
                            {renderContent(section.content)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleSelection(i)}
                    className={`w-full py-2 rounded-lg font-medium mt-auto ${
                      selected[i] ? "proceed-button" : "select-button"
                    }`}
                  >
                    {selected[i] ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Contract Finalization
          </h2>
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowPdfPreview(!showPdfPreview)}
              className="btn btn-primary"
            >
              {showPdfPreview ? "Hide Contract" : "View Contract"}
            </button>
          </div>
          {showPdfPreview && (
            <div className="pdf-preview-container mb-8">
              <PdfViewer
                contactData={contactData}
                signatureData={signatureData}
                onPdfModified={handlePdfModified}
                selected={selected}
                filteredProductCards={filteredProductCards}
                selectedDurations={selectedDurations}
              />
            </div>
          )}
          <div className="signature-section">
            <h3 className="text-xl text-center font-semibold mb-4">
              Add Your Signature
            </h3>
            <SignatureComponent onSave={setSignatureData} />
            {signatureData && (
              <div className="mt-4">
                <p className="text-green-600 text-center">
                  Signature saved successfully!
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {!signatureData && (
              <div className="text-red-600 text-center">
                Please enter and save your signature before proceeding to
                payment.
              </div>
            )}
            {!pdfReady && showPdfPreview && (
              <div className="text-yellow-600 text-center">
                PDF is being processed. Please wait.
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
              <div className="text-xl font-semibold">
                Total Payment:{" "}
                <span className="text-blue-600">
                  ${totalPayment.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handlePayout}
                className={`btn px-6 py-3 text-lg ${
                  totalPayment === 0 ||
                  !signatureData ||
                  !pdfReady ||
                  isPaymentProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
                disabled={
                  totalPayment === 0 ||
                  !signatureData ||
                  !pdfReady ||
                  isPaymentProcessing
                }
              >
                {isPaymentProcessing ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <FlushWarrantyFooter />
      {isPaymentProcessing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "#1f78bc" }}
        >
          <Loader />
        </div>
      )}
    </>
  );
}

export default Agreement;
