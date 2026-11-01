const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getAdminDashboard,
  updateCampaignStatus,
} = require('../controllers/dashboardController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// User dashboard
router.get('/user', verifyToken, getUserDashboard);

// Admin dashboard & actions (strictly protected by verifyToken + requireAdmin)
router.get('/admin', verifyToken, requireAdmin, getAdminDashboard);
router.patch('/admin/campaigns/:id/status', verifyToken, requireAdmin, updateCampaignStatus);

module.exports = router;
