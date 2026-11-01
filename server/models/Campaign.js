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
