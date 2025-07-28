import React from "react";
import underline from "../../assets/underline_image.png";
import "./flushWarrantyVideoStyle.css";

const FlushWarranty = () => {
  return (
    <div className="flush-warranty-container">
      <h2 className="flush-warranty-title">
        Flush Warranty Explained: Hassle-Free Septic Coverage
      </h2>
      <div className="flush-warranty-video-container">
        <iframe
          className="flush-warranty-video"
          src="https://www.youtube.com/embed/EdYvW3Lx0Ng"
          title="Understanding Our Flush Warranty - What You Need to Know"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="flush-warranty-underline">
        <img src={underline} alt="underline decoration" />
      </div>
    </div>
  );
};

export default FlushWarranty;
