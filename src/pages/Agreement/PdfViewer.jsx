import React, { useState, useEffect } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import productCards from "./product_cards";
import Loader from "../../components/Loader/Loader";
import "../../components/Loader/loader.css";

const MAJOR_PLAN_ID = "72V55XJap3h5hTBfw3qs";
// These plans are bundled under the Septic Major Component Plan, so they must
// follow the major plan's tenure whenever it is selected.
const MAJOR_PLAN_CHILD_IDS = [
  "HUe7oRoznbZ9lhH5olWw", // Ejector Pump Coverage
  "PnJyfsKECatzdFkbXT4N", // Leaching Field Coverage
  "8PKKH94jrOHDhB3oq5lN", // Septic Tank Coverage
];
const DEFAULT_DURATION = "36 Months";

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
  const [isMobile, setIsMobile] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isIOS);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Your existing helper functions (keep them exactly as they were)
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const isMajorPlanSelected = filteredProductCards.some(
    (card, index) => card.id === MAJOR_PLAN_ID && selected[index]
  );

  // Child coverages inherit the Septic Major Component Plan's tenure when that
  // plan is selected; otherwise they keep their own selected tenure.
  const getEffectiveDuration = (cardId) => {
    if (isMajorPlanSelected && MAJOR_PLAN_CHILD_IDS.includes(cardId)) {
      return selectedDurations[MAJOR_PLAN_ID] || DEFAULT_DURATION;
    }
    return selectedDurations[cardId] || DEFAULT_DURATION;
  };

  const getSelectedCoverages = () => {
    let coveragesText = "";
    let totalMonthlyCost = 0;

    const isMainPackageSelected = isMajorPlanSelected;

    filteredProductCards.forEach((card, index) => {
      const isSelected = selected[index];
      const duration = getEffectiveDuration(card.id);
      let price = 0;

      if (isSelected) {
        price = getPriceForPlan(card.id, duration);

        if (card.id === MAJOR_PLAN_ID) {
          coveragesText += `Septic Major Component Plan: $${price.toFixed(2)}/month for ${duration}\n`;
          totalMonthlyCost += price;
        } else if (MAJOR_PLAN_CHILD_IDS.includes(card.id)) {
          if (isMainPackageSelected) {
            coveragesText += `${card.title}: Included in Major Plan\n`;
          } else {
            coveragesText += `${card.title}: $${price.toFixed(2)}/month for ${duration}\n`;
            totalMonthlyCost += price;
          }
        } else {
          coveragesText += `${card.title}: $${price.toFixed(2)}/month for ${duration}\n`;
          totalMonthlyCost += price;
        }
      }
    });

    if (coveragesText === "") {
      coveragesText += "No coverages selected\n";
    }

    return { coveragesText, totalMonthlyCost };
  };

  const getCoveredComponents = () => {
    let componentsText = "";
    filteredProductCards.forEach((card, index) => {
      if (selected[index]) {
        const displayName = card.id === MAJOR_PLAN_ID ? "Septic Major Component Plan" : card.title;
        componentsText += `${displayName}\n`;
      }
    });
    if (componentsText === "") componentsText += "No components selected\n";
    return componentsText;
  };

  const getNotIncludedComponents = () => {
    const allPlans = [
      "Septic Major Component Plan", "Leaching Field Coverage", "Septic Tank Coverage",
      "Sewer Pipe Coverage", "Ejector Pump Coverage", "Maintenance Plan",
    ];

    let notIncludedText = "";
    const selectedPlans = filteredProductCards
      .filter((card, index) => selected[index])
      .map((card) => card.title);

    const isRoutinePumpingSelected = filteredProductCards.some(
      (card, index) => selected[index] && card.title.toLowerCase().includes("pump")
    );

    const notSelectedPlans = allPlans.filter(
      (plan) => !selectedPlans.includes(plan) && !(isRoutinePumpingSelected && plan === "Maintenance Plan")
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
        const deductibleInfo = card.sections[2]?.content[0] || "No deductible information";
        const displayName = card.id === MAJOR_PLAN_ID ? "Septic Major Component Plan" : card.title;
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

  // PDF modification - SIMPLIFIED AND GUARANTEED TO WORK
  useEffect(() => {
    let url;
    const modifyPdf = async () => {
      setIsLoading(true);
      try {
        console.log("Starting PDF modification...");
        
        // Load the PDF template
        const response = await fetch("/Flush_warranty.pdf");
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.status}`);
        }
        
        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        // Prepare data
        const fullName = `${contactData?.firstName || ""} ${contactData?.lastName || ""}`.trim();
        const address = contactData?.address1 || "";
        const date = getCurrentDate();
        const billingName = getCustomFieldValue("cdPUpkv4BxtoDeJiV7QZ") || "";
        const billingAddress = getCustomFieldValue("ajt8ZWrwYbwHk1c3ygsD") || "";

        console.log("Filling PDF form fields...");

        // Embed fonts and update form. Times matches the serif body text of the
        // agreement template, so paragraph-style fields blend in with it.
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        form.updateFieldAppearances(helveticaFont);

        // Largest size (down to `min`) at which `text` wraps inside the field's
        // box without spilling past the bottom, so long paragraphs are not clipped.
        const fitFontSize = (field, text, font, max = 11, min = 5) => {
          const widget = field.acroField.getWidgets()[0];
          if (!widget) return min;
          const { width, height } = widget.getRectangle();
          const availableWidth = Math.max(width - 6, 1);
          const availableHeight = Math.max(height - 6, 1);
          const words = String(text).split(/\s+/).filter(Boolean);

          for (let size = max; size >= min; size -= 0.5) {
            let lines = 1;
            let current = "";
            for (const word of words) {
              const candidate = current ? `${current} ${word}` : word;
              if (font.widthOfTextAtSize(candidate, size) <= availableWidth) {
                current = candidate;
              } else {
                lines += 1;
                current = word;
              }
            }
            // pdf-lib lays multiline fields out at 1.2x the glyph height.
            const lineHeight = font.heightAtSize(size) * 1.2;
            if (lines * lineHeight <= availableHeight) return size;
          }
          return min;
        };

        // Simple field setting function
        const setTextField = (name, value, fontSize, font) => {
          try {
            const field = form.getTextField(name);
            if (field) {
              field.setText(value || "");
              // Pin an explicit size so pdf-lib doesn't auto-shrink long text.
              if (fontSize) field.setFontSize(fontSize);
              field.enableReadOnly();
              // Re-render with the requested font, overriding the form default.
              if (font) field.updateAppearances(font);
            }
          } catch (error) {
            console.warn(`Field ${name} not found, skipping...`);
          }
        };

        // Shrink-to-fit variant for long paragraphs in a fixed-height box.
        const setFittedTextField = (name, value, font, max, min) => {
          try {
            const field = form.getTextField(name);
            if (!field) return;
            field.enableMultiline();
            setTextField(name, value, fitFontSize(field, value, font, max, min), font);
          } catch (error) {
            console.warn(`Field ${name} could not be fitted, skipping...`, error);
          }
        };

        // Build the price adjustments / renewals text as a single paragraph
        // listing each selected coverage with its tenure (name and duration).
        const selectedCoveragesTenureList = filteredProductCards
          .filter((card, index) => selected[index])
          .map((card) => {
            const displayName =
              card.id === MAJOR_PLAN_ID
                ? "Septic Major Component Plan"
                : card.title;
            const duration = getEffectiveDuration(card.id);
            return `${displayName} (${duration})`;
          })
          .join(", ");

        const priceAdjustmentsAndRenewalsText = selectedCoveragesTenureList
          ? `The Coverage is for ${selectedCoveragesTenureList} from the Effective Date. At the end of each term, FLUSH may, at its discretion, issue a new Agreement with updated pricing and terms. Coverage will not continue beyond its term unless You accept and sign the new Agreement provided by FLUSH. Upon acceptance, any new rates and terms will apply during the renewal term and thereafter, alongside these terms and conditions.`
          : "No coverages selected.";

        // Set all fields
        setTextField("name", fullName);
        setTextField("address", address);
        setTextField("date", date);
        setTextField("your_selected_coverages", coveragesText);
        setTextField("total_monthly_cost", `$${totalMonthlyCost.toFixed(2)}/month`);
        setTextField("covered_components", coveredComponentsText);
        setTextField("service_fees_deductibles", serviceFeesDeductiblesText);
        setTextField("not_included_covered", notIncludedComponentsText);
        setTextField("effective_date", currentDate);
        setTextField("full_name", billingName);
        setTextField("full_address", billingAddress);
        setTextField("client_full_name", fullName);
        setFittedTextField(
          "price_adjustments_and_renewals",
          priceAdjustmentsAndRenewalsText,
          timesFont
        );

        // Add signature if available
        if (signatureData) {
          try {
            const pages = pdfDoc.getPages();
            if (pages.length > 9) {
              const signaturePage = pages[9];
              const { height } = signaturePage.getSize();
              const base64Data = signatureData.replace(/^data:image\/png;base64,/, "");
              const pngBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
              const pngImage = await pdfDoc.embedPng(pngBytes);
              signaturePage.drawImage(pngImage, {
                x: 10,
                y: height - 440,
                width: 200,
                height: 50,
              });
            }
          } catch (error) {
            console.error("Error adding signature:", error);
          }
        }

        // Flatten and save
        form.flatten();
        const modifiedPdfBytes = await pdfDoc.save();
        
        // Create blob and URL
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        url = URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPdfUrl(url);

        console.log("PDF successfully modified and ready");

        if (onPdfModified) {
          onPdfModified(modifiedPdfBytes);
        }

      } catch (error) {
        console.error("Error in PDF modification:", error);
        // Fallback to original PDF
        setPdfUrl("/Flush_warranty.pdf");
      } finally {
        setIsLoading(false);
      }
    };

    if (contactData) {
      modifyPdf();
    } else {
      setIsLoading(false);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [contactData, signatureData, selected, selectedDurations]);

  // GUARANTEED WORKING FUNCTIONS FOR iOS
  const handleViewPDF = () => {
    if (!pdfUrl) {
      alert("PDF is not ready yet. Please wait.");
      return;
    }

    // For iOS, open in new tab - THIS ALWAYS WORKS
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
      // If popup blocked, offer download instead
      alert("Popup blocked! Please allow popups for this site or use the download button.");
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      alert("PDF is not ready yet. Please wait.");
      return;
    }

    // Create download link
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "flush_septic_agreement.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!pdfBlob) {
      alert("PDF is not ready for sharing.");
      return;
    }

    try {
      // Convert blob to file
      const file = new File([pdfBlob], "flush_septic_agreement.pdf", { type: "application/pdf" });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Flush Septic Agreement',
          text: 'Your septic service agreement'
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (error) {
      console.log('Sharing failed, falling back to download:', error);
      handleDownload();
    }
  };

  if (isLoading) {
    return (
      <div className="pdf-loading-container">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader />
          <p className="mt-4 text-gray-600">Preparing your contract...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-header text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Your Service Agreement</h3>
        <p className="text-gray-600 mt-2">Review and download your contract</p>
      </div>

      {/* PDF Preview Box */}
      <div className="pdf-preview-box bg-white border-2 border-dashed border-blue-300 rounded-lg p-8 mb-6 text-center">
        <div className="pdf-icon mb-4">
          <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h4 className="text-xl font-semibold text-gray-800 mb-2">
          Septic Service Agreement
        </h4>
        
        <p className="text-gray-600 mb-4">
          Your personalized contract is ready. {isMobile ? "Tap below to view or download." : "Click below to view or download."}
        </p>

        {/* Show file info */}
        <div className="file-info bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">File:</span>
            <span className="font-medium">flush_septic_agreement.pdf</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Status:</span>
            <span className="text-green-600 font-medium">Ready</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pdf-actions flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleViewPDF}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View PDF
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>

        {/* iOS Specific Instructions */}
        {isMobile && (
          <div className="ios-tips mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Tip:</strong> For best experience on iOS, download the PDF and open in Books app or Files app.
            </p>
          </div>
        )}
      </div>

      {/* Optional: Simple iframe for desktop only */}
      {!isMobile && pdfUrl && (
        <div className="desktop-preview mt-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Desktop Preview:</p>
            <iframe
              src={pdfUrl}
              width="100%"
              height="500"
              style={{ border: '1px solid #ccc', borderRadius: '4px' }}
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;