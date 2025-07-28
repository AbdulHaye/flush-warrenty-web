import React, { useState, useEffect, useRef } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import productCards from "./product_cards";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css";

const PdfViewer = ({
  contactData,
  signatureData,
  onPdfModified,
  selected,
  filteredProductCards,
  selectedDurations,
}) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      alert("PDF is not ready yet. Please wait.");
      return;
    }
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "flush_warranty.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCustomFieldValue = (fieldId) => {
    if (!contactData?.customField) return null;
    const field = contactData.customField.find((f) => f.id === fieldId);
    return field ? field.value : null;
  };

  const getPriceForPlan = (cardId, duration) => {
    if (!contactData?.customField) return 0;
    const card = productCards.find((c) => c.id === cardId);
    if (!card || !card.priceFieldIds) return 0;
    const priceFieldId = card.priceFieldIds[duration];
    if (!priceFieldId) return 0;
    const priceField = contactData.customField.find(
      (f) => f.id === priceFieldId
    );
    return priceField ? parseFloat(priceField.value) : 0;
  };

  const getSelectedCoverages = () => {
    let coveragesText = "";
    let totalMonthlyCost = 0;

    const mainPackageIndex = filteredProductCards.findIndex(
      (card) => card.id === "72V55XJap3h5hTBfw3qs"
    );
    const isMainPackageSelected =
      mainPackageIndex !== -1 && selected[mainPackageIndex];

    // Iterate only over filteredProductCards, which are the plans available to the user
    filteredProductCards.forEach((card, index) => {
      const isSelected = selected[index]; // Check if the plan is selected
      const duration = selectedDurations[card.id] || "36 Months";
      let price = 0;

      // Only process selected plans
      if (isSelected) {
        price = getPriceForPlan(card.id, duration);

        if (card.id === "72V55XJap3h5hTBfw3qs") {
          // Main package
          coveragesText += `All-in-One Package (Septic Major Component Plan): $${price.toFixed(
            2
          )}/month for ${duration}\n`;
          totalMonthlyCost += price;
        } else if (
          [
            "HUe7oRoznbZ9lhH5olWw",
            "PnJyfsKECatzdFkbXT4N",
            "8PKKH94jrOHDhB3oq5lN",
          ].includes(card.id)
        ) {
          // Sub-packages
          if (isMainPackageSelected) {
            coveragesText += `${card.title}: Included in Major Plan\n`;
          } else {
            coveragesText += `${card.title}: $${price.toFixed(
              2
            )}/month for ${duration}\n`;
            totalMonthlyCost += price;
          }
        } else {
          // Other plans
          coveragesText += `${card.title}: $${price.toFixed(
            2
          )}/month for ${duration}\n`;
          totalMonthlyCost += price;
        }
      }
    });

    // If no plans are selected, add a placeholder message
    if (coveragesText === "") {
      coveragesText += "No coverages selected\n";
    }

    return { coveragesText, totalMonthlyCost };
  };

  const getCoveredComponents = () => {
    let componentsText = "";
    filteredProductCards.forEach((card, index) => {
      if (selected[index]) {
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package (Septic Major Component Plan)"
            : card.title;
        componentsText += `${displayName}\n`;
      }
    });
    if (componentsText === "") componentsText += "No components selected\n";
    return componentsText;
  };

  const getNotIncludedComponents = () => {
    const allPlans = [
      "Septic Major Component Plan",
      "Leaching Field Coverage",
      "Septic Tank Coverage",
      "Sewer Pipe Coverage",
      "Ejector Pump Coverage",
      "Maintenance Plan",
    ];

    let notIncludedText = "";
    const selectedPlans = filteredProductCards
      .filter((card, index) => selected[index])
      .map((card) => card.title);

    // Check if any selected plan includes "pump" in its title (case-insensitive)
    const isRoutinePumpingSelected = filteredProductCards.some(
      (card, index) =>
        selected[index] && card.title.toLowerCase().includes("pump")
    );

    // Filter out plans that are not selected, but exclude "Maintenance Plan" if Routine Pumping is selected
    const notSelectedPlans = allPlans.filter(
      (plan) =>
        !selectedPlans.includes(plan) &&
        !(isRoutinePumpingSelected && plan === "Maintenance Plan")
    );

    if (notSelectedPlans.length === 0) {
      notIncludedText = "All applicable plans are selected";
    } else {
      notSelectedPlans.forEach((plan, index) => {
        notIncludedText += `${index + 1}. ${plan}\n`;
      });
    }
    return notIncludedText;
  };
  const getServiceFeesDeductibles = () => {
    let serviceFeesText = "";
    filteredProductCards.forEach((card, index) => {
      if (selected[index]) {
        const deductibleInfo =
          card.sections[2]?.content[0] || "No deductible information";
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package"
            : card.title;
        serviceFeesText += `${displayName}: ${deductibleInfo}\n`;
      }
    });
    if (serviceFeesText === "") serviceFeesText += "No coverages selected\n";
    return serviceFeesText;
  };

  const getPumpingProducts = () => {
    let pumpingProductsText = "";
    filteredProductCards.forEach((card, index) => {
      if (selected[index] && card.title.toLowerCase().includes("pump")) {
        pumpingProductsText += `${card.title}\n`;
      }
    });
    if (pumpingProductsText === "")
      pumpingProductsText += "No pumping services selected\n";
    return pumpingProductsText;
  };

  const getNonPumpingNotSelected = () => {
    let resultText = "";
    const notSelectedNonPumping = filteredProductCards.filter(
      (card, index) =>
        !selected[index] && !card.title.toLowerCase().includes("pump")
    );
    if (notSelectedNonPumping.length === 0) {
      resultText = "All non-pumping products are selected";
    } else {
      resultText = "Not Selected\n";
      notSelectedNonPumping.forEach((card, index) => {
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package"
            : card.title;
        resultText += `${index + 1}. ${displayName}\n`;
      });
    }
    return resultText;
  };

  const getCurrentDateFormatted = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const { coveragesText, totalMonthlyCost } = getSelectedCoverages();
  const coveredComponentsText = getCoveredComponents();
  const notIncludedComponentsText = getNotIncludedComponents();
  const serviceFeesDeductiblesText = getServiceFeesDeductibles();
  const pumpingServicesText = getPumpingProducts();
  const nonPumpingNotIncludedText = getNonPumpingNotSelected();
  const currentDate = getCurrentDateFormatted();

  useEffect(() => {
    let url;
    const modifyPdf = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/Flush_warranty.pdf");
        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        const fullName = `${contactData?.firstName || ""} ${
          contactData?.lastName || ""
        }`.trim();
        const address = contactData?.address1 || "";
        const date = getCurrentDate();
        const billingName = getCustomFieldValue("cdPUpkv4BxtoDeJiV7QZ") || "";
        const billingAddress =
          getCustomFieldValue("ajt8ZWrwYbwHk1c3ygsD") || "";

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        form.updateFieldAppearances(helveticaFont);
        console.log("Contact Data:", contactData);

        const setTextField = (name, value) => {
          try {
            const field = form.getTextField(name);
            if (field) {
              field.setText(value);
              field.enableReadOnly();
            }
          } catch (error) {
            console.error(`Error setting ${name}:`, error);
          }
        };

        setTextField("name", fullName);
        console.log("Full Name:", fullName);
        setTextField("address", address);
        setTextField("date", date);
        setTextField("your_selected_coverages", coveragesText);
        setTextField(
          "total_monthly_cost",
          `$${totalMonthlyCost.toFixed(2)}/month`
        );
        setTextField("covered_components", coveredComponentsText);
        setTextField("service_fees_deductibles", serviceFeesDeductiblesText);
        setTextField("not_included_covered", notIncludedComponentsText);
        // setTextField("pumping_services_included", pumpingServicesText);
        // setTextField(
        //   "pumping_services_not_included",
        //   nonPumpingNotIncludedText
        // );
        setTextField("effective_date", currentDate);
        setTextField("full_name", billingName);
        setTextField("full_address", billingAddress);
        setTextField("client_full_name", fullName);

        if (signatureData) {
          try {
            const pages = pdfDoc.getPages();
            const signaturePage = pages[9];
            const { height } = signaturePage.getSize();
            const base64Data = signatureData.replace(
              /^data:image\/png;base64,/,
              ""
            );
            const pngBytes = Uint8Array.from(atob(base64Data), (c) =>
              c.charCodeAt(0)
            );
            const pngImage = await pdfDoc.embedPng(pngBytes);
            signaturePage.drawImage(pngImage, {
              x: 10,
              y: height - 440,
              width: 200,
              height: 50,
            });
          } catch (error) {
            console.error("Error embedding signature:", error);
          }
        }

        form.flatten();
        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        url = URL.createObjectURL(blob);
        setPdfUrl(url);

        if (onPdfModified) onPdfModified(modifiedPdfBytes);
      } catch (error) {
        console.error("Error modifying PDF:", error);
        setPdfUrl("/Flush_warranty.pdf");
      } finally {
        setIsLoading(false);
      }
    };

    if (contactData) modifyPdf();
    else setIsLoading(false);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [contactData, signatureData, selected, selectedDurations]);

  return (
    <div className="pdf-viewer-container relative">
      {isLoading ? (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "#1f78bc" }}
        >
          <Loader />
        </div>
      ) : pdfUrl ? (
        <>
          <iframe
            ref={iframeRef}
            title="PDF Viewer"
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={handlePrint} className="btn btn-primary">
              Print Preview
            </button>
            <button onClick={handleDownload} className="btn btn-secondary">
              Download Contract
            </button>
          </div>
        </>
      ) : (
        <div>Error loading PDF. Please try again.</div>
      )}
    </div>
  );
};

export default PdfViewer;
