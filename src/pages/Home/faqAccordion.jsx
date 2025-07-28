import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import "./FAQAccordion.css";
import twoline from ".././../assets/underline_image.png";
const faqData = [
  {
    question: "What is a Septic Warranty?",
    answer:
      "A septic warranty is a service agreement designed to shield homeowners from the expenses associated with unexpected repairs of their septic system. It covers breakdowns due to normal wear and tear, ensuring protection against high maintenance costs.",
  },
  {
    question: "I Have Home Owners Insurance. Why Do I Need a Septic Warranty?",
    answer:
      "Homeowner’s insurance typically does not cover septic system failures, which are more likely to occur over time due to wear and tear. A septic warranty fills this gap.",
  },
  {
    question: "Does This Include Septic Tank Pumpouts?",
    answer:
      "All of our policies offer the option to include routine service in the contract. We will arrange for a local company to maintain a proper cleaning schedule for your septic tank. Additionally, we will report each completed service to your local health officials.",
  },
  {
    question:
      "Do I Need a Septic Inspection Before Purchasing a Septic Warranty?",
    answer:
      "Yes, an inspection of your septic system is required before purchasing a warranty. This ensures that all components are in good working order and eligible for coverage.",
  },
  {
    question: "When Does Coverage Begin And End?",
    answer:
      "Coverage begins immediately after the septic inspection is completed. The duration of coverage depends on the policy you select. We offer options for 3, 6, and 9-year policies.",
  },
  {
    question: "What If I Need Service?",
    answer:
      "If you require service, you can submit a claim via our website at any time—24 hours a day, 7 days a week. Our call center is also available around the clock to assist you. We will coordinate with a local company to diagnose the issue and implement a solution..",
  },
  {
    question: "What If I Sell My House?",
    answer:
      "Our contracts are fully transferable to the next homeowner at the same rate. Please notify us at least 30 days before you sell your house. We can then transfer the policy to the new owners if they choose to continue with the coverage.",
  },
  {
    question: "Can I Cancel At Anytime?",
    answer:
      "Yes, you can cancel your warranty at any time. Our goal is to provide you with peace of mind, and we do not want our customers to feel locked into an agreement.",
  },
];

const FAQAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <div id="faq" className="faq-container">
        <div className="faq-content">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="underline-container1">
            <img
              src={twoline}
              alt="underline decoration"
              className="underline-image1"
            />
          </div>
        </div>
      </div>

      <div className="faq-container1">
        <div className="faq-content">
          <div className="faq-items">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  onClick={() => toggleAccordion(index)}
                  className={`faq-question ${
                    activeIndex === index ? "active" : ""
                  }`}
                >
                  {item.question}
                  {activeIndex === index ? (
                    <Minus className="faq-icon" />
                  ) : (
                    <Plus className="faq-icon" />
                  )}
                </button>
                {activeIndex === index && (
                  <div className="faq-answer">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQAccordion;
