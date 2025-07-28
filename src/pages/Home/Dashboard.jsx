import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import { IoIosArrowDown } from "react-icons/io";
import productCards from "../../pages/Agreement/product_cards";
import "./Dashboard.css";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css"; // Import your loader CSS

function Dashboard() {
  const [contactData, setContactData] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const contactId = localStorage.getItem("contactId");
  const [minLoading, setMinLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("contactId"); // Clear contactId from localStorage
    navigate("/my-account"); // Redirect to login page
  };

  useEffect(() => {
    const fetchContactData = async () => {
      if (!contactId) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
            },
          }
        );
        setContactData(response.data.contact);
        const pdfField = response.data.contact.customField?.find(
          (f) => f.id === "SQve6zC3OD09c0tyTCH0"
        );

        const valueObj = pdfField?.value;
        const uuidKey = valueObj && Object.keys(valueObj)[0];
        const pdfData = uuidKey && valueObj[uuidKey];
        const pdfUrll = pdfData?.url;
        setPdfUrl(pdfUrll || ""); // Set pdfUrl or empty string if undefined

        console.log("PDF URL:", pdfUrll);
      } catch (err) {
        setError("Error fetching user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();

    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 3000); // 2000ms = 2 seconds

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [contactId]);

  const getCustomFieldValue = (fieldId) => {
    if (!contactData?.customField) return null;
    const field = contactData.customField.find((f) => f.id === fieldId);
    return field ? field.value : null;
  };

  const extractPrice = (cardId) => {
    if (!contactData?.customField) return 0;
    const durationField = contactData.customField.find((f) => f.id === cardId);
    const duration = durationField?.value || "36 Months";
    const card = productCards.find((c) => c.id === cardId);
    const priceFieldId = card?.priceFieldIds[duration];
    if (!priceFieldId) return 0;
    const priceField = contactData.customField.find(
      (f) => f.id === priceFieldId
    );
    return priceField ? parseFloat(priceField.value) : 0;
  };

  const extractDuration = (cardId) => {
    if (!contactData?.customField) return "36 Months";
    const durationField = contactData.customField.find((f) => f.id === cardId);
    return durationField?.value || "36 Months";
  };

  const toggle = (cardIndex, sectionIndex) => {
    setOpenItems((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === sectionIndex ? null : sectionIndex,
    }));
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

  const handlePrint = () => {
    if (document.getElementById("pdfIframe")) {
      document.getElementById("pdfIframe").contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "contract.pdf";
      link.click();
    } else {
      alert("No PDF available to download.");
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

  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!contactData)
    return <div className="text-center">No contact data available</div>;

  const filteredProductCards = productCards.filter((card) => {
    const fieldValue = getCustomFieldValue(card.id);
    return fieldValue && fieldValue.includes("Months");
  });

  return (
    <>
      <Navbar />
      <div className="w-full max-w-screen-lg mx-auto mt-[80px] px-[30px] xl:px-0">
        <div className="relative">
          <h3 className="dashboard-title">My Dashboard</h3>
          {/* Logout Button - Positioned better */}
          <button onClick={handleLogout} className="dashboard-logout-btn">
            Logout
          </button>
        </div>

        <div className="px-[30px] xl:px-0">
          <h4 className="text-3xl font-bold mb-6 text-center">Plan Details</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 px-8 mx-auto justify-center">
            {filteredProductCards.map((card, i) => {
              const duration = extractDuration(card.id);
              const price = extractPrice(card.id);
              return (
                <div
                  key={i}
                  className="relative p-6 bg-[#f7fbff] rounded-2xl shadow-lg border border-blue-500 w-[300px] mx-auto hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col min-h-[400px]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <img
                      className="w-12 h-12"
                      src={card.image}
                      alt={card.title}
                    />
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Starting From</p>
                      <h3 className="text-3xl font-bold text-gray-900">
                        ${price.toFixed(2)}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Contract for {duration}
                      </p>
                    </div>
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
                  <div className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium text-center mt-auto">
                    Selected
                  </div>
                </div>
              );
            })}
          </div>

          <h4 className="text-3xl font-bold mb-6 text-center mt-12">
            Contract Details
          </h4>
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="btn btn-primary"
            >
              {showPdf ? "Hide Contract" : "View Contract"}
            </button>
            <button onClick={handleDownload} className="btn btn-secondary">
              Download Contract
            </button>
            {showPdf && pdfUrl && (
              <button onClick={handlePrint} className="btn btn-primary">
                Print Preview
              </button>
            )}
          </div>
          {showPdf && pdfUrl ? (
            <div className="pdf-preview-container mb-8">
              <iframe
                id="pdfIframe"
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="Contract PDF"
              />
            </div>
          ) : showPdf ? (
            <p className="text-red-600 text-center">
              No contract PDF available
            </p>
          ) : null}
        </div>
      </div>
      <FlushWarrantyFooter />
    </>
  );
}

export default Dashboard;
