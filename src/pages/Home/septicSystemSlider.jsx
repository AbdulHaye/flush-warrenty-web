import React from "react";
import underline from "../../assets/underline_image.png";
import "./septicSystemSliderStyle.css";

const SepticSystemSlider = () => {
  const items = [
    { name: "Leaching Field", price: "$15,000-$25,000" },
    { name: "Ejector Pumps", price: "$1,500-$2,000" },
    { name: "Sewer Line", price: "$2,000-$6,000" },
    // Duplicate items to fill the screen and ensure seamless looping
    { name: "Leaching Field", price: "$15,000-$25,000" },
    { name: "Ejector Pumps", price: "$1,500-$2,000" },
    { name: "Sewer Line", price: "$2,000-$6,000" },
    { name: "Leaching Field", price: "$15,000-$25,000" },
    { name: "Ejector Pumps", price: "$1,500-$2,000" },
    { name: "Sewer Line", price: "$2,000-$6,000" },
    { name: "Leaching Field", price: "$15,000-$25,000" },
    { name: "Ejector Pumps", price: "$1,500-$2,000" },
    { name: "Sewer Line", price: "$2,000-$6,000" },
  ];

  return (
    <div className="septic-slider-container">
      <h2 className="septic-slider-title">
        Breakdowns happen.
        <br />
        That's why we're here
      </h2>
      <div className="underline-container">
        <img src={underline} alt="Underline" className="underline-image" />
      </div>
      <p className="septic-slider-description">
        Here are some average cost ranges to repair or replace septic system
        components.
      </p>
      <div className="carousel-wrapper">
        <div className="carousel">
          {items.map((item, index) => (
            <div key={index} className="carousel-item">
              <p className="item-name">{item.name}</p>
              <p className="item-price">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SepticSystemSlider;
