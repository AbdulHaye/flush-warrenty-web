import React from "react";
import Navbar from "../Navbar/navbar";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";
import AboutUsComponent from "./aboutUsComponent";

function AboutAll() {
  return (
    <>
      <div
        style={{
          padding: "25px",
          backgroundColor: "white",
        }}
      >
      
        <Navbar />
        <AboutUsComponent />
        <FlushWarrantyFooter />
      </div>
    </>
  );
}

export default AboutAll;
