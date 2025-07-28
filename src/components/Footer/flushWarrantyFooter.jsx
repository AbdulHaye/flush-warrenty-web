import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import footer_icon from "../../assets/footer_icon.png"
const FlushWarrantyFooter = () => {
  return (
    <footer className="bg-[#1b1b27] text-white py-10 flex flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <img src={footer_icon} alt="Flush Warranty" className="h-16" />
   
      </div>
      <div className="text-center space-y-1">
        <p>3-B Nod Pl Clinton, CT, United States</p>
        <p>nicholas.anderson@flushwarranty.com</p>
        <p>203-707-8370</p>
      </div>
      <div className="flex space-x-4">
        <a href="#" aria-label="Facebook" className="text-blue-500">
          <FaFacebook size={32} />
        </a>
        <a href="#" aria-label="Instagram" className="text-pink-500">
          <FaInstagram size={32} />
        </a>
      </div>
      <div className="text-center">
        <p className="text-gray-400">© 2024 FLUSH Warranty</p>
      </div>
    </footer>
  );
};

export default FlushWarrantyFooter;
