const express = require('express');
const router = express.Router();
const {
  createDonation,
  getCampaignDonations,
  getMyDonations,
} = require('../controllers/donationController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Make a donation (supports guest or authenticated user)
router.post('/', optionalAuth, createDonation);

// Get donations for a specific campaign
router.get('/campaign/:campaignId', getCampaignDonations);

// Get donation history for the logged-in user
router.get('/my', verifyToken, getMyDonations);

module.exports = router;
