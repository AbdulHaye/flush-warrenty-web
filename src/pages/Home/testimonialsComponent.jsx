import React from "react";
import underline from "../../assets/underline_image.png";
import "./testimonialsComponentStyle.css";
const testimonials = [
  {
    name: "Trevor",
    text: "I almost didn’t buy my house because I didn’t want a house with a septic system. Having a FLUSH Warranty made me feel like I had city sewers.",
    rating: 5,
  },
  {
    name: "Riley",
    text: "I always forget to have my septic tank pumped and wait until I back up. Never have to worry about that again because they come automatically. Thanks Nick and Dean!!",
    rating: 5,
  },
  { name: "Ashley", text: "Great service and priced right.", rating: 5 },
];

const TestimonialsComponent = () => {
  return (
    <>
      <div className="testimonials-container">
        <h2 className="testimonials-title">Customer Testimonials</h2>
        <div className="underline-container">
          <img
            src={underline}
            alt="underline decoration"
            className="underline-image"
          />
        </div>
      </div>

      <div className="testimonials-container1">
        <div className="testimonials-list">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-item">
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <div className="rating-container">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="star">
                    ★
                  </span>
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TestimonialsComponent;
