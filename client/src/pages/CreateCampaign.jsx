import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  AlertCircle,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CampaignCard from '../components/CampaignCard';

const SAMPLE_IMAGES = [
  {
    label: 'Medical & Surgery',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    category: 'Medical',
  },
  {
    label: 'Classroom & Tech',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    category: 'Education',
  },
  {
    label: 'Forest & Ocean',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    category: 'Environment',
  },
  {
    label: 'Animal Shelter',
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    category: 'Animal Welfare',
  },
  {
    label: 'Clean Water Village',
    url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=1200&q=80',
    category: 'Community',
  },
  {
    label: 'Disaster Relief',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    category: 'Emergency',
  },
];

const CATEGORIES = [
  'Medical',
  'Education',
  'Environment',
  'Animal Welfare',
  'Community',
  'Emergency',
  'Other',
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Medical');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [image, setImage] = useState(SAMPLE_IMAGES[0].url);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default deadline to 30 days in the future
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title || !shortDescription || !description || !goalAmount || !deadline || !image) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const numGoal = parseFloat(goalAmount);
    if (isNaN(numGoal) || numGoal < 10) {
      setErrorMessage('Fundraising goal must be at least $10.');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      setErrorMessage('Deadline must be in the future.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        image: image.trim(),
        goalAmount: numGoal,
        deadline: deadlineDate.toISOString(),
      };

      const res = await api.post('/campaigns', payload);
      showToast('Campaign successfully published and live!');
      navigate(`/campaigns/${res.data.campaign._id}`);
    } catch (err) {
      console.error('Create campaign error:', err);
      const msg = err.response?.data?.message || 'Failed to create campaign. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock campaign object for live preview
  const previewCampaign = {
    _id: 'preview',
    title: title || 'Your Inspiring Campaign Title Goes Here',
    shortDescription:
      shortDescription ||
      'A concise, compelling overview summarizing who benefits and why their support is urgently needed.',
    category,
    image,
    goalAmount: parseFloat(goalAmount) || 10000,
    raisedAmount: 0,
    donorCount: 0,
    deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    organizer: {
      name: user?.name || 'You',
      avatar: user?.avatar,
    },
    status: 'active',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          <span>Launch Your Fundraiser</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Start a Fundraising Campaign
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Share your story, set a target, and mobilize support from a compassionate community.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6"
          >
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                1. Campaign Overview
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Clean Solar Water Filtration for Village Community"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Goal Amount (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="10"
                      step="any"
                      placeholder="e.g. 15000"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campaign Deadline Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Short Elevator Pitch (Max 240 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={240}
                  placeholder="A clear 1-2 sentence hook displayed on explore cards..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* 2. Visual Photography */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                2. Campaign Imagery
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Image URL *
                </label>
                <div className="relative mb-2">
                  <ImageIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                  />
                </div>

                {/* Quick Presets */}
                <p className="text-xs text-slate-400 mb-2">
                  Or select a high-resolution charity stock photo:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      type="button"
                      key={sample.label}
                      onClick={() => {
                        setImage(sample.url);
                        setCategory(sample.category);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition ${
                        image === sample.url
                          ? 'border-forest-600 bg-forest-50/70 text-forest-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span className="truncate">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Detailed Story */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                3. The Full Cause Story
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complete Campaign Description *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Explain the background, why funds are needed now, how money will be allocated, and the exact positive change donors will create..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-bold text-base rounded-2xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Publishing Campaign to MongoDB...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Launch Fundraiser Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Eye className="w-4 h-4 text-forest-600" />
              <span>Live Card Preview</span>
            </div>

            {/* Live Campaign Card */}
            <div className="max-w-sm mx-auto lg:max-w-none">
              <CampaignCard campaign={previewCampaign} />
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Review Guidelines:</span>
              <p>• Ensure all target figures are realistic and itemized.</p>
              <p>• Only organizers or administrators can edit or delete their campaigns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
