const express = require('express');
const router = express.Router();
const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignUpdate,
} = require('../controllers/campaignController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);

// Protected routes
router.post('/', verifyToken, createCampaign);
router.put('/:id', verifyToken, updateCampaign);
router.delete('/:id', verifyToken, deleteCampaign);
router.post('/:id/updates', verifyToken, addCampaignUpdate);

module.exports = router;
