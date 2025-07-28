import React from "react";
import proprtyhouse from "../../assets/property_house_sale.png";
import underline from "../../assets/underline_image.png";
import "./propertySaleStyle.css";
import arrow from "../../assets/arrow property.png";

const PropertySale = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
  };

  return (
    <div className="property-sale-container">
      <div className="property-sale-content">
        <div className="property-image-container">
          <img
            src={proprtyhouse}
            alt="House for Sale"
            className="property-image"
          />
        </div>
        <div className="property-text-container">
          <h2 className="property-title">
            Maximize Your Property Value for Resale
          </h2>
          <div className="underline-container">
            <img src={underline} alt="Underline" className="underline-image" />
          </div>
          <p className="property-description">
            Potential homebuyers often hesitate to purchase properties with
            septic systems due to uncertainties about system longevity,
            maintenance needs, and replacement costs. Traditional septic
            inspections at the time of property transfer provide only a
            snapshot, which may flag potential future issues but don't assure
            ongoing system performance.
          </p>
          <p className="property-description">
            FLUSH Warranty addresses these concerns by offering a transferable
            policy at the same rate for new homeowners. This eliminates the need
            for buyers to spend hundreds of dollars on septic inspections that
            merely confirm the system's current functionality. Additionally,
            sellers can avoid losing potential buyers due to issues discovered
            during septic inspections, and real estate agents can facilitate
            quicker property sales.
          </p>
          <button onClick={scrollToTop} className="get-started-button">
            GET STARTED.
            <img src={arrow} className="arrow_icon_style" alt="Arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertySale;
