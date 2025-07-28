import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar/navbar";
import FlushWarrantyFooter from "../../components/Footer/flushWarrantyFooter";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from 'react-pdf';
import SignaturePad from 'react-signature-pad-wrapper';
import './agreement.css';
import PdfViewer from "./PdfViewer";
import productCards from './product_cards'
// Configure pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


// Signature Component (same as before)
const SignatureComponent = ({ onSave }) => {
    const signaturePadRef = useRef(null);

    const handleClear = () => {
        signaturePadRef.current.clear();
    };

    const handleSave = () => {
        if (signaturePadRef.current.isEmpty()) {
            alert('Please provide a signature first');
            return;
        }
        const signatureData = signaturePadRef.current.toDataURL();
        onSave(signatureData);
    };

    return (
        <div className="signature-container">
            <div className="signature-pad-container">
                <SignaturePad
                    ref={signaturePadRef}
                    options={{ penColor: 'black' }}
                    canvasProps={{ className: 'signature-canvas' }}
                />
            </div>
            <div className="signature-buttons">
                <button onClick={handleClear} className="btn btn-secondary">
                    Clear
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                    Save Signature
                </button>
            </div>
        </div>
    );
};

function Agreement() {
    const navigate = useNavigate();
    const [openItems, setOpenItems] = useState({});
    const [selected, setSelected] = useState(Array(productCards.length).fill(true));
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const [totalPayment, setTotalPayment] = useState(0);

    const { id } = useParams();
    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editableFields, setEditableFields] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        billingName: '',
        billingAddress: '',
        billingPhone: '',
        billingEmail: ''
    });
    const GHL_API_TOKEN = import.meta.env.VITE_GHL_API_TOKEN;

    const fetchContactData = async () => {
        if (!id) {
            setError("No contact ID provided");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `https://rest.gohighlevel.com/v1/contacts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${GHL_API_TOKEN}`,
                    },
                }
            );
            // console.log("Contact Data:", response.data);
            setContactData(response.data.contact);
            let customFieldData = response.data.contact.customField || [];
            const billingName = customFieldData?.find(f => f.id === "cdPUpkv4BxtoDeJiV7QZ")?.value || '';
            const billingAddress = customFieldData?.find(f => f.id === "ajt8ZWrwYbwHk1c3ygsD")?.value || '';
            const billingPhone = customFieldData?.find(f => f.id === "KQ5UIyIMEvMDSi9JISjp")?.value || '';
            const billingEmail = customFieldData?.find(f => f.id === "giKvkQYHEA7fgjyz2E3Y")?.value || '';

            setEditableFields({
                firstName: response.data.contact.firstName || '',
                lastName: response.data.contact.lastName || '',
                email: response.data.contact.email || '',
                phone: response.data.contact.phone || '',
                address1: response.data.contact.address1 || '',
                billingName,
                billingAddress,
                billingPhone,
                billingEmail
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContactData();
    }, [id]);

    const getCustomFieldValue = (fieldId) => {
        if (!contactData?.customField) return null;
        const field = contactData.customField.find(f => f.id === fieldId);
        return field ? field.value : null;
    };

    const handleFieldChange = (field, value) => {
        setEditableFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateContactField = async (field, value) => {
        if (!id || !contactData) return;

        try {
            let payload = {};
            let isCustomField = false;
            let customFieldId = '';

            // Determine if it's a standard field or custom field
            switch (field) {
                case 'firstName':
                case 'lastName':
                case 'email':
                case 'phone':
                case 'address1':
                    payload[field] = value;
                    break;
                case 'billingName':
                    isCustomField = true;
                    customFieldId = "cdPUpkv4BxtoDeJiV7QZ";
                    break;
                case 'billingAddress':
                    isCustomField = true;
                    customFieldId = "ajt8ZWrwYbwHk1c3ygsD";
                    break;
                case 'billingPhone':
                    isCustomField = true;
                    customFieldId = "KQ5UIyIMEvMDSi9JISjp";
                    break;
                case 'billingEmail':
                    isCustomField = true;
                    customFieldId = "giKvkQYHEA7fgjyz2E3Y";
                    break;
                default:
                    return;
            }

            if (isCustomField) {
                // Update custom field
                payload.customField = [
                    {
                        id: customFieldId,
                        value: value
                    }
                ];
            }

            await axios.put(
                `https://rest.gohighlevel.com/v1/contacts/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${GHL_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local contact data
            if (isCustomField) {
                const updatedCustomFields = contactData.customField
                    ? [...contactData.customField.filter(f => f.id !== customFieldId)]
                    : [];
                updatedCustomFields.push({
                    id: customFieldId,
                    value: value
                });
                setContactData(prev => ({
                    ...prev,
                    customField: updatedCustomFields
                }));
            } else {
                setContactData(prev => ({
                    ...prev,
                    [field]: value
                }));
            }

        } catch (error) {
            console.error('Error updating contact:', error);
            // Optionally show error to user
        }
    };

    const handleBlur = (field) => {
        if (editableFields[field] !== getFieldValue(field)) {
            updateContactField(field, editableFields[field]);
        }
    };

    const getFieldValue = (field) => {
        switch (field) {
            case 'firstName':
            case 'lastName':
            case 'email':
            case 'phone':
            case 'address1':
                return contactData?.[field] || '';
            case 'billingName':
                return contactData?.customFields?.find(f => f.id === "cdPUpkv4BxtoDeJiV7QZ")?.value || '';
            case 'billingAddress':
                return contactData?.customFields?.find(f => f.id === "ajt8ZWrwYbwHk1c3ygsD")?.value || '';
            case 'billingPhone':
                return contactData?.customFields?.find(f => f.id === "KQ5UIyIMEvMDSi9JISjp")?.value || '';
            case 'billingEmail':
                return contactData?.customFields?.find(f => f.id === "giKvkQYHEA7fgjyz2E3Y")?.value || '';
            default:
                return '';
        }
    };
    const getPriceForPlan = (cardId, duration) => {
        if (!contactData?.customField) return 0;

        // Find the card to get the price field ID mapping
        const card = productCards.find(c => c.id === cardId);
        if (!card || !card.priceFieldIds) return 0;

        // Get the price field ID for this duration
        const priceFieldId = card.priceFieldIds[duration];
        if (!priceFieldId) return 0;

        // Find the price value in custom fields
        const priceField = contactData.customField.find(f => f.id === priceFieldId);
        return priceField ? parseFloat(priceField.value) : 0;
    };
    const extractPrice = (cardId) => {
        if (!contactData?.customField) return 0;

        // Get the selected duration for this plan
        const durationField = contactData.customField.find(f => f.id === cardId);
        const duration = durationField?.value || "36 Months";

        return getPriceForPlan(cardId, duration);
    };

    const extractDuration = (cardId) => {
        if (!contactData?.customField) return "36 Months";
        const durationField = contactData.customField.find(f => f.id === cardId);
        return durationField?.value || "36 Months";
    };

    const toggle = (cardIndex, sectionIndex) => {
        setOpenItems(prev => ({
            ...prev,
            [cardIndex]: prev[cardIndex] === sectionIndex ? null : sectionIndex
        }));
    };


    const toggleSelection = (index) => {
        // Count how many plans are currently selected
        const selectedCount = selected.filter(isSelected => isSelected).length;

        // Prevent unselecting if only one plan is left selected
        if (selectedCount <= 1 && selected[index]) {
            alert("At least one plan must remain selected");
            return;
        }

        // Toggle the selection state
        setSelected(prev => {
            const newSelected = [...prev];
            newSelected[index] = !newSelected[index];
            return newSelected;
        });
    };


    // Filter product cards to only show those with a selected duration in GHL
    const filteredProductCards = productCards.filter(card => {
        const fieldValue = getCustomFieldValue(card.id);
        return fieldValue && fieldValue.includes("Months");
    });

    useEffect(() => {
        const total = filteredProductCards
            .filter((card, index) => selected[index])
            .reduce((sum, card) => {
                return sum + extractPrice(card.id);
            }, 0);

        setTotalPayment(total);
    }, [selected, filteredProductCards, contactData]);

    const handlePayout = () => {
        const selectedPlans = filteredProductCards
            .filter((card, index) => selected[index])
            .map((card) => {
                const duration = extractDuration(card.id);
                const price = extractPrice(card.id);

                return {
                    id: card.id,
                    title: card.title,
                    price: `$${price.toFixed(2)}/Month for ${duration}`,
                    monthlyCost: price,
                    duration
                };
            });

        navigate('/payment-method', {
            state: {
                selectedPlans,
                totalPayment,
                contactData: editableFields
            }
        });
    };
    const renderContent = (content) => {
        if (Array.isArray(content)) {
            return (
                <ul className="list-disc pl-5">
                    {content.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 mb-1">{item}</li>
                    ))}
                </ul>
            );
        } else if (typeof content === 'object' && content.paragraph) {
            return (
                <div>
                    <p className="text-sm text-gray-700 mb-2">{content.paragraph}</p>
                    <ul className="list-disc pl-5">
                        {content.bullets.map((bullet, idx) => (
                            <li key={idx} className="text-sm text-gray-700 mb-1">{bullet}</li>
                        ))}
                    </ul>
                </div>
            );
        }
        return <p className="text-sm text-gray-700">{content}</p>;
    };


    if (loading) {
        return (
            <>
                <Navbar />
                <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
                    <div className="text-center">
                        <p>Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
                    <div className="text-center text-red-500">
                        <p>Error: {error}</p>
                    </div>
                </div>
            </>
        );
    }

    if (!contactData) {
        return (
            <>
                <Navbar />
                <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
                    <div className="text-center">
                        <p>No contact data found</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
                <div className="text-center mb-[50px]">
                    <h3 className="text-[32px] font-bold leading-[44px] mb-[15px] text-black">
                        Agreement Information
                    </h3>
                </div>

                <div className="agreement-container">
                    <div>
                        <h2 className="heading">Contact Details</h2>
                        <div id="details" className="details">
                            <p><strong>First Name:</strong>
                                <input
                                    type="text"
                                    value={editableFields.firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                    className="editable-input"
                                />
                            </p>
                            <p><strong>Last Name:</strong>
                                <input
                                    type="text"
                                    value={editableFields.lastName}
                                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                    className="editable-input"
                                />
                            </p>
                            <p className="user-email-new"><strong>Email:</strong>
                                <input
                                    type="email"
                                    value={editableFields.email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    className="editable-input"
                                />
                            </p>
                            <p><strong>Phone:</strong>
                                <input
                                    type="text"
                                    value={editableFields.phone}
                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                    onBlur={() => handleBlur('phone')}
                                    className="editable-input"
                                />
                            </p>
                            <p><strong>Address:</strong>
                                <input
                                    type="text"
                                    value={editableFields.address1}
                                    onChange={(e) => handleFieldChange('address1', e.target.value)}
                                    onBlur={() => handleBlur('address1')}
                                    className="editable-input"
                                />
                            </p>
                        </div>
                    </div>
                    <div>
                        <h2 className="heading">Billing Information</h2>
                        <div id="details" className="details">
                            <p><strong>Full Name:</strong>
                                <input
                                    type="text"
                                    value={editableFields.billingName}
                                    onChange={(e) => handleFieldChange('billingName', e.target.value)}
                                    onBlur={() => handleBlur('billingName')}
                                    className="editable-input"
                                />
                            </p>
                            <p><strong>Address:</strong>
                                <input
                                    type="text"
                                    value={editableFields.billingAddress}
                                    onChange={(e) => handleFieldChange('billingAddress', e.target.value)}
                                    onBlur={() => handleBlur('billingAddress')}
                                    className="editable-input"
                                />
                            </p>
                            <p><strong>Phone:</strong>
                                <input
                                    type="text"
                                    value={editableFields.billingPhone}
                                    onChange={(e) => handleFieldChange('billingPhone', e.target.value)}
                                    onBlur={() => handleBlur('billingPhone')}
                                    className="editable-input"
                                />
                            </p>
                            <p className="user-email-new"><strong>Email:</strong>
                                <input
                                    type="text"
                                    value={editableFields.billingEmail}
                                    onChange={(e) => handleFieldChange('billingEmail', e.target.value)}
                                    onBlur={() => handleBlur('billingEmail')}
                                    className="editable-input"
                                />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Details Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-center">Plan Details</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 px-8 mx-auto justify-center">
                        {filteredProductCards.map((card, i) => {
                            const duration = extractDuration(card.id);
                            const price = extractPrice(card.id);


                            return (
                                <div
                                    key={i}
                                    className={`relative p-6 bg-[#f7fbff] rounded-2xl shadow-lg border ${selected[i] ? 'border-blue-500' : 'border-gray-300'} w-[300px] mx-auto hover:shadow-xl transition-shadow duration-300 ease-in-out`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <img className="w-12 h-12" src={card.image} alt={card.title} />
                                        <div className="text-right">
                                            <p className="text-xs text-gray-600">Starting From</p>
                                            <div>
                                                <h3 className="text-3xl font-bold text-gray-900">
                                                    {/* ${price.toFixed(2)} */}
                                                    ${price}
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Contract for {duration}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-blue-600 text-lg font-medium mb-2">{card.title}</h3>
                                    <p className="text-gray-800 text-sm mb-1">{card.description}</p>

                                    {card.sections.map((section, j) => (
                                        <div key={j} className="border-t border-gray-300 py-3">
                                            <div
                                                className="flex justify-between items-center cursor-pointer"
                                                onClick={() => toggle(i, j)}
                                            >
                                                <h4 className="text-lg font-semibold text-gray-900">{section.heading}</h4>
                                                <IoIosArrowDown className={`transform transition-transform duration-300 ${openItems[i] === j ? "rotate-180" : ""}`} />
                                            </div>
                                            {openItems[i] === j && (
                                                <div className="mt-2">
                                                    {renderContent(section.content)}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => toggleSelection(i)}
                                        className={`w-full mt-4 py-2 rounded-lg font-medium ${selected[i] ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                    >
                                        {selected[i] ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PDF Preview and Signature Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-center">Contract Finalization</h2>

                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setShowPdfPreview(!showPdfPreview)}
                            className="btn btn-primary"
                        >
                            {showPdfPreview ? 'Hide Contract' : 'View Contract'}
                        </button>

                        <a
                            href="/Flush_warranty.pdf"
                            download="septic_service_agreement.pdf"
                            className="btn btn-secondary"
                        >
                            Download Contract
                        </a>
                    </div>

                    {showPdfPreview && (
                        <div className="pdf-preview-container mb-8">
                            <PdfViewer contactData={contactData} signatureData={signatureData} />
                        </div>
                    )}
                    <div className="signature-section">
                        <h3 className="text-xl text-center font-semibold mb-4">Add Your Signature</h3>
                        <SignatureComponent onSave={setSignatureData} />
                        {signatureData && (
                            <div className="mt-4">
                                <p className="text-green-600 text-center">Signature saved successfully!</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        {!signatureData && (
                            <div className="text-red-600 text-center">
                                Please enter your signature first before proceeding to payment
                            </div>
                        )}

                        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                            <div className="text-xl font-semibold">
                                Total Payment: <span className="text-blue-600">${totalPayment.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (!signatureData) return;
                                    handlePayout();
                                }}
                                className={`btn px-6 py-3 text-lg ${totalPayment === 0 || !signatureData
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                disabled={totalPayment === 0 || !signatureData}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <FlushWarrantyFooter />
        </>
    );
}

export default Agreement;