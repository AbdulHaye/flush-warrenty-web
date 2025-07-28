import axios from "axios";
import qs from "qs";

export const fetchTokenFromGHL = async () => {
  try {
    const response = await axios.get(
      "https://rest.gohighlevel.com/v1/custom-values/ZKXV4IYMT4uPQkQ0GV3G",
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          Accept: "application/json",
          Version: "2021-07-28",
        },
      }
    );
    let tokenData = JSON.parse(response.data.value);
    if (!tokenData.expiresAt && tokenData.expires_in) {
      tokenData.expiresAt = Date.now() + tokenData.expires_in * 1000;
    }
    return tokenData;
  } catch (error) {
    console.error("Failed to fetch token from GHL:", error);
    throw error;
  }
};

export const updateTokenInGHL = async (newTokenData) => {
  try {
    await axios.put(
      `https://rest.gohighlevel.com/v1/custom-values/ZKXV4IYMT4uPQkQ0GV3G`,
      {
        value: JSON.stringify(newTokenData),
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GHL_API_TOKEN}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
      }
    );
  } catch (error) {
    console.error("Failed to update token in GHL:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  const payload = {
    client_id: import.meta.env.VITE_GHL_CLIENT_ID,
    client_secret: import.meta.env.VITE_GHL_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    user_type: "Location",
    redirect_uri:
      "https://webhook.site/ec94c8d3-0d37-4c5f-9587-ce56db72d44c/oauth/callback",
  };

  const data = qs.stringify(payload);

  try {
    const response = await axios.post(
      "https://services.leadconnectorhq.com/oauth/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );
    const newTokens = response.data;
    newTokens.expiresAt = Date.now() + newTokens.expires_in * 1000;
    return newTokens;
  } catch (error) {
    console.error(
      "Failed to refresh token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh token: " + error.message);
  }
};
