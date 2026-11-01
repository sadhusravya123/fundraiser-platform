const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// @desc    Process a new demo donation
// @route   POST /api/donations
// @access  Public (Optional authentication)
exports.createDonation = async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      donorName,
      donorEmail,
      message = '',
      isAnonymous = false,
      paymentMethod = 'Demo Card',
    } = req.body;

    if (!campaignId || !amount || !donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Campaign, donation amount, donor name, and email are required.',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be greater than $0.',
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Target campaign not found.',
      });
    }

    // Generate unique demo transaction ID
    const transactionId = `DEMO-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create donation record
    const donation = await Donation.create({
      campaign: campaign._id,
      donor: req.user ? req.user._id : null,
      donorName: donorName.trim(),
      donorEmail: donorEmail.toLowerCase().trim(),
      amount: numAmount,
      message: message ? message.trim() : '',
      isAnonymous: Boolean(isAnonymous),
      paymentStatus: 'completed',
      transactionId,
      paymentMethod,
    });

    // Atomically increment campaign raisedAmount & donorCount
    const newRaised = campaign.raisedAmount + numAmount;
    const updateFields = {
      $inc: { raisedAmount: numAmount, donorCount: 1 },
    };

    // Auto mark completed if goal reached
    if (newRaised >= campaign.goalAmount && campaign.status === 'active') {
      // Keep active so donors can continue giving if they wish, or tag status
    }

    await Campaign.findByIdAndUpdate(campaign._id, updateFields);

    const updatedCampaign = await Campaign.findById(campaign._id);

    return res.status(201).json({
      success: true,
      message: 'Demo donation processed successfully! Thank you for your generosity.',
      donation: {
        _id: donation._id,
        transactionId: donation.transactionId,
        amount: donation.amount,
        donorName: donation.isAnonymous ? 'Anonymous Donor' : donation.donorName,
        donorEmail: donation.donorEmail,
        message: donation.message,
        isAnonymous: donation.isAnonymous,
        paymentStatus: donation.paymentStatus,
        paymentMethod: donation.paymentMethod,
        createdAt: donation.createdAt,
        campaign: {
          _id: campaign._id,
          title: campaign.title,
        },
      },
      updatedCampaign: {
        _id: updatedCampaign._id,
        raisedAmount: updatedCampaign.raisedAmount,
        donorCount: updatedCampaign.donorCount,
        progressPercentage: updatedCampaign.progressPercentage,
      },
    });
  } catch (error) {
    console.error('Create donation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process donation.',
    });
  }
};

// @desc    Get donations for a specific campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Public
exports.getCampaignDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      campaign: req.params.campaignId,
      paymentStatus: 'completed',
    })
      .sort({ createdAt: -1 })
      .select('donorName amount message isAnonymous createdAt transactionId paymentMethod');

    const sanitized = donations.map((d) => ({
      _id: d._id,
      donorName: d.isAnonymous ? 'Anonymous Donor' : d.donorName,
      amount: d.amount,
      message: d.message,
      createdAt: d.createdAt,
      transactionId: d.transactionId,
      paymentMethod: d.paymentMethod,
    }));

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      donations: sanitized,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donations.',
    });
  }
};

// @desc    Get all donations made by the authenticated user
// @route   GET /api/donations/my
// @access  Private
exports.getMyDonations = async (req, res) => {
  try {
    // Match by user ID or email
    const donations = await Donation.find({
      $or: [{ donor: req.user._id }, { donorEmail: req.user.email }],
      paymentStatus: 'completed',
    })
      .populate('campaign', 'title category image goalAmount raisedAmount status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your donation history.',
    });
  }
};
