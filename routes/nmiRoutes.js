const express = require("express");
const router = express.Router();
const nmiController = require("../controllers/nmiController");

router.post("/nmi-subscription", nmiController.createSubscription);
router.post("/nmi-webhook", nmiController.handleWebhook);

module.exports = router;
