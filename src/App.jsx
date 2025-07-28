import AboutAll from "./components/AboutUs/aboutAll";
import BillingForm from "./components/Billing/billingForm";
import ContactAll from "./components/ContactUs/contactAll";
import FAQAccordion from "./pages/Home/faqAccordion";
import FlushWarrantyFooter from "./components/Footer/flushWarrantyFooter";
import FlushWarrantyLandingPage from "./pages/Home/flushWarrantyLandingPage";
import FlushWarranty from "./pages/Home/flushWarrantyVideo";
import HowItWorks from "./pages/Home/howItWorks";
import LostPassword from "./components/LostPassword/LostPassword";
import MyAccount from "./components/MyAccount/MyAccount";
import SignUp from "./components/MyAccount/SignUp";
import PropertySale from "./pages/Home/propertySale";
import ProtectionPlan from "./pages/Home/protectionPlan";
import SepticSystemSlider from "./pages/Home/septicSystemSlider";
import Shop from "./pages/Shop/Shop";
import TestimonialsComponent from "./pages/Home/testimonialsComponent";
import Agreement from "./pages/Agreement/Agrement";
import Dashboard from "./pages/Home/Dashboard";
import PaymentMethod from "./pages/Payment/PaymentMethod";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RefreshTokenComponent from "./components/token/RefreshTokenComponent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/about-us" element={<AboutAll />} />
        <Route path="/contact-us" element={<ContactAll />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/lost-password" element={<LostPassword />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/billing" element={<BillingForm />} />
        <Route path="/payment/:id" element={<Agreement />} />
        <Route path="/payment-method" element={<PaymentMethod />} />
        <Route path="/refresh-token" element={<RefreshTokenComponent />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <>
              <div
                style={{
                  // padding-: "25px",
                  backgroundColor: "white",
                }}
              >
                <FlushWarrantyLandingPage />
                <ProtectionPlan />
                <PropertySale />
                <HowItWorks id="how-it-works" />
                <FlushWarranty />
                <SepticSystemSlider />
                <TestimonialsComponent />
                <FAQAccordion id="faq" />
                <FlushWarrantyFooter />
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
