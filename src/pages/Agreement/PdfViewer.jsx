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
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
          coveragesText += `Septic Major Component Plan: $${price.toFixed(
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
            ? "Septic Major Component Plan"
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
            ? "Septic Major Component Plan"
            : card.title;
        serviceFeesText += `${displayName}: ${deductibleInfo}\n`;
      }
    });
    if (serviceFeesText === "") serviceFeesText += "No coverages selected\n";
    return serviceFeesText;
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
  const currentDate = getCurrentDateFormatted();

  useEffect(() => {
    let url;
    const modifyPdf = async () => {
      setIsLoading(true);
      setPdfLoadError(false);
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
        setTextField(
          "total_monthly_cost",
          `$${totalMonthlyCost.toFixed(2)}/month`
        );
        setTextField("covered_components", coveredComponentsText);
        setTextField("service_fees_deductibles", serviceFeesDeductiblesText);
        setTextField("not_included_covered", notIncludedComponentsText);
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
        setPdfLoadError(true);
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

  // Enhanced mobile PDF viewing
  const handleIframeLoad = () => {
    setPdfLoadError(false);
  };

  const handleIframeError = () => {
    setPdfLoadError(true);
  };

  return (
    <div className="pdf-viewer-container">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "#1f78bc" }}>
          <Loader />
        </div>
      ) : pdfUrl ? (
        <>
          {/* Mobile PDF Preview with enhanced styling */}
          <div 
            ref={containerRef}
            className={`pdf-iframe-container ${isMobile ? 'mobile-pdf-view' : 'desktop-pdf-view'}`}
            style={{ 
              width: '100%', 
              height: isMobile ? '60vh' : '70vh',
              overflow: 'auto',
              border: '1px solid #ccc',
              borderRadius: '8px',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              backgroundColor: '#f5f5f5',
              position: 'relative',
              marginBottom: '20px'
            }}
          >
            {pdfLoadError && (
              <div className="pdf-error-message text-center p-4 text-red-600 bg-red-50 rounded">
                Failed to load PDF. Please try downloading the contract instead.
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              title="PDF Viewer"
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              width="100%"
              height="100%"
              style={{ 
                border: "none",
                minHeight: isMobile ? '600px' : '800px',
                display: pdfLoadError ? 'none' : 'block',
                overflow: 'auto'
              }}
              loading="lazy"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              // Mobile-specific attributes for better compatibility
              scrolling="yes"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allow="autoplay; fullscreen"
            />
          </div>
          
          {/* Instructions for mobile users */}
          {isMobile && (
            <div className="mobile-pdf-instructions bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">📱 Mobile PDF Viewing Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Pinch to zoom in/out for better readability</li>
                <li>Swipe to navigate through pages</li>
                <li>Use "Download Contract" to save a copy</li>
                <li>Scroll down to review and sign after reading</li>
              </ul>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="pdf-viewer-buttons flex justify-center gap-4 mt-4 flex-wrap">
            <button 
              onClick={handlePrint} 
              className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Print Contract
            </button>
            <button 
              onClick={handleDownload} 
              className="btn btn-secondary px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Download Contract
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          {pdfLoadError ? (
            <div>
              <p>Error loading PDF preview.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry Loading PDF
              </button>
            </div>
          ) : (
            "Error loading PDF. Please try again."
          )}
        </div>
      )}
    </div>
  );
};


export default PdfViewer;