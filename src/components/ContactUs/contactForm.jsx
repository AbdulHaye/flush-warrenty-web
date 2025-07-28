import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import underline from "./../../assets/underline_image.png";
import Toast from "../../components/Toast/Toast";

// Validation schema with enhanced rules
const validationSchema = Yup.object({
  firstName: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "First name must contain only letters and spaces")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Last name must contain only letters and spaces")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address (e.g., example@domain.com)"
    )
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Phone number must contain only numbers")
    .min(10, "Phone number must be exactly 10 digits")
    .max(10, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  message: Yup.string()
    .min(10, "Message must be at least 10 characters long")
    .max(500, "Message cannot exceed 500 characters")
    .required("Message is required"),
});

const ContactForm = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    // Debug: Log the values being sent
    console.log("Form Values:", values);

    try {
      const response = await axios.post(
        "https://rest.gohighlevel.com/v1/contacts/",
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          tags: ["general-inquiry"],
          customField: [
            {
              id: "CYEXzqZyjj4blhEl4xLu",
              value: values.message,
            },
          ],
          updateIfDuplicate: true,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
            "Content-Type": "application/json",
            "Location-Id": import.meta.env.VITE_GHL_LOCATION_ID,
          },
        }
      );

      console.log("Contact created/updated:", response.data);
      showToast("Contact submitted successfully!", "success");
      resetForm();
    } catch (error) {
      console.error(
        "Error submitting contact:",
        error.response?.data || error.message
      );
      if (
        error.response?.data?.message?.includes("customField") ||
        error.response?.data?.message?.includes("CYEXzqZyjj4blhEl4xLu")
      ) {
        showToast(
          "Contact submitted, but message field may not have been saved.",
          "warning"
        );
      } else {
        showToast(
          error.response?.data?.message ||
            "Failed to submit contact. Please try again.",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle phone input to allow only numbers
  const handlePhoneInput = (e, handleChange) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = numericValue;
    handleChange(e);
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center p-8 gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-4xl font-bold text-gray-800">Contact Us</h2>
        <img src={underline} className="mt-5" alt="Underline decoration" />
        <p className="text-gray-600 max-w-sm mt-5">
          Feel free to reach out to us for any inquiries or support. We’re here
          to help and will get back to you as soon as possible. You can contact
          us via email, phone, or by filling out the form below. We look forward
          to hearing from you!
        </p>
        {/* <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full mt-9">
          READ MORE
        </button> */}
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        )}
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            message: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, handleChange }) => (
            <Form className="space-y-4">
              <label className="block text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Field
                  name="firstName"
                  placeholder="First Name"
                  className={`w-1/2 p-2 border rounded-lg ${
                    errors.firstName && touched.firstName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <Field
                  name="lastName"
                  placeholder="Last Name"
                  className={`w-1/2 p-2 border rounded-lg ${
                    errors.lastName && touched.lastName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              <ErrorMessage
                name="firstName"
                component="div"
                className="text-red-500 text-sm"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="text-red-500 text-sm"
              />

              <label className="block text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className={`w-full p-2 border rounded-lg ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />

              <label className="block text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <Field
                name="phone"
                placeholder="Phone (10 digits)"
                className={`w-full p-2 border rounded-lg ${
                  errors.phone && touched.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                onChange={(e) => handlePhoneInput(e, handleChange)}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm"
              />

              <label className="block text-gray-700">
                Comment or Message <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                name="message"
                placeholder="Message (min 10 characters)"
                className={`w-full p-2 border rounded-lg h-24 ${
                  errors.message && touched.message
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="message"
                component="div"
                className="text-red-500 text-sm"
              />

              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ContactForm;
