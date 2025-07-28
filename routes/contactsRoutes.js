const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

router.get('/:id', contactsController.getContact);
router.put('/:id', contactsController.updateContact);

module.exports = router;