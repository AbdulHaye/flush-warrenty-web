import React from "react";
import underline from "../../assets/underline_image.png";
import one from "../../assets/icons-1.png";
import two from "../../assets/icons-2.png";
import three from "../../assets/image_3.png";
import four from "../../assets/image_4.png";
import five from "../../assets/image_5.png";
import six from "../../assets/image_6.png";
import "./howItWorksStyle.css";

const steps = [
  {
    number: "01",
    title: "Initial Inspection and Pumping",
    description:
      "We start by pumping and inspecting your septic system to gauge its current state. This crucial first step ensures we have a comprehensive understanding of your system's condition.",
    icon: one,
  },
  {
    number: "02",
    title: "Coverage Options",
    description:
      "After inspecting your septic system, we provide detailed feedback on its status and outline the various coverage plans you qualify for, ensuring you are fully informed about your system's health and protection options.",
    icon: two,
  },
  {
    number: "03",
    title: "Scheduled Septic Tank Cleaning",
    description:
      "When it's time for your septic tank to be cleaned, we coordinate with you to schedule a convenient date. We then contract a reputable local company to perform the service, ensuring the job is done efficiently and effectively.",
    icon: three,
  },
  {
    number: "04",
    title: "Routine Maintenance",
    description:
      "Regular checks and maintenance help keep your septic system in optimal condition, avoiding costly repairs.",
    icon: four,
  },
  {
    number: "05",
    title: "Emergency Services",
    description:
      "In case of unexpected issues, our team is available to resolve problems promptly and professionally.",
    icon: five,
  },
  {
    number: "06",
    title: "Documentation and Reports",
    description:
      "We provide detailed reports of the inspection, maintenance, and cleaning processes, ensuring you have a complete record.",
    icon: six,
  },
];

const HowItWorks = () => {
  return (
    <>
      <div className="how-it-works-container">
        <div id="how-it-works" className="how-it-works-content">
          <h2 className="how-it-works-title">How it Works</h2>
          <div className="underline-container">
            <img src={underline} alt="underline" className="underline-image" />
          </div>
        </div>
      </div>

      <div className="how-it-works-container1">
      <div className="how-it-works-content1">
       <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className={index % 2 === 0 ? "step-number" : "step-number1"}>
                {step.number}
              </div>
              <div className="step-icon-container">
                <img src={step.icon} alt="step icon" className="step-icon" />
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
