const express = require('express');
const router = express.Router();
const customValuesController = require('../controllers/customValuesController');

router.get('/:id', customValuesController.getCustomValue);
router.put('/:id', customValuesController.updateCustomValue);

module.exports = router;