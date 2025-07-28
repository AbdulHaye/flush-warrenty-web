
import iconOne from "../../assets/iconOne.png";
import iconTwo from "../../assets/iconTwo.png";
import iconThree from "../../assets/iconThree.png";
import iconFour from "../../assets/iconFour.png";
import iconFive from "../../assets/iconFive.png";
import iconSix from "../../assets/iconSix.png";

const productCards = [
  {
    id: "Wv9QwWG0VpcIUBsDk08J",
    image: iconFour,
    // title: "Routine Pumping",
    title: "Maintenance Plan",
    startingPrice: "$12.00/Month",
    selectedOption: "$12.00/Month for 36 Months",
    pricingOptions: [
      "$12.00/Month for 36 Months",
      "$17.00/Month for 24 Months",
    ],
    description:
      "Provides regular septic maintenance and essential services to prevent costly emergencies, with priority service for faster response times.",
    note: "Eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "$12/month: Includes pumping every three years.",
          "$17/month: Includes pumping every two years."
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Routine maintenance prevents system failures and costly emergency repairs. Pumping, snaking, and cleaning services ensure your system remains efficient and functional without unexpected expenses. With priority service, you receive faster response times when you need assistance.",
          bullets: [
            // "Repair or replacement of leaching field pipes.",
            // "Replacement of failed distribution boxes.",
            // "Repairs addressing soil absorption issues.",
            // "Includes all materials and labor required for covered repairs or replacements.",
            // "Transferability: Coverage can be transferred to the next homeowner.",
            "Routine septic tank pumping (frequency based on selected monthly rate)",
            "Notifications sent prior to scheduled service",
            "Water jetting inlet and outlet if access is possible",
            "No emergency service fees",
            "Fiber optic camera scoping",
            "Filter cleaning",
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          // "No Deductible: Routine pumping and maintenance services do not require a deductible.",
          "No Deductible: Maintenance Plan and maintenance services do not require a deductible.",
          "Eligibility contingent on inspection."
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
  {
    id: "72V55XJap3h5hTBfw3qs",
    image: iconTwo,
    title: "Septic Major Component Plan",
    startingPrice: "$19.99/Month",
    selectedOption: "$19.99/Month for 36 Months",
    pricingOptions: [
      "$19.99/Month for 36 Months",
      "$24.99/Month for 72 Months",
      "$34.99/Month for 108 Months",
    ],
    description:
      "Comprehensive protection for your septic system, covering all major components at an affordable monthly rate.",
    note: "Final pricing and eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "Starting Price: $25/month",
          "Final price and eligibility determined after inspection.",
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Septic system repairs can quickly add up to tens of thousands of dollars. This package combines protection for critical components like sewer pipes, septic tanks, leaching fields, and ejector pumps into one simple, cost-effective plan.",
          bullets: [
            "Sewer Pipe Coverage",
            "Septic Tank Coverage",
            "Leaching Field Coverage",
            "Ejector Pump Coverage",
            "Transferability: Coverage can be transferred to the next homeowner",
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          "Deductible: $1,250 per claim.",
          "Maximum Coverage Limit: $25,000 (applies across all covered components).",
          "Final pricing and eligibility contingent on inspection.",
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
  {
    id: "HUe7oRoznbZ9lhH5olWw",
    image: iconOne,
    title: "Leaching Field Coverage",
    startingPrice: "$14.99/Month",
    selectedOption: "$14.99/Month for 36 Months",
    pricingOptions: [
      "$14.99/Month for 36 Months",
      "$19.99/Month for 72 Months",
      "$29.99/Month for 108 Months",
    ],
    description:
      "Protects against failures in the leaching field and related issues.",
    note: "Final pricing and eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "Starting Price: $18/month",
          "Final price and eligibility determined after inspection.",
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Leaching field repairs or replacements can cost $20,000 or more. Leaching systems typically last 25–40 years. This coverage protects you from unexpected expenses and ensures you’re not paying out-of-pocket for major repairs.",
          bullets: [
            "Repair or replacement of leaching field pipes.",
            "Replacement of failed distribution boxes.",
            "Repairs addressing soil absorption issues.",
            "Includes all materials and labor required for covered repairs or replacements.",
            "Transferability: Coverage can be transferred to the next homeowner.",
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          "Deductible: $1,250 per claim.",
          "Maximum Coverage Limit: $25,000.",
          "Final pricing and eligibility contingent on inspection.",
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
  {
    id: "pB5QCDKDTNbtl9H38vMz",
    image: iconThree,
    title: "Ejector Pump Coverage",
    startingPrice: "$4.99/Month",
    selectedOption: "$4.99/Month for 36 Months",
    pricingOptions: [
      "$4.99/Month for 36 Months",
      "$7.99/Month for 72 Months",
      "$10.99/Month for 108 Months",
    ],
    description:
      "Protects against mechanical failures and malfunctions in your ejector pump system.",
    note: "Eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "36 Months: $4.99/month",
          "72 Months: $7.99/month",
          "108 Months: $10.99/month",
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Ejector pumps have an average lifespan of 5 years, and repairs or replacements can cost up to $15,000. This coverage protects you from unexpected expenses and ensures you’re not paying out-of-pocket for major repairs.",
          bullets: [
            "Repair or replacement of ejector pump motors.",
            "Fixing electrical or mechanical failures in the ejector pump system.",
            "Repair or replacement of floats in the pump chamber.",
            "Repair or replacement of the ejector pump tank.",
            "Includes all materials and labor required for covered repairs or replacements.",
            "Transferability: Coverage can be transferred to the next homeowner.",
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          "Deductible $500 per claim.",
          "Maximum Coverage Limit: $25,000.",
          "Eligibility contingent on inspection."
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
  {
    id: "PnJyfsKECatzdFkbXT4N",
    image: iconFive,
    title: "Septic Tank Coverage",
    startingPrice: "$24.00/Month",
    selectedOption: "$24.00/Month for 36 Months",
    pricingOptions: [
      "$24.00/Month for 36 Months",
      "$22.00/Month for 72 Months",
      "$18.00/Month for 108 Months",
    ],
    description:
      "Protects against tank structural failures, broken baffles, and other major issues.",
    note: "Eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "Starting Price: $18/month",
          "Final price and eligibility determined after inspection."
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Septic tank repairs or replacements can cost between $7,000 and $18,000. This coverage protects you from unexpected expenses and ensures you’re not paying out-of-pocket for major repairs.",
          bullets: [
            "Repair or replacement of the septic tank (includes all materials and labor).",
            "Repair or replacement of tank lids, risers, and baffles.",
            "Transferability: Coverage can be transferred to the next homeowner."
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          "Deductible: $1,250 per claim.",
          "Maximum Coverage Limit: $25,000.",
          "Eligibility contingent on inspection."
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
  {
    id: "8PKKH94jrOHDhB3oq5lN",
    image: iconSix,
    title: "Sewer Pipe Coverage",
    startingPrice: "$7.99/Month",
    selectedOption: "$7.99/Month for 36 Months",
    pricingOptions: [
      "$7.99/Month for 36 Months",
      "$9.99/Month for 72 Months",
      "$14.99/Month for 108 Months",
    ],
    description:
      "Protects against cracks, aging pipes, and tree root damage.",
    note: "Eligibility contingent on inspection.",
    sections: [
      {
        heading: "Monthly Terms",
        content: [
          "36 Months: $7.99/month",
          "72 Months: $9.99/month",
          "108 Months: $14.99/month"
        ],
      },
      {
        heading: "Why It Matters",
        content: {
          paragraph:
            "Sewer pipe repairs can cost up to $10,000. This coverage protects you from unexpected expenses and ensures you’re not paying out-of-pocket for major repairs.",
          bullets: [
            "Repair or replacement of cracked, broken, or collapsed sewer pipes.",
            "Relining of damaged sewer pipes.",
            "Repair or replacement of pipe joints and fittings.",
            "Ejector Pump Coverage",
            "Transferability: Coverage can be transferred to the next homeowner."
          ],
        },
      },
      {
        heading: "Service Fees",
        content: [
          "Deductible $500 per claim.",
          "Maximum Coverage Limit: $25,000.",
          "Eligibility contingent on inspection."
        ],
      },
    ],
    buttonText: "SELECT COVERAGE",
  },
];

export default productCards;