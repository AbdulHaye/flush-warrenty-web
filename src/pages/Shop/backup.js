import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import { IoIosArrowDown } from "react-icons/io";
import { MdDelete } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import "./shop.css";
import productCards from "./product_cards";

function Shop() {
  const [openItems, setOpenItems] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(productCards.map(card => card.selectedOption));
  const [selected, setSelected] = useState(Array(productCards.length).fill(false));
  const [showDropdown, setShowDropdown] = useState(Array(productCards.length).fill(false));
  const dropdownRefs = useRef([]);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Auth check + click outside handler in same useEffect to maintain hook order
  useEffect(() => {
    // First check authorization
    const contactId = localStorage.getItem("contactId");
    if (!contactId) {
      navigate("/");
      return; // Early return if not authorized
    }
    setIsAuthorized(true);

    // Then setup click outside handler
    const handleClickOutside = (event) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target) && showDropdown[index]) {
          setShowDropdown(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate, showDropdown]);
  // Show nothing until we know if user is authorized
  if (isAuthorized === null) {
    return null;
  }

  const handleOptionChange = (index, value) => {
    setSelectedOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
    setShowDropdown(prev => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  // Find indices of the relevant components
  const getComponentIndices = () => {
    const septicMajorIndex = productCards.findIndex(card => card.title === "Septic Major Component Plan");
    const leachingFieldIndex = productCards.findIndex(card => card.title === "Leaching Field Coverage");
    const septicTankIndex = productCards.findIndex(card => card.title === "Septic Tank Coverage");
    const sewerPipeIndex = productCards.findIndex(card => card.title === "Sewer Pipe Coverage");

    return { septicMajorIndex, leachingFieldIndex, septicTankIndex, sewerPipeIndex };
  };

  const toggleSelection = (index) => {
    const { septicMajorIndex, leachingFieldIndex, septicTankIndex, sewerPipeIndex } = getComponentIndices();

    setSelected((prev) => {
      let newSelection = [...prev];

      // If Septic Major Component Plan is being toggled
      if (index === septicMajorIndex) {
        const newValue = !newSelection[septicMajorIndex];
        newSelection[septicMajorIndex] = newValue;

        // Also toggle the three related components
        newSelection[leachingFieldIndex] = newValue;
        newSelection[septicTankIndex] = newValue;
        newSelection[sewerPipeIndex] = newValue;
      }
      // If one of the three components is being toggled
      else if (index === leachingFieldIndex || index === septicTankIndex || index === sewerPipeIndex) {
        newSelection[index] = !newSelection[index];

        // If any of the three components is now false, unselect Septic Major Component Plan
        if (!newSelection[leachingFieldIndex] || !newSelection[septicTankIndex] || !newSelection[sewerPipeIndex]) {
          newSelection[septicMajorIndex] = false;
        }
        // If all three are now true, select Septic Major Component Plan
        else if (newSelection[leachingFieldIndex] && newSelection[septicTankIndex] && newSelection[sewerPipeIndex]) {
          newSelection[septicMajorIndex] = true;
        }
      }
      // For any other component
      else {
        newSelection[index] = !newSelection[index];
      }

      return newSelection;
    });
  };

  const toggle = (cardIndex, sectionIndex) => {
    setOpenItems((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === sectionIndex ? null : sectionIndex,
    }));
  };

  const handleProceed = (selectedCards, selectedPrices, selectedTitles, selectedIds) => {
    navigate('/billing', { state: { selectedCards, selectedPrices, selectedTitles, selectedIds } });
  };

  const extractPrice = (priceString) => {
    const match = priceString.match(/\$?(\d+(\.\d{1,2})?)/);
    return match ? `$${match[1]}` : priceString;
  };

  const extractDuration = (priceString) => {
    const match = priceString.match(/for (\d+) Months?/);
    return match ? `${match[1]} Months` : '';
  };

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <ul className="content-list">
          {content.map((item, idx) => (
            <li key={idx} className="content-item">{item}</li>
          ))}
        </ul>
      );
    } else if (content && typeof content === 'object') {
      return (
        <div className="section-content">
          <p className="content-paragraph">{content.paragraph}</p>
          <ul className="content-list">
            {content.bullets.map((bullet, idx) => (
              <li key={idx} className="content-item">{bullet}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="shop-container">
        <div className="shop-header">
          <h3 className="shop-title">We've got you covered.</h3>
          <p className="shop-subtitle">Available plans in: NORWALK, CT</p>
        </div>

        <div className="products-grid">
          {productCards.map((card, i) => (
            <div
              key={i}
              className={`product-card ${i === 1 ? "prominent-card" : ""}`}
            >
              {i === 1 && (
                <div className="popular-badge">Popular</div>
              )}
              <div className="card-header">
                <img className="card-image" src={card.image} alt="" />
                <div className="price-info">
                  <p className="price-label">Starting From</p>
                  <div>
                    <h3 className="price-value">
                      {extractPrice(selectedOptions[i])}/Month
                    </h3>
                    <div
                      className="price-duration-container"
                      ref={el => dropdownRefs.current[i] = el}
                    >
                      {!showDropdown[i] ? (
                        <p
                          className="price-duration"
                          onClick={() => {
                            setShowDropdown(prev => {
                              const newState = [...prev];
                              newState[i] = true;
                              return newState;
                            });
                          }}
                        >
                          Contract for {extractDuration(selectedOptions[i])}
                        </p>
                      ) : (
                        <select
                          className="price-select"
                          value={selectedOptions[i]}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          autoFocus
                        >
                          {card.pricingOptions.map((price, idx) => (
                            <option key={idx} value={price}>{price}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <p className="card-note">{card.note}</p>

              {card.sections.map((section, j) => (
                <div key={j} className="card-section">
                  <div
                    className="section-header"
                    onClick={() => toggle(i, j)}
                  >
                    <h4 className="section-title">{section.heading}</h4>
                    <IoIosArrowDown className={`section-arrow ${openItems[i] === j ? "rotated" : ""}`} />
                  </div>
                  {openItems[i] === j && renderContent(section.content)}
                </div>
              ))}

              <div className="card-actions">
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
                      onClick={() => handleProceed(
                        productCards.filter((_, idx) => selected[idx]),
                        selectedOptions.filter((_, idx) => selected[idx]),
                        productCards.filter((_, idx) => selected[idx]).map(card => card.title),
                        productCards.filter((_, idx) => selected[idx]).map(card => card.id)
                      )}
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
          ))}
        </div>
      </div>
      <FlushWarrantyFooter />
    </>
  );
}

export default Shop;