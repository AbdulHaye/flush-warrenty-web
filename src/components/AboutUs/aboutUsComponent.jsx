import React from 'react';
import aboutus from "../../assets/aboutus.png"
import underline from '../../assets/underline_image.png';

const AboutUsComponent = () => {
  return (
    <div className="bg-blue-50 p-16 flex justify-center items-center min-h-screen">
      <div className="max-w-4xl mx-auto text-center md:text-left">
        <h2 className="text-4xl font-bold text-blue-900 mb-2">About US</h2>
        <div className="">
            
                    <img src={underline} alt="underline" className="w-40" />
                 
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="text-white text-2xl font-bold">
                <img src={aboutus}/>
          </div>
          <div className="text-blue-900 max-w-xl">
            <h3 className="text-3xl font-semibold mb-2">Flush Warranty: Ensuring Your Peace of Mind</h3>
            <div className="">
            
            <img src={underline} alt="underline" className="w-40" />
         
</div>            <p className="text-lg mb-4">
              Flush Warranty was founded on a deep commitment to safeguard homeowners from the unexpected costs and stress that can arise from septic system failures. With over four decades of industry experience, our team understands the complexities of septic systems and the challenges homeowners face. We've seen how simple oversights, like missed maintenance, can lead to costly issues that impact both finances and peace of mind.
            </p>
            <p className="text-lg">
              At Flush Warranty, our mission is to remove these worries entirely, offering homeowners a reliable safeguard against unforeseen expenses. Our promise is straightforward: Just FLUSH, and leave the rest to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsComponent;