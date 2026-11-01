const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// @desc    Get all campaigns with filters, search, sort, and pagination
// @route   GET /api/campaigns
// @access  Public
exports.getAllCampaigns = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      sort,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Search query across title and description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'All' && status !== '') {
      query.status = status;
    } else if (!status) {
      // By default show active campaigns, but allow completed
      // if not specified in admin dashboard
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Sort order
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'most-funded') {
      sortOptions = { raisedAmount: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'goal-high') {
      sortOptions = { goalAmount: -1 };
    } else if (sort === 'goal-low') {
      sortOptions = { goalAmount: 1 };
    } else if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalCampaigns = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate('organizer', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      total: totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / limitNum) || 1,
      currentPage: pageNum,
      campaigns,
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns.',
      error: error.message,
    });
  }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      'organizer',
      'name email avatar createdAt'
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
    }

    // Fetch recent 10 donations for this campaign
    const recentDonations = await Donation.find({
      campaign: campaign._id,
      paymentStatus: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('donorName amount message isAnonymous createdAt transactionId paymentMethod');

    // Mask anonymous names
    const sanitizedDonations = recentDonations.map((d) => ({
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
      campaign,
      recentDonations: sanitizedDonations,
    });
  } catch (error) {
    console.error('Get campaign by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign details.',
    });
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private (Authenticated users)
exports.createCampaign = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      image,
      goalAmount,
      deadline,
    } = req.body;

    if (!title || !shortDescription || !description || !category || !image || !goalAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required to launch a campaign.',
      });
    }

    const numGoal = parseFloat(goalAmount);
    if (isNaN(numGoal) || numGoal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Goal amount must be a positive number greater than zero.',
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign deadline must be a valid future date.',
      });
    }

    const campaign = await Campaign.create({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category,
      image: image.trim(),
      goalAmount: numGoal,
      raisedAmount: 0,
      donorCount: 0,
      deadline: deadlineDate,
      organizer: req.user._id,
      status: 'active',
      updates: [
        {
          title: 'Campaign Launched! 🚀',
          content: 'Thank you for supporting this cause. Our campaign is officially live!',
          date: new Date(),
        },
      ],
    });

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      'organizer',
      'name email avatar'
    );

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully!',
      campaign: populatedCampaign,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create campaign.',
    });
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Organizer or Admin)
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
    }

    // Verify ownership or admin privileges
    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only update campaigns you created.',
      });
    }

    const {
      title,
      shortDescription,
      description,
      category,
      image,
      goalAmount,
      deadline,
      status,
    } = req.body;

    if (title) campaign.title = title.trim();
    if (shortDescription) campaign.shortDescription = shortDescription.trim();
    if (description) campaign.description = description.trim();
    if (category) campaign.category = category;
    if (image) campaign.image = image.trim();
    if (goalAmount && !isNaN(goalAmount)) campaign.goalAmount = parseFloat(goalAmount);
    if (deadline) campaign.deadline = new Date(deadline);
    if (status && (isAdmin || isOwner)) campaign.status = status;

    await campaign.save();

    const updated = await Campaign.findById(campaign._id).populate(
      'organizer',
      'name email avatar'
    );

    return res.status(200).json({
      success: true,
      message: 'Campaign updated successfully!',
      campaign: updated,
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update campaign.',
    });
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Organizer or Admin)
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
    }

    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete campaigns you created.',
      });
    }

    // Delete associated donations
    await Donation.deleteMany({ campaign: campaign._id });
    await Campaign.findByIdAndDelete(campaign._id);

    return res.status(200).json({
      success: true,
      message: 'Campaign and associated donations deleted successfully.',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete campaign.',
    });
  }
};

// @desc    Add a progress update to a campaign
// @route   POST /api/campaigns/:id/updates
// @access  Private (Organizer or Admin)
exports.addCampaignUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Update title and content are required.',
      });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
    }

    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only organizers or admins can add updates.',
      });
    }

    campaign.updates.unshift({
      title: title.trim(),
      content: content.trim(),
      date: new Date(),
    });

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: 'Campaign update posted successfully!',
      updates: campaign.updates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to post campaign update.',
    });
  }
};
