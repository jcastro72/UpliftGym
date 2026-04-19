const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/', pricingController.getPricing);
router.put('/', pricingController.updatePricing);

module.exports = router;