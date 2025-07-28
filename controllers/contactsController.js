const ghlService = require("../services/ghlService");

exports.getContact = async (req, res) => {
  try {
    const data = await ghlService.getContact(req.params.id);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch contact from GHL API",
        details: error.message,
      });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const data = await ghlService.updateContact(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to update contact in GHL API",
        details: error.message,
      });
  }
};
