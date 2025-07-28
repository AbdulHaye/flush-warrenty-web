import React from "react";
import Navbar from "../Navbar/navbar";
import ContactForm from "./contactForm";
import FlushWarrantyFooter from "../Footer/flushWarrantyFooter";

function ContactAll() {
  return (
    <>
      <div
        style={{
          padding: "25px",
          backgroundColor: "white",
        }}
      >
        <Navbar />
        <ContactForm />
        <FlushWarrantyFooter />
      </div>
    </>
  );
}

export default ContactAll;
