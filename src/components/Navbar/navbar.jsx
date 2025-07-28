import React, { useState } from "react";
import { Menu, X, Phone, User } from "lucide-react";
import footer_icon from "../../assets/footer_icon.png";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./navbarStyle.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollLink = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  React.useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo - always on left */}
        <div className="logo-container">
          <NavLink to="/">
            <img src={footer_icon} alt="Flush Logo" className="logo-img" />
          </NavLink>
        </div>

        {/* Centered contact info (shown only below 1250px) */}
        <div className="mobile-contact-info">
          <span className="mobile-phone-number">
            <Phone size={18} className="icon" /> (203)-707-8370
          </span>
          <NavLink
            to="/my-account"
            className="mobile-account-link"
            onClick={() => setIsOpen(false)}
          >
            <User size={18} className="icon" /> My Account
          </NavLink>
        </div>

        {/* Desktop nav (shown above 1250px) */}
        <div className="desktop-nav">
          <div className="nav-links-container">
            <nav className="main-nav">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active " : "nav-link scroll-link"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/about-us"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link scroll-link"
                }
              >
                About Us
              </NavLink>
              <button
                onClick={() => handleScrollLink("how-it-works")}
                className="nav-link scroll-link"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollLink("faq")}
                className="nav-link scroll-link"
              >
                FAQ's
              </button>
              <NavLink
                to="/contact-us"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link scroll-link"
                }
              >
                Contact Us
              </NavLink>
            </nav>
          </div>
          <div className="desktop-contact-info">
            <span className="phone-number">
              <Phone size={18} className="icon iconofphonenumberandaccount" />{" "}
              (203)-707-8370
            </span>
            <NavLink to="/my-account" className="account-link">
              <User size={18} className="icon iconofphonenumberandaccount" /> My
              Account
            </NavLink>
          </div>
        </div>

        {/* Mobile menu button - always on right */}
        <div className="mobile-menu-button">
          <button onClick={() => setIsOpen(!isOpen)} className="menu-toggle">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="mobile-nav">
          <nav className="mobile-nav-links">
            <NavLink
              to="/"
              className="mobile-nav-link"
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about-us"
              className="mobile-nav-link"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </NavLink>
            <button
              onClick={() => {
                handleScrollLink("how-it-works");
                setIsOpen(false);
              }}
              className="mobile-nav-link scroll-link"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                handleScrollLink("faq");
                setIsOpen(false);
              }}
              className="mobile-nav-link scroll-link"
            >
              FAQ's
            </button>
            <NavLink
              to="/contact-us"
              className="mobile-nav-link"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
