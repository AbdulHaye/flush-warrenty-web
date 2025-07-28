require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  ghlApiUrl: "https://rest.gohighlevel.com/v1",
  ghlAuthUrl: "https://services.leadconnectorhq.com/oauth/token",
  ghlApiVersion: "2021-07-28",
  nmiApiUrl: process.env.NMI_API_URL,
  customValueId: "ZKXV4IYMT4uPQkQ0GV3G",
  redirectUri:
    "https://webhook.site/ec94c8d3-0d37-4c5f-9587-ce56db72d44c/oauth/callback",
};
