import React from "react";
import Wave from "react-wavify";
import logoLoader from "../../assets/logo-loader.png";

const Loader = ({ imageSrc = logoLoader, width = 200, height = 200 }) => {
  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "50%",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={imageSrc}
        alt="Loading..."
        style={{
          width: "85%",
          height: "85%",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "80%",
          zIndex: 0, // Changed to 0 to place wave behind the image
        }}
      >
        <Wave
          fill="#FFFFFF"
          paused={false}
          options={{
            height: 20,
            amplitude: 20,
            speed: 0.2,
            points: 3,
          }}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            animation: "fillUp 4s ease-in-out forwards",
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
