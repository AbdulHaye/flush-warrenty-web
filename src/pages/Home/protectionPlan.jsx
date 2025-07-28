import React from "react";
import Wallet from ".././../assets/icon1.png";
import Clock from ".././../assets/icon2.png";
import Brain from ".././../assets/icon3.png";
import underline from "../../assets/underline_image.png";
import "./protectionPlanStyle.css";

const ProtectionPlan = () => {
  return (
    <>
      <div className="protection-plan-container">
        <h2 className="protection-plan-title">
          Why do you need a septic system protection plan?
        </h2>

        <div className="underline-container">
          <img src={underline} alt="underline decoration" />
        </div>
      </div>

      <div className="protection-plan-container1">
        <div className="cards-container">
          {/* Card 1 */}
          <div className="protection-card">
            <img src={Wallet} alt="Wallet icon" className="card-icon" />
            <h3 className="card-title">Your Wallet</h3>
            <p className="card-description">
              Helps you pay for large repair and replacement costs
            </p>
          </div>

          {/* Card 2 */}
          <div className="protection-card">
            <img src={Clock} alt="Clock icon" className="card-icon" />
            <h3 className="card-title">Your Time</h3>
            <p className="card-description">
              Eliminates the hassle of finding qualified service providers
            </p>
          </div>

          {/* Card 3 */}
          <div className="protection-card">
            <img src={Brain} alt="Brain icon" className="card-icon" />
            <h3 className="card-title">Your Peace Of Mind</h3>
            <p className="card-description">
              Gives you a plan, and partner, to deal with the unexpected.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtectionPlan;
