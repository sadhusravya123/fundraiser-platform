const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get user dashboard stats and personal records
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Campaigns created by user
    const myCampaigns = await Campaign.find({ organizer: userId }).sort({
      createdAt: -1,
    });

    // Donations made by user
    const myDonations = await Donation.find({
      $or: [{ donor: userId }, { donorEmail: req.user.email }],
      paymentStatus: 'completed',
    })
      .populate('campaign', 'title category image goalAmount raisedAmount status')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const totalDonated = myDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalRaised = myCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const activeCampaignsCount = myCampaigns.filter((c) => c.status === 'active').length;

    return res.status(200).json({
      success: true,
      stats: {
        totalDonated,
        totalDonationsCount: myDonations.length,
        totalRaised,
        campaignsCreated: myCampaigns.length,
        activeCampaignsCount,
      },
      campaigns: myCampaigns,
      donations: myDonations,
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user dashboard data.',
    });
  }
};

// @desc    Get platform-wide admin metrics and management tables
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDonations = await Donation.countDocuments({ paymentStatus: 'completed' });

    // Calculate total raised amount across all campaigns
    const donationSumResult = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalFundsRaised = donationSumResult.length > 0 ? donationSumResult[0].totalAmount : 0;

    // Fetch campaigns for moderation
    const campaigns = await Campaign.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    // Fetch users list
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Fetch recent donations audit log
    const recentDonations = await Donation.find()
      .populate('campaign', 'title category')
      .populate('donor', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      stats: {
        totalCampaigns,
        totalUsers,
        totalDonations,
        totalFundsRaised,
      },
      campaigns,
      users,
      recentDonations,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard data.',
    });
  }
};

// @desc    Admin: Update status of any campaign (approve, reject, activate, complete)
// @route   PATCH /api/dashboard/admin/campaigns/:id/status
// @access  Private (Admin only)
exports.updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['active', 'completed', 'pending', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('organizer', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign status updated to '${status}' successfully.`,
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update campaign status.',
    });
  }
};
