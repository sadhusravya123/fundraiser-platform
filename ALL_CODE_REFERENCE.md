# KindWave — Complete Project Implementation Reference

This document compiles the **complete, working source code** of all critical Backend and Frontend modules of the **KindWave Fundraiser Platform (MERN Stack)** into a single organized reference.

---

# Table of Contents
1. [Backend: Architecture & Config](#1-backend-architecture--config)
   - [1.1 server/server.js](#11-serverserverjs)
   - [1.2 server/config/db.js](#12-serverconfigdbjs)
2. [Backend: Data Models (Mongoose)](#2-backend-data-models-mongoose)
   - [2.1 server/models/User.js](#21-servermodelsuserjs)
   - [2.2 server/models/Campaign.js](#22-servermodelscampaignjs)
   - [2.3 server/models/Donation.js](#23-servermodelsdonationjs)
3. [Backend: Middleware (Security & RBAC)](#3-backend-middleware-security--rbac)
   - [3.1 server/middleware/auth.js](#31-servermiddlewareauthjs)
4. [Backend: Controllers (Business Logic)](#4-backend-controllers-business-logic)
   - [4.1 server/controllers/authController.js](#41-servercontrollersauthcontrollerjs)
   - [4.2 server/controllers/campaignController.js](#42-servercontrollerscampaigncontrollerjs)
   - [4.3 server/controllers/donationController.js](#43-servercontrollersdonationcontrollerjs)
   - [4.4 server/controllers/dashboardController.js](#44-servercontrollersdashboardcontrollerjs)
5. [Backend: API Routes](#5-backend-api-routes)
   - [5.1 server/routes/authRoutes.js](#51-serverroutesauthroutesjs)
   - [5.2 server/routes/campaignRoutes.js](#52-serverroutescampaignroutesjs)
   - [5.3 server/routes/donationRoutes.js](#53-serverroutesdonationroutesjs)
   - [5.4 server/routes/dashboardRoutes.js](#54-serverroutesdashboardroutesjs)
6. [Backend: Database Seeder](#6-backend-database-seeder)
   - [6.1 server/seed.js](#61-serverseedjs)
7. [Frontend: Core Routing & Services](#7-frontend-core-routing--services)
   - [7.1 client/src/App.jsx](#71-clientsrcappjsx)
   - [7.2 client/src/services/api.js](#72-clientsrcservicesapijs)
8. [Frontend: Global State Management (Contexts)](#8-frontend-global-state-management-contexts)
   - [8.1 client/src/context/AuthContext.jsx](#81-clientsrccontextauthcontextjsx)
   - [8.2 client/src/context/ToastContext.jsx](#82-clientsrccontexttoastcontextjsx)
9. [Frontend: Key UI Components](#9-frontend-key-ui-components)
   - [9.1 client/src/components/DonationModal.jsx](#91-clientsrccomponentsdonationmodaljsx)
   - [9.2 client/src/components/DonationReceiptModal.jsx](#92-clientsrccomponentsdonationreceiptmodaljsx)
   - [9.3 client/src/components/CampaignCard.jsx](#93-clientsrccomponentscampaigncardjsx)
   - [9.4 client/src/components/ProgressBar.jsx](#94-clientsrccomponentsprogressbarjsx)
10. [Frontend: Primary Pages](#10-frontend-primary-pages)
    - [10.1 client/src/pages/Home.jsx](#101-clientsrcpageshomejsx)
    - [10.2 client/src/pages/ExploreCampaigns.jsx](#102-clientsrcpagesexplorecampaignsjsx)
    - [10.3 client/src/pages/CampaignDetails.jsx](#103-clientsrcpagescampaigndetailsjsx)
    - [10.4 client/src/pages/CreateCampaign.jsx](#104-clientsrcpagescreatecampaignjsx)
    - [10.5 client/src/pages/UserDashboard.jsx](#105-clientsrcpagesuserdashboardjsx)
    - [10.6 client/src/pages/AdminDashboard.jsx](#106-clientsrcpagesadmindashboardjsx)
    - [10.7 client/src/pages/Login.jsx](#107-clientsrcpagesloginjsx)
11. [Environment & Package Manifests](#11-environment--package-manifests)

---

# 1. Backend: Architecture & Config

### 1.1 `server/server.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Fundraiser Platform API is operational.',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  🌟 Fundraiser Platform Backend Running!     `);
  console.log(`  🌐 Port: http://localhost:${PORT}           `);
  console.log(`  📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = app;
```

### 1.2 `server/config/db.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fundraiser_db');
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

# 2. Backend: Data Models (Mongoose)

### 2.1 `server/models/User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
```

### 2.2 `server/models/Campaign.js`
```javascript
const mongoose = require('mongoose');

const campaignUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short summary is required'],
      trim: true,
      maxlength: [240, 'Short summary cannot exceed 240 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full campaign description is required'],
    },
    category: {
      type: String,
      required: [true, 'Please select a campaign category'],
      enum: [
        'Medical',
        'Education',
        'Environment',
        'Animal Welfare',
        'Community',
        'Emergency',
        'Other',
      ],
      default: 'Community',
    },
    image: {
      type: String,
      required: [true, 'Campaign image URL is required'],
    },
    goalAmount: {
      type: Number,
      required: [true, 'Fundraising goal is required'],
      min: [10, 'Goal amount must be at least $10'],
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Campaign deadline date is required'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'pending', 'rejected'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    updates: [campaignUpdateSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function () {
  if (!this.goalAmount || this.goalAmount <= 0) return 0;
  const pct = Math.round((this.raisedAmount / this.goalAmount) * 100);
  return pct;
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
```

### 2.3 `server/models/Donation.js`
```javascript
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation must be at least $1'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'pending', 'demo'],
      default: 'completed',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      default: 'Demo Card',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
```

---

# 3. Backend: Middleware (Security & RBAC)

### 3.1 `server/middleware/auth.js`
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user via JWT Bearer token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_fundraiser_jwt_key_2026_secure!'
    );

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
};

// Require administrator role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator privileges required.',
    });
  }
  next();
};

// Optional token extraction (for guest or logged-in donations)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_fundraiser_jwt_key_2026_secure!'
      );
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Graceful fallback for non-authenticated guests
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
};
```

---

# 4. Backend: Controllers (Business Logic)

### 4.1 `server/controllers/authController.js`
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'super_secret_fundraiser_jwt_key_2026_secure!',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
};
```

### 4.2 `server/controllers/campaignController.js`
```javascript
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// @desc    Get all campaigns with filters, search, sort, and pagination
// @route   GET /api/campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const { search, category, status, sort, featured, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== '') query.category = category;
    if (status && status !== 'All' && status !== '') query.status = status;
    if (featured === 'true') query.featured = true;

    let sortOptions = { createdAt: -1 };
    if (sort === 'most-funded') sortOptions = { raisedAmount: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'goal-high') sortOptions = { goalAmount: -1 };
    else if (sort === 'goal-low') sortOptions = { goalAmount: 1 };
    else if (sort === 'deadline') sortOptions = { deadline: 1 };

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
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns.',
      error: error.message,
    });
  }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      'organizer',
      'name email avatar createdAt'
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const recentDonations = await Donation.find({
      campaign: campaign._id,
      paymentStatus: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('donorName amount message isAnonymous createdAt transactionId paymentMethod');

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
    return res.status(500).json({ success: false, message: 'Failed to retrieve campaign details.' });
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
exports.createCampaign = async (req, res) => {
  try {
    const { title, shortDescription, description, category, image, goalAmount, deadline } = req.body;

    if (!title || !shortDescription || !description || !category || !image || !goalAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'All fields are required to launch a campaign.' });
    }

    const numGoal = parseFloat(goalAmount);
    if (isNaN(numGoal) || numGoal <= 0) {
      return res.status(400).json({ success: false, message: 'Goal amount must be a positive number greater than zero.' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Campaign deadline must be a valid future date.' });
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

    const populatedCampaign = await Campaign.findById(campaign._id).populate('organizer', 'name email avatar');

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully!',
      campaign: populatedCampaign,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create campaign.' });
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only update campaigns you created.' });
    }

    const { title, shortDescription, description, category, image, goalAmount, deadline, status } = req.body;

    if (title) campaign.title = title.trim();
    if (shortDescription) campaign.shortDescription = shortDescription.trim();
    if (description) campaign.description = description.trim();
    if (category) campaign.category = category;
    if (image) campaign.image = image.trim();
    if (goalAmount && !isNaN(goalAmount)) campaign.goalAmount = parseFloat(goalAmount);
    if (deadline) campaign.deadline = new Date(deadline);
    if (status && (isAdmin || isOwner)) campaign.status = status;

    await campaign.save();

    const updated = await Campaign.findById(campaign._id).populate('organizer', 'name email avatar');
    return res.status(200).json({ success: true, message: 'Campaign updated successfully!', campaign: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update campaign.' });
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only delete campaigns you created.' });
    }

    await Donation.deleteMany({ campaign: campaign._id });
    await Campaign.findByIdAndDelete(campaign._id);

    return res.status(200).json({ success: true, message: 'Campaign and associated donations deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete campaign.' });
  }
};

// @desc    Add a progress update to a campaign
// @route   POST /api/campaigns/:id/updates
exports.addCampaignUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Update title and content are required.' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const isOwner = campaign.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only organizers or admins can add updates.' });
    }

    campaign.updates.unshift({
      title: title.trim(),
      content: content.trim(),
      date: new Date(),
    });

    await campaign.save();
    return res.status(200).json({ success: true, message: 'Campaign update posted successfully!', updates: campaign.updates });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to post campaign update.' });
  }
};
```

### 4.3 `server/controllers/donationController.js`
```javascript
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// @desc    Process a new demo donation
// @route   POST /api/donations
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

    // Atomically increment campaign raisedAmount & donorCount to prevent race conditions
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { raisedAmount: numAmount, donorCount: 1 },
    });

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
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process donation.',
    });
  }
};

// @desc    Get donations for a specific campaign
// @route   GET /api/donations/campaign/:campaignId
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

    return res.status(200).json({ success: true, count: sanitized.length, donations: sanitized });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve donations.' });
  }
};

// @desc    Get all donations made by the authenticated user
// @route   GET /api/donations/my
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      $or: [{ donor: req.user._id }, { donorEmail: req.user.email }],
      paymentStatus: 'completed',
    })
      .populate('campaign', 'title category image goalAmount raisedAmount status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: donations.length, donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve your donation history.' });
  }
};
```

### 4.4 `server/controllers/dashboardController.js`
```javascript
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get user dashboard stats and personal records
// @route   GET /api/dashboard/user
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const myCampaigns = await Campaign.find({ organizer: userId }).sort({ createdAt: -1 });
    const myDonations = await Donation.find({
      $or: [{ donor: userId }, { donorEmail: req.user.email }],
      paymentStatus: 'completed',
    })
      .populate('campaign', 'title category image goalAmount raisedAmount status')
      .sort({ createdAt: -1 });

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
    return res.status(500).json({ success: false, message: 'Failed to retrieve user dashboard data.' });
  }
};

// @desc    Get platform-wide admin metrics and management tables
// @route   GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDonations = await Donation.countDocuments({ paymentStatus: 'completed' });

    const donationSumResult = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalFundsRaised = donationSumResult.length > 0 ? donationSumResult[0].totalAmount : 0;

    const campaigns = await Campaign.find().populate('organizer', 'name email').sort({ createdAt: -1 });
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    const recentDonations = await Donation.find()
      .populate('campaign', 'title category')
      .populate('donor', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      stats: { totalCampaigns, totalUsers, totalDonations, totalFundsRaised },
      campaigns,
      users,
      recentDonations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard data.' });
  }
};

// @desc    Admin: Update status of any campaign
// @route   PATCH /api/dashboard/admin/campaigns/:id/status
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
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign status updated to '${status}' successfully.`,
      campaign,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update campaign status.' });
  }
};
```

---

# 5. Backend: API Routes

### 5.1 `server/routes/authRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;
```

### 5.2 `server/routes/campaignRoutes.js`
```javascript
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

router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);
router.post('/', verifyToken, createCampaign);
router.put('/:id', verifyToken, updateCampaign);
router.delete('/:id', verifyToken, deleteCampaign);
router.post('/:id/updates', verifyToken, addCampaignUpdate);

module.exports = router;
```

### 5.3 `server/routes/donationRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const {
  createDonation,
  getCampaignDonations,
  getMyDonations,
} = require('../controllers/donationController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createDonation);
router.get('/campaign/:campaignId', getCampaignDonations);
router.get('/my', verifyToken, getMyDonations);

module.exports = router;
```

### 5.4 `server/routes/dashboardRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getAdminDashboard,
  updateCampaignStatus,
} = require('../controllers/dashboardController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/user', verifyToken, getUserDashboard);
router.get('/admin', verifyToken, requireAdmin, getAdminDashboard);
router.patch('/admin/campaigns/:id/status', verifyToken, requireAdmin, updateCampaignStatus);

module.exports = router;
```

---

# 6. Backend: Database Seeder

### 6.1 `server/seed.js`
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fundraiser_db';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Donation.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    const adminUser = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@fundraiser.org',
      passwordHash: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    const organizerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.organizer@fundraiser.org',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    });

    const donorUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.donor@fundraiser.org',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    console.log('[Seed] Created 3 demo users (Admin, Organizer, Donor).');

    // 2. Define Sample Campaigns
    const sampleCampaignsData = [
      {
        title: 'Emergency Pediatric Heart Surgery for Baby Leo',
        shortDescription: 'Supporting 10-month-old Leo with critical cardiac surgery and intensive care recovery.',
        description: 'Ten-month-old Leo was diagnosed with severe Congenital Heart Defect (Tetralogy of Fallot). Corrective open-heart surgery is urgently required.',
        category: 'Medical',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 25000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'Surgical Consult Completed',
            content: 'The surgical team reviewed ultrasound results. Procedure tentatively set for next month!',
            date: new Date(),
          },
        ],
        sampleDonations: [
          { name: 'Dr. Marcus Webb', email: 'mwebb@health.org', amount: 1500, message: 'Praying for Leo!', isAnon: false },
          { name: 'Alex Rivera', email: 'alex.donor@fundraiser.org', amount: 250, message: 'Stay strong!', isAnon: false },
        ],
      },
      {
        title: 'STEM Learning Lab & Coding Kits for Rural School',
        shortDescription: 'Equipping 350 underserved students in Maple Creek with robotics kits and desktop workstations.',
        description: 'Modern digital education shouldn’t be determined by your zip code. Funds purchase 25 desktop workstations and 50 robotics kits.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 12000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: true,
        status: 'active',
        updates: [],
        sampleDonations: [
          { name: 'Silicon Tech Alumni', email: 'tech@alumni.org', amount: 2500, message: 'Inspiring young coders!', isAnon: false },
        ],
      },
    ];

    for (const data of sampleCampaignsData) {
      const { sampleDonations, ...campaignFields } = data;
      const totalRaised = sampleDonations.reduce((sum, d) => sum + d.amount, 0);

      const campaign = await Campaign.create({
        ...campaignFields,
        raisedAmount: totalRaised,
        donorCount: sampleDonations.length,
      });

      for (const d of sampleDonations) {
        await Donation.create({
          campaign: campaign._id,
          donor: d.email === donorUser.email ? donorUser._id : null,
          donorName: d.name,
          donorEmail: d.email,
          amount: d.amount,
          message: d.message,
          isAnonymous: d.isAnon,
          paymentStatus: 'completed',
          transactionId: `DEMO-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentMethod: 'Demo Card',
        });
      }
    }

    console.log('✅ Database Seed Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
```

---

# 7. Frontend: Core Routing & Services

### 7.1 `client/src/App.jsx`
```jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import ExploreCampaigns from './pages/ExploreCampaigns';
import CampaignDetails from './pages/CampaignDetails';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-cream-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/campaigns" element={<ExploreCampaigns />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/campaigns/create"
                  element={
                    <ProtectedRoute>
                      <CreateCampaign />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EditCampaign />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Administrator Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### 7.2 `client/src/services/api.js`
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Attach JWT Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

# 8. Frontend: Global State Management (Contexts)

### 8.1 `client/src/context/AuthContext.jsx`
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return response.data;
  };

  const register = async (name, email, password, role = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 8.2 `client/src/context/ToastContext.jsx`
```jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-right duration-200 ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : toast.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-emerald-50 border-emerald-200 text-forest-800'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />}

            <div className="flex-1 leading-snug">{toast.message}</div>

            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-700 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
```

---

# 9. Frontend: Key UI Components

### 9.1 `client/src/components/DonationModal.jsx`
```jsx
import React, { useState } from 'react';
import { X, Heart, ShieldCheck, CreditCard, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

const DonationModal = ({ isOpen, onClose, campaign, onDonationSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedPreset, setSelectedPreset] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [donorEmail, setDonorEmail] = useState(user ? user.email : '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Demo Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !campaign) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) : selectedPreset;

  const handleSelectPreset = (amount) => {
    setSelectedPreset(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedPreset(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentAmount || isNaN(currentAmount) || currentAmount <= 0) {
      setErrorMsg('Please enter a valid donation amount greater than $0.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        campaignId: campaign._id,
        amount: currentAmount,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: message.trim(),
        isAnonymous,
        paymentMethod,
      };

      const res = await api.post('/donations', payload);
      showToast(`Thank you! Successfully contributed $${currentAmount} to ${campaign.title}`);

      if (onDonationSuccess) {
        onDonationSuccess(res.data.donation, res.data.updatedCampaign);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process donation. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-warm-100 text-warm-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 fill-warm-500 text-warm-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">Make a Donation</h2>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">
              Supporting: <span className="font-semibold text-slate-700">{campaign.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 text-xs mb-5">
          <ShieldCheck className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Flow:</span> No real financial payment card will be charged.
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Contribution Amount
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleSelectPreset(amt)}
                  className={`py-2 px-3 rounded-xl font-bold text-sm border transition ${
                    selectedPreset === amt && !customAmount
                      ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-forest-600 hover:bg-forest-50/50'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="Or enter custom amount (USD)"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Words of Encouragement (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymousDonation"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-forest-700 focus:ring-forest-600 h-4 w-4 border-slate-300"
            />
            <label htmlFor="anonymousDonation" className="text-xs text-slate-600 cursor-pointer select-none">
              Make my donation anonymous on the public supporters list
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Simulated Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Demo Card', label: 'Credit Card', icon: CreditCard },
                { id: 'Demo UPI / Bank', label: 'UPI / NetBank', icon: Landmark },
                { id: 'Demo Wallet', label: 'Digital Wallet', icon: Wallet },
              ].map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === m.id
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !currentAmount || currentAmount <= 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Processing Demo Donation...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>Confirm Contribution of ${Number(currentAmount || 0).toLocaleString()}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationModal;
```

### 9.2 `client/src/components/DonationReceiptModal.jsx`
```jsx
import React from 'react';
import { CheckCircle2, Download, X, HeartHandshake, ShieldCheck } from 'lucide-react';

const DonationReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen || !receiptData) return null;

  const {
    transactionId,
    amount,
    donorName,
    donorEmail,
    createdAt,
    campaign,
    paymentMethod = 'Demo Card',
  } = receiptData;

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Thank You for Your Support!</h2>
          <p className="text-sm text-slate-500 mt-1">Your demo donation has been recorded and campaign funds updated.</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulated Demo Transaction • No Real Payment Charged</span>
          </div>
        </div>

        <div className="bg-cream-50 rounded-2xl p-5 border border-cream-200 mb-6 space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-cream-200">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono font-semibold text-xs text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {transactionId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Campaign</span>
            <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">
              {campaign?.title || 'Fundraiser Campaign'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Donor Name</span>
            <span className="font-semibold text-slate-800">{donorName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payment Channel</span>
            <span className="text-slate-700">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-700">{formattedDate}</span>
          </div>

          <div className="pt-3 border-t border-cream-200 flex justify-between items-center">
            <span className="text-base font-bold text-slate-800">Total Contribution</span>
            <span className="text-2xl font-black text-forest-700">
              ${Number(amount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 bg-cream-100 hover:bg-cream-200 text-slate-700 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-cream-200"
          >
            <Download className="w-4 h-4" /> Print / Save Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            <HeartHandshake className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationReceiptModal;
```

### 9.3 `client/src/components/CampaignCard.jsx`
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Heart } from 'lucide-react';
import ProgressBar from './ProgressBar';

const categoryColors = {
  Medical: 'bg-rose-50 text-rose-700 border-rose-200',
  Education: 'bg-blue-50 text-blue-700 border-blue-200',
  Environment: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Animal Welfare': 'bg-amber-50 text-amber-800 border-amber-200',
  Community: 'bg-purple-50 text-purple-700 border-purple-200',
  Emergency: 'bg-red-50 text-red-700 border-red-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

const CampaignCard = ({ campaign, onQuickDonate }) => {
  const {
    _id,
    title,
    shortDescription,
    category,
    image,
    goalAmount,
    raisedAmount,
    donorCount = 0,
    deadline,
    organizer,
    status,
  } = campaign;

  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)));
  const isCompleted = status === 'completed' || daysLeft === 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md bg-white/95 ${categoryColors[category] || categoryColors.Other}`}>
          {category}
        </span>
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
              Completed
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-700/85 text-white backdrop-blur-md flex items-center gap-1">
              <Clock className="w-3 h-3" /> {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {organizer && (
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <span className="truncate">by {organizer.name}</span>
            </div>
          )}

          <Link to={`/campaigns/${_id}`}>
            <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2 group-hover:text-forest-700 transition mb-2">
              {title}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">{shortDescription}</p>
        </div>

        <div>
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <span className="text-lg font-extrabold text-forest-700">
                  ${Number(raisedAmount || 0).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  raised of ${Number(goalAmount || 1).toLocaleString()}
                </span>
              </div>
            </div>
            <ProgressBar current={raisedAmount} target={goalAmount} showLabel={false} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 text-forest-600" />
              <span>{donorCount} {donorCount === 1 ? 'supporter' : 'supporters'}</span>
            </div>

            <div className="flex items-center gap-2">
              {onQuickDonate && !isCompleted && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickDonate(campaign);
                  }}
                  className="px-3 py-1.5 bg-warm-50 hover:bg-warm-100 text-warm-600 font-semibold text-xs rounded-lg transition flex items-center gap-1 border border-warm-200"
                >
                  <Heart className="w-3.5 h-3.5 fill-warm-500 text-warm-500" /> Donate
                </button>
              )}
              <Link
                to={`/campaigns/${_id}`}
                className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white font-medium text-xs rounded-lg transition shadow-sm"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
```

### 9.4 `client/src/components/ProgressBar.jsx`
```jsx
import React from 'react';

const ProgressBar = ({ current = 0, target = 1, showLabel = true, className = '' }) => {
  const percentage = Math.min(Math.round((current / (target || 1)) * 100), 1000);
  const visualWidth = Math.min(percentage, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span className="text-forest-700 font-bold">{percentage}% Funded</span>
          <span>Target: ${Number(target).toLocaleString()}</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            visualWidth >= 100
              ? 'bg-gradient-to-r from-forest-500 to-emerald-400'
              : visualWidth > 75
              ? 'bg-gradient-to-r from-forest-600 to-forest-500'
              : 'bg-gradient-to-r from-forest-700 to-forest-600'
          }`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
```

---

# 10. Frontend: Primary Pages

### 10.1 `client/src/pages/Home.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck, TrendingUp, Users, Sparkles, Stethoscope, GraduationCap, Trees, Dog, Users2, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';

const CATEGORIES = [
  { name: 'Medical', icon: Stethoscope, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { name: 'Education', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Environment', icon: Trees, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Animal Welfare', icon: Dog, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { name: 'Community', icon: Users2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { name: 'Emergency', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns?limit=6');
      if (res.data && res.data.campaigns) {
        setAllCampaigns(res.data.campaigns);
        const featured = res.data.campaigns.filter((c) => c.featured);
        setFeaturedCampaigns(featured.length > 0 ? featured.slice(0, 3) : res.data.campaigns.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRaised = allCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalDonors = allCampaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-emerald-50/70 via-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-forest-600" />
                <span>Empowering Changemakers Across Communities</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Fund Urgent Causes. <br />
                <span className="text-forest-700">Spread Boundless Hope.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Join our transparent, community-driven crowdfunding platform. Support verified medical treatments, education scholarships, and emergency relief in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link to="/campaigns" className="px-8 py-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl transition shadow-lg flex items-center justify-center gap-2">
                  Explore Campaigns <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/campaigns/create" className="px-8 py-4 bg-warm-50 hover:bg-warm-100 text-warm-700 font-bold rounded-2xl transition border border-warm-200 flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 fill-warm-500 text-warm-500" /> Start a Fundraiser
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-warm-300">
                ${totalRaised.toLocaleString()}+
              </div>
              <p className="text-xs sm:text-sm text-forest-100 mt-1">Direct Contributions Raised</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {totalDonors}+
              </div>
              <p className="text-xs sm:text-sm text-forest-100 mt-1">Generous Supporters</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {allCampaigns.length}
              </div>
              <p className="text-xs sm:text-sm text-forest-100 mt-1">Active Causes</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-300">98.4%</div>
              <p className="text-xs sm:text-sm text-forest-100 mt-1">Delivery Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/campaigns?category=${encodeURIComponent(cat.name)}`)}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-forest-600 hover:shadow-hover text-center transition flex flex-col items-center justify-center gap-3"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-bold text-sm text-slate-800">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <DonationModal
        isOpen={Boolean(selectedCampaignForDonation)}
        onClose={() => setSelectedCampaignForDonation(null)}
        campaign={selectedCampaignForDonation}
        onDonationSuccess={(d) => {
          setSelectedCampaignForDonation(null);
          setReceiptData(d);
        }}
      />
      <DonationReceiptModal isOpen={Boolean(receiptData)} onClose={() => setReceiptData(null)} receiptData={receiptData} />
    </div>
  );
};

export default Home;
```

### 10.2 `client/src/pages/ExploreCampaigns.jsx`
```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import api from '../services/api';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';

const CATEGORIES = ['All', 'Medical', 'Education', 'Environment', 'Animal Welfare', 'Community', 'Emergency'];

const ExploreCampaigns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');

  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (sort) params.sort = sort;

      const res = await api.get('/campaigns', { params });
      if (res.data && res.data.campaigns) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, story or cause keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="most-funded">Sort: Most Funded</option>
              <option value="deadline">Sort: Ending Soon</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <CampaignCard key={c._id} campaign={c} onQuickDonate={(c) => setSelectedCampaignForDonation(c)} />
        ))}
      </div>

      <DonationModal
        isOpen={Boolean(selectedCampaignForDonation)}
        onClose={() => setSelectedCampaignForDonation(null)}
        campaign={selectedCampaignForDonation}
        onDonationSuccess={(d) => {
          setSelectedCampaignForDonation(null);
          setReceiptData(d);
        }}
      />
      <DonationReceiptModal isOpen={Boolean(receiptData)} onClose={() => setReceiptData(null)} receiptData={receiptData} />
    </div>
  );
};

export default ExploreCampaigns;
```

### 10.3 `client/src/pages/CampaignDetails.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ShieldCheck, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/ProgressBar';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data.campaign);
      setRecentDonations(res.data.recentDonations || []);
    } catch (err) {
      showToast('Could not load campaign.', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Campaign link copied to clipboard!');
  };

  if (!campaign) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <img src={campaign.image} alt={campaign.title} className="w-full aspect-[16/9] object-cover rounded-3xl" />
          <h1 className="text-3xl font-black">{campaign.title}</h1>
          <p className="text-slate-600">{campaign.shortDescription}</p>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h2 className="font-bold mb-3">About the Cause</h2>
            <div className="whitespace-pre-line text-slate-700">{campaign.description}</div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 bg-white p-6 rounded-3xl border border-slate-200 shadow-hover space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-black text-forest-700">${campaign.raisedAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-400">Target: ${campaign.goalAmount.toLocaleString()}</span>
            </div>
            <ProgressBar current={campaign.raisedAmount} target={campaign.goalAmount} />

            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="w-full py-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl shadow flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-warm-400 text-warm-400" /> Donate Now
            </button>
            <button onClick={handleShare} className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={campaign}
        onDonationSuccess={(d, updated) => {
          setIsDonationModalOpen(false);
          setReceiptData(d);
          setCampaign((prev) => ({ ...prev, raisedAmount: updated.raisedAmount }));
        }}
      />
      <DonationReceiptModal isOpen={Boolean(receiptData)} onClose={() => setReceiptData(null)} receiptData={receiptData} />
    </div>
  );
};

export default CampaignDetails;
```

### 10.4 `client/src/pages/CreateCampaign.jsx`
```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Medical', 'Education', 'Environment', 'Animal Welfare', 'Community', 'Emergency', 'Other'];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Medical');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/campaigns', {
        title,
        shortDescription,
        description,
        category,
        image,
        goalAmount: parseFloat(goalAmount),
        deadline: new Date(deadline).toISOString(),
      });
      showToast('Campaign successfully published!');
      navigate(`/campaigns/${res.data.campaign._id}`);
    } catch (err) {
      showToast('Failed to create campaign.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow space-y-4">
        <h1 className="text-2xl font-bold">Start a Fundraising Campaign</h1>
        <input type="text" required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-xl">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" required placeholder="Goal (USD)" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <input type="url" required placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <input type="text" required placeholder="Short Pitch" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <textarea required rows={5} placeholder="Full Story" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <button type="submit" className="w-full py-3.5 bg-forest-700 text-white font-bold rounded-xl shadow">Launch Fundraiser Now</button>
      </form>
    </div>
  );
};

export default CreateCampaign;
```

### 10.5 `client/src/pages/UserDashboard.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Receipt, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import DonationReceiptModal from '../components/DonationReceiptModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get('/dashboard/user');
    setStats(res.data.stats);
    setCampaigns(res.data.campaigns || []);
    setDonations(res.data.donations || []);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400">Total Donated</span>
          <div className="text-3xl font-black text-warm-600">${stats?.totalDonated || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400">Raised By You</span>
          <div className="text-3xl font-black text-forest-700">${stats?.totalRaised || 0}</div>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button onClick={() => setActiveTab('campaigns')} className={`pb-3 font-bold border-b-2 ${activeTab === 'campaigns' ? 'border-forest-700 text-forest-800' : 'text-slate-500'}`}>
          My Campaigns ({campaigns.length})
        </button>
        <button onClick={() => setActiveTab('donations')} className={`pb-3 font-bold border-b-2 ${activeTab === 'donations' ? 'border-forest-700 text-forest-800' : 'text-slate-500'}`}>
          My Donations ({donations.length})
        </button>
      </div>

      {activeTab === 'campaigns' ? (
        <div className="bg-white rounded-2xl border divide-y">
          {campaigns.map((c) => (
            <div key={c._id} className="p-4 flex items-center justify-between">
              <div>
                <Link to={`/campaigns/${c._id}`} className="font-bold hover:text-forest-700">{c.title}</Link>
                <div className="text-xs text-slate-400">${c.raisedAmount} of ${c.goalAmount}</div>
              </div>
              <Link to={`/campaigns/${c._id}`} className="p-2 text-slate-400 hover:text-slate-600"><ExternalLink className="w-4 h-4" /></Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border divide-y">
          {donations.map((d) => (
            <div key={d._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{d.campaign?.title || 'Campaign'}</div>
                <div className="text-xs text-slate-400">{d.transactionId}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-forest-700">${d.amount}</span>
                <button onClick={() => setSelectedReceipt(d)} className="px-3 py-1 bg-cream-100 rounded text-xs font-bold">Receipt</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DonationReceiptModal isOpen={Boolean(selectedReceipt)} onClose={() => setSelectedReceipt(null)} receiptData={selectedReceipt} />
    </div>
  );
};

export default UserDashboard;
```

### 10.6 `client/src/pages/AdminDashboard.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { Shield, Target, Users, TrendingUp, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const res = await api.get('/dashboard/admin');
    setStats(res.data.stats);
    setCampaigns(res.data.campaigns || []);
  };

  const handleStatusChange = async (id, status) => {
    await api.patch(`/dashboard/admin/campaigns/${id}/status`, { status });
    showToast(`Status changed to ${status}`);
    setCampaigns((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete campaign?')) return;
    await api.delete(`/campaigns/${id}`);
    showToast('Deleted successfully');
    setCampaigns((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-3">
        <Shield className="w-8 h-8 text-amber-400" />
        <h1 className="text-2xl font-bold">Admin Console</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <span className="text-xs text-slate-400">Total Funds</span>
          <div className="text-2xl font-bold text-warm-600">${stats?.totalFundsRaised || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <span className="text-xs text-slate-400">Campaigns</span>
          <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border divide-y">
        {campaigns.map((c) => (
          <div key={c._id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <div className="font-bold">{c.title}</div>
              <div className="text-xs text-slate-400">by {c.organizer?.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} className="border rounded p-1 text-xs">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button onClick={() => handleDelete(c._id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### 10.7 `client/src/pages/Login.jsx`
```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      showToast('Welcome back!');
      navigate('/');
    } catch (err) {
      showToast('Invalid credentials.', 'error');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border shadow space-y-4">
        <h1 className="text-2xl font-black text-center">Sign In</h1>
        <div className="bg-cream-100 p-3 rounded-xl text-xs space-y-1">
          <div className="font-bold">1-Click Fill Demo Accounts:</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEmail('admin@fundraiser.org'); setPassword('admin123'); }} className="p-1 bg-white border rounded">Admin</button>
            <button type="button" onClick={() => { setEmail('sarah.organizer@fundraiser.org'); setPassword('user123'); }} className="p-1 bg-white border rounded">Organizer</button>
            <button type="button" onClick={() => { setEmail('alex.donor@fundraiser.org'); setPassword('user123'); }} className="p-1 bg-white border rounded">Donor</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          <button type="submit" className="w-full py-3 bg-forest-700 text-white font-bold rounded-xl shadow">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

---

# 11. Environment & Package Manifests

### `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fundraiser_db
JWT_SECRET=super_secret_fundraiser_jwt_key_2026_secure!
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### `server/package.json`
```json
{
  "name": "fundraiser-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

### `client/package.json`
```json
{
  "name": "fundraiser-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "vite": "^6.0.1"
  }
}
```
