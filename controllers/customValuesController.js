const ghlService = require('../services/ghlService');

exports.getCustomValue = async (req, res) => {
  try {
    const data = await ghlService.getCustomValue(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GHL API', details: error.message });
  }
};

exports.updateCustomValue = async (req, res) => {
  try {
    const data = await ghlService.updateCustomValue(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update GHL API', details: error.message });
  }
};