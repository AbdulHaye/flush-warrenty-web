"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import { IoIosArrowDown } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./shop.css";
import productCards from "./product_cards";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css";

// Define plan IDs consistent with Agreement page
const MAIN_PACKAGE_ID = "72V55XJap3h5hTBfw3qs";
const SUB_PACKAGE_IDS = [
  "HUe7oRoznbZ9lhH5olWw", // Leaching Field Coverage
  "PnJyfsKECatzdFkbXT4N", // Septic Tank Coverage
  "8PKKH94jrOHDhB3oq5lN", // Sewer Pipe Coverage
];

function Shop() {
  const [openItems, setOpenItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(
    Array(productCards.length).fill(false)
  );
  const [selectedDurations, setSelectedDurations] = useState(
    productCards.map((card) => {
      const match = card.selectedOption.match(/for (\d+ Months)/);
      return match ? match[1] : "36 Months";
    })
  );
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [minLoading, setMinLoading] = useState(true);
  const [locationData, setLocationData] = useState({
    zipCode: "",
    city: "",
    state: "",
    country: "",
  });
  const navigate = useNavigate();

  const zipCodeLocations = {
    "06443": { city: "Madison", state: "CT", country: "USA" },
    "06419": { city: "Killingworth", state: "CT", country: "USA" },
    "06437": { city: "Guilford", state: "CT", country: "USA" },
    "06405": { city: "Branford", state: "CT", country: "USA" },
    "06498": { city: "Westbrook", state: "CT", country: "USA" },
    "06472": { city: "North Branford", state: "CT", country: "USA" },
    "06422": { city: "Durham", state: "CT", country: "USA" },
    "06441": { city: "Higganum", state: "CT", country: "USA" },
    "06442": { city: "Ivoryton", state: "CT", country: "USA" },
    "06475": { city: "Old Saybrook", state: "CT", country: "USA" },
    "06417": { city: "Deep River", state: "CT", country: "USA" },
  };

  // Initial setup
  useEffect(() => {
    const contactId = localStorage.getItem("contactId");
    if (!contactId) {
      navigate("/");
      return;
    }
    setIsAuthorized(true);

    const savedZipCode = localStorage.getItem("lastZipCode") || "06443";
    const location = zipCodeLocations[savedZipCode] || {
      city: "Norwalk",
      state: "CT",
      country: "USA",
    };
    setLocationData({ zipCode: savedZipCode, ...location });

    const timer = setTimeout(() => {
      setLoading(false);
      setMinLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Utility functions
  const getDurations = (pricingOptions) => {
    return pricingOptions.map((option) => {
      const match = option.match(/for (\d+ Months)/);
      return match ? match[1] : "Unknown";
    });
  };

  const getPriceForDuration = (card, duration) => {
    const option = card.pricingOptions.find((opt) => opt.includes(duration));
    if (option) {
      // const match = option.match(/\$(\d+\.\d{2})/);
      const match = option.match(/\$(\d+(?:\.\d{2})?)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  };

  // Handle duration change
  const handleDurationChange = (index, duration) => {
    setSelectedDurations((prev) => {
      const newDurations = [...prev];
      newDurations[index] = duration;
      return newDurations;
    });
  };

  // Toggle plan selection with original bundling logic
  const toggleSelection = (index) => {
    setSelected((prev) => {
      let newSelection = [...prev];
      const newDurations = [...selectedDurations];

      const mainPackageIndex = productCards.findIndex(
        (card) => card.id === MAIN_PACKAGE_ID
      );
      const subIndices = SUB_PACKAGE_IDS.map((id) =>
        productCards.findIndex((card) => card.id === id)
      );

      if (index === mainPackageIndex) {
        const newValue = !newSelection[mainPackageIndex];
        newSelection[mainPackageIndex] = newValue;
        subIndices.forEach((subIndex) => {
          newSelection[subIndex] = newValue;
        });

        if (newValue) {
          const duration = newDurations[mainPackageIndex];
          subIndices.forEach((subIndex) => {
            newDurations[subIndex] = duration;
          });
        } else {
          subIndices.forEach((subIndex) => {
            const match =
              productCards[subIndex].selectedOption.match(/for (\d+ Months)/);
            newDurations[subIndex] = match ? match[1] : "36 Months";
          });
        }
      } else if (subIndices.includes(index)) {
        newSelection[index] = !newSelection[index];

        const selectedSubPackages = subIndices.filter(
          (subIndex) => newSelection[subIndex]
        );

        if (selectedSubPackages.length < subIndices.length) {
          newSelection[mainPackageIndex] = false;
          subIndices.forEach((subIndex) => {
            if (!newSelection[subIndex]) {
              const match =
                productCards[subIndex].selectedOption.match(/for (\d+ Months)/);
              newDurations[subIndex] = match ? match[1] : "36 Months";
            }
          });
        } else {
          newSelection[mainPackageIndex] = true;
          const duration = newDurations[index];
          subIndices.forEach((subIndex) => {
            newDurations[subIndex] = duration;
          });
        }
      } else {
        newSelection[index] = !newSelection[index];
      }

      setSelectedDurations(newDurations);
      return newSelection;
    });
  };

  // Handle proceeding to billing
  const handleProceed = () => {
    const mainPackageIndex = productCards.findIndex(
      (card) => card.id === MAIN_PACKAGE_ID
    );
    const isMainPackageSelected =
      mainPackageIndex !== -1 && selected[mainPackageIndex];

    const selectedCards = productCards.filter((_, idx) => selected[idx]);
    const selectedTitles = selectedCards.map((card) => card.title);
    const selectedIds = selectedCards.map((card) => card.id);
    const selectedPrices = selectedCards.map((card, idx) => {
      const isSubPlan = SUB_PACKAGE_IDS.includes(card.id);
      if (isSubPlan && isMainPackageSelected) {
        return "$0/Month";
      }
      const duration =
        selectedDurations[productCards.findIndex((c) => c.id === card.id)];
      return `$${getPriceForDuration(card, duration).toFixed(
        2
      )}/Month for ${duration}`;
    });

    navigate("/billing", {
      state: { selectedCards, selectedPrices, selectedTitles, selectedIds },
    });
  };

  // Toggle section visibility
  const toggle = (cardIndex, sectionIndex) => {
    setOpenItems((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === sectionIndex ? null : sectionIndex,
    }));
  };

  // Render section content
  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <ul className="content-list">
          {content.map((item, idx) => (
            <li key={idx} className="content-item">
              {item}
            </li>
          ))}
        </ul>
      );
    } else if (content && typeof content === "object") {
      return (
        <div className="section-content">
          <p className="content-paragraph">{content.paragraph}</p>
          <ul className="content-list">
            {content.bullets.map((bullet, idx) => (
              <li key={idx} className="content-item">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Check authorization
  if (isAuthorized === null) {
    return null;
  }

  // Loading state
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

  const mainPackageIndex = productCards.findIndex(
    (card) => card.id === MAIN_PACKAGE_ID
  );
  const isMainPackageSelected =
    mainPackageIndex !== -1 && selected[mainPackageIndex];

  return (
    <>
      <Navbar />
      <div className="shop-container">
        <div className="shop-header">
          <h3 className="shop-title">We've got you covered.</h3>
          <p className="shop-subtitle">
            Available plans in: {locationData.city}, {locationData.state}
          </p>
        </div>

        <div className="products-grid">
          {productCards.map((card, i) => {
            const isSubPlan = SUB_PACKAGE_IDS.includes(card.id);
            const showIncluded = isSubPlan && isMainPackageSelected;

            return (
              <div
                key={i}
                className={`product-card ${
                  i === 1 ? "prominent-card" : ""
                } flex flex-col min-h-[400px]`}
              >
                {i === 1 && <div className="popular-badge">Popular</div>}
                <div className="card-header">
                  <img className="card-image" src={card.image} alt="" />
                  {showIncluded ? (
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
                          $
                          {getPriceForDuration(
                            card,
                            selectedDurations[i]
                          ).toFixed(2)}
                        </h3>
                        <div className="flex items-center justify-end mt-1">
                          <label className="text-xs text-gray-600 mr-2">
                            Contract for
                          </label>
                          <select
                            value={selectedDurations[i]}
                            onChange={(e) =>
                              handleDurationChange(i, e.target.value)
                            }
                            className="text-xs text-gray-600 border rounded p-1"
                          >
                            {getDurations(card.pricingOptions).map((dur) => (
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
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <p className="card-note">{card.note}</p>

                <div className="flex-1">
                  {card.sections.map((section, j) => (
                    <div key={j} className="card-section">
                      <div
                        className="section-header"
                        onClick={() => toggle(i, j)}
                      >
                        <h4 className="section-title">{section.heading}</h4>
                        <IoIosArrowDown
                          className={`section-arrow ${
                            openItems[i] === j ? "rotated" : ""
                          }`}
                        />
                      </div>
                      {openItems[i] === j && renderContent(section.content)}
                    </div>
                  ))}
                </div>

                <div className="card-actions mt-auto">
                  {!selected[i] ? (
                    <button
                      onClick={() => toggleSelection(i)}
                      className="select-button"
                    >
                      Select Coverage
                    </button>
                  ) : (
                    <div className="actions-container">
                      <button
                        onClick={handleProceed}
                        className="proceed-button"
                      >
                        Proceed to Application
                      </button>
                      <MdDelete
                        onClick={() => toggleSelection(i)}
                        className="delete-icon"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <FlushWarrantyFooter />
    </>
  );
}

export default Shop;
