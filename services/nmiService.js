const axios = require("axios");
const config = require("../config/config");

exports.createSubscription = async (params) => {
  const response = await axios.post(config.nmiApiUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};
