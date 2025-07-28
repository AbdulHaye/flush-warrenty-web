import React, { useState, useEffect, useRef } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import productCards from "./product_cards";

const PdfViewer = ({ contactData, signatureData }) => {
  const [pdfUrl, setPdfUrl] = useState("");
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
      const iframe = iframeRef.current;
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  // Helper function to get custom field value
  const getCustomFieldValue = (fieldId) => {
    if (!contactData?.customField) return null;
    const field = contactData.customField.find((f) => f.id === fieldId);
    return field ? field.value : null;
  };

  const getSelectedCoverages = () => {
    let coveragesText = "\n";
    let totalMonthlyCost = 0;

    // Map through all product cards to check which are selected
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isSelected = duration && duration.includes("Months");

      if (isSelected) {
        // Find the price for the selected duration
        const priceFieldId = card.priceFieldIds[duration];
        let price = 0;

        if (priceFieldId) {
          const priceField = contactData?.customField?.find(
            (f) => f.id === priceFieldId
          );
          price = priceField ? parseFloat(priceField.value) : 0;
        }

        // Special case for All-in-One (Septic Major Component Plan)
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package (Septic Major Component Plan)"
            : card.title;

        coveragesText += ` ${displayName}: $${price}/month for ${duration}\n`;
        totalMonthlyCost += price;
      } else {
        // Special case for All-in-One (Septic Major Component Plan)
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package (Septic Major Component Plan)"
            : card.title;
        coveragesText += ` ${displayName}: Not Selected\n`;
      }
    });

    return {
      coveragesText,
      totalMonthlyCost,
    };
  };

  const getCoveredComponents = () => {
    let componentsText = "\n";
    const selectedComponents = [];

    // Check each product card for selected components
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isSelected = duration && duration.includes("Months");

      if (isSelected) {
        // Special case for All-in-One (Septic Major Component Plan)
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package (Septic Major Component Plan)"
            : card.title;
        selectedComponents.push(displayName);
      }
    });

    // Format the selected components
    if (selectedComponents.length > 0) {
      selectedComponents.forEach((component) => {
        componentsText += ` ${component}\n`;
      });
    } else {
      componentsText += "No components selected\n";
    }

    return componentsText;
  };

  const getNotIncludedComponents = () => {
    let notIncludedText = "\n";
    const notSelectedComponents = [];

    // Check each product card for components that weren't selected
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isNotSelected = !duration || !duration.includes("Months");

      if (isNotSelected) {
        // Special case for All-in-One (Septic Major Component Plan)
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package (Septic Major Component Plan)"
            : card.title;
        notSelectedComponents.push(displayName);
      }
    });

    // Format the not selected components
    if (notSelectedComponents.length > 0) {
      notSelectedComponents.forEach((component) => {
        notIncludedText += ` ${component}\n`;
      });
    } else {
      notIncludedText += "All components are selected\n";
    }

    return notIncludedText;
  };

  const getServiceFeesDeductibles = () => {
    let serviceFeesText = "\n";
    const selectedDeductibles = [];

    // Check each product card for selected components
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isSelected = duration && duration.includes("Months");

      if (isSelected) {
        // Get the deductible info from the Service Fees section (first item)
        const deductibleInfo =
          card.sections[2]?.content[0] || "No deductible information";

        // Special case for All-in-One (Septic Major Component Plan)
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package"
            : card.title;

        selectedDeductibles.push({
          name: displayName,
          deductible: deductibleInfo,
        });
      }
    });

    // Format the selected deductibles
    if (selectedDeductibles.length > 0) {
      selectedDeductibles.forEach((item) => {
        serviceFeesText += ` ${item.name}: ${item.deductible}\n`;
      });
    } else {
      serviceFeesText += "No coverages selected\n";
    }

    return serviceFeesText;
  };

  const getPumpingProducts = () => {
    let pumpingProductsText = "\n";
    const selectedPumpingProducts = [];

    // Check each product card for pumping-related products
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isSelected = duration && duration.includes("Months");
      const isPumpingProduct = card.title.toLowerCase().includes("pump");

      if (isSelected && isPumpingProduct) {
        selectedPumpingProducts.push(card.title);
      }
    });

    // Format the pumping product names
    if (selectedPumpingProducts.length > 0) {
      selectedPumpingProducts.forEach((product) => {
        pumpingProductsText += `${product}\n`;
      });
    } else {
      pumpingProductsText += "No pumping services selected\n";
    }

    return pumpingProductsText;
  };

  const getNonPumpingNotSelected = () => {
    let resultText = "";
    const notSelectedNonPumping = [];

    // Check each product card for non-pumping products that were NOT selected
    productCards.forEach((card) => {
      const duration = getCustomFieldValue(card.id);
      const isNotSelected = !duration || !duration.includes("Months");
      const isNonPumpingProduct = !card.title.toLowerCase().includes("pump");

      if (isNotSelected && isNonPumpingProduct) {
        // Special case for All-in-One package
        const displayName =
          card.id === "72V55XJap3h5hTBfw3qs"
            ? "All-in-One Package"
            : card.title;
        notSelectedNonPumping.push(displayName);
      }
    });

    // Format the output
    if (notSelectedNonPumping.length === 0) {
      resultText = "All non-pumping products are selected";
    } else {
      resultText = "Not Selected\n";
      notSelectedNonPumping.forEach((product, index) => {
        resultText += `${index + 1}. ${product}\n`;
      });
    }

    return resultText;
  };

  const getCurrentDateFormatted = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();

    return `${month}/${day}/${year}`; // Returns format: mm/dd/yyyy
  };

  // Then in your PDF modification code:
  const { coveragesText, totalMonthlyCost } = getSelectedCoverages();
  const coveredComponentsText = getCoveredComponents();
  const notIncludedComponentsText = getNotIncludedComponents();
  const serviceFeesDeductiblesText = getServiceFeesDeductibles();
  const pumpingServicesText = getPumpingProducts();
  const nonPumpingNotIncludedText = getNonPumpingNotSelected();
  const currentDate = getCurrentDateFormatted();

  useEffect(() => {
    const modifyPdf = async () => {
      try {
        // Load the PDF
        const response = await fetch("/Flush_warranty.pdf");
        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get the form and fields
        const form = pdfDoc.getForm();

        // Prepare data
        const fullName = `${contactData?.firstName || ""} ${
          contactData?.lastName || ""
        }`.trim();
        const address = contactData?.address1 || "";
        const date = getCurrentDate();
        const billingName = getCustomFieldValue("cdPUpkv4BxtoDeJiV7QZ") || "";
        const billingAddress =
          getCustomFieldValue("ajt8ZWrwYbwHk1c3ygsD") || "";

        // Update field appearances
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        form.updateFieldAppearances(helveticaFont);

        // Set all text field values
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
        setTextField("address", address);
        setTextField("date", date);
        setTextField("your_selected_coverages", coveragesText);
        // console.log('Selected Coverages == ', coveragesText);
        setTextField(
          "total_monthly_cost",
          `$${totalMonthlyCost.toFixed(2)}/month`
        );
        setTextField("covered_components", coveredComponentsText);
        // console.log('Covered Components == ', coveredComponentsText);
        // setTextField('not_included_covered', notIncludedComponentsText);
        // console.log('Not Included Covered Components == ', notIncludedComponentsText);
        setTextField("service_fees_deductibles", serviceFeesDeductiblesText);
        // console.log('Service Fees deductibles == ', serviceFeesDeductiblesText);
        setTextField("pumping_services_included", pumpingServicesText);
        // console.log('Select the pumping product == ', pumpingServicesText);
        setTextField(
          "pumping_services_not_included",
          nonPumpingNotIncludedText
        );
        // console.log('Not select the pumping product == ', nonPumpingNotIncludedText);
        setTextField("effective_date", currentDate);
        setTextField("full_name", billingName);
        setTextField("full_address", billingAddress);

        // Handle signature overlay
        if (signatureData) {
          try {
            const pages = pdfDoc.getPages();
            const signaturePage = pages[11];

            // Get dimensions of the page
            const { height } = signaturePage.getSize();

            // Convert base64 to Uint8Array
            const base64Data = signatureData.replace(
              /^data:image\/png;base64,/,
              ""
            );
            const pngBytes = Uint8Array.from(atob(base64Data), (c) =>
              c.charCodeAt(0)
            );

            // Embed the PNG image
            const pngImage = await pdfDoc.embedPng(pngBytes);

            // Draw the image
            signaturePage.drawImage(pngImage, {
              x: 10,
              y: height - 530,
              width: 200,
              height: 50,
            });
          } catch (error) {
            console.error("Error embedding signature:", error);
          }
        }

        // Flatten the form
        form.flatten();

        // Save and create URL
        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error modifying PDF:", error);
        setPdfUrl("/Flush_warranty.pdf");
      }
    };

    if (contactData) {
      modifyPdf();
    }
  }, [contactData, signatureData]);

  return (
    <div className="pdf-viewer-container relative">
      {pdfUrl ? (
        <>
          <iframe
            ref={iframeRef}
            title="PDF Viewer"
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
          <button onClick={handlePrint} className="btn btn-primary">
            Print Preview
          </button>
        </>
      ) : (
        <div>Loading PDF...</div>
      )}
    </div>
  );
};

export default PdfViewer;
