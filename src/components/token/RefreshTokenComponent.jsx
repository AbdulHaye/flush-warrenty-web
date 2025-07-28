import React, { useState, useEffect } from "react";
import {
  fetchTokenFromGHL,
  updateTokenInGHL,
  refreshToken,
} from "./tokenUtils";

function RefreshTokenComponent() {
  const [message, setMessage] = useState("Refreshing token...");

  useEffect(() => {
    const refresh = async () => {
      try {
        const tokenData = await fetchTokenFromGHL();
        const newTokenData = await refreshToken(tokenData.refresh_token);
        await updateTokenInGHL(newTokenData);
        setMessage("Token refreshed successfully");
      } catch (error) {
        setMessage("Failed to refresh token: " + error.message);
      }
    };
    refresh();
  }, []);

  return (
    <div className="w-full max-w-screen-lg mx-auto my-15 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Refresh Token</h2>
      <p className="text-center">{message}</p>
    </div>
  );
}

export default RefreshTokenComponent;
