const axios = require("axios");
const qs = require("qs");
const config = require("../config/config");

const ghlApi = axios.create({
  baseURL: config.ghlApiUrl,
  headers: {
    Authorization: `Bearer ${process.env.VITE_GHL_API_TOKEN}`,
    Accept: "application/json",
    Version: config.ghlApiVersion,
  },
});

exports.getCustomValue = async (id) => {
  const response = await ghlApi.get(`/custom-values/${id}`);
  return response.data;
};

exports.updateCustomValue = async (id, data) => {
  const response = await ghlApi.put(`/custom-values/${id}`, data);
  return response.data;
};

exports.getContact = async (id) => {
  const response = await ghlApi.get(`/contacts/${id}`);
  return response.data;
};

exports.updateContact = async (id, data) => {
  const response = await ghlApi.put(`/contacts/${id}`, data);
  return response.data;
};

exports.refreshToken = async (refreshToken) => {
  const payload = {
    client_id: process.env.VITE_GHL_CLIENT_ID,
    client_secret: process.env.VITE_GHL_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    user_type: "Location",
    redirect_uri: config.redirectUri,
  };
  const data = qs.stringify(payload);
  const response = await axios.post(config.ghlAuthUrl, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });
  return response.data;
};
