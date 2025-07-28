const express = require("express");
const router = express.Router();
const nmiController = require("../controllers/nmiController");

router.post("/nmi-subscription", nmiController.createSubscription);

module.exports = router;
