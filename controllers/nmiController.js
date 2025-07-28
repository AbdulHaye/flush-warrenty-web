const nmiService = require("../services/nmiService");

exports.createSubscription = async (req, res) => {
  try {
    const data = await nmiService.createSubscription(req.body.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
