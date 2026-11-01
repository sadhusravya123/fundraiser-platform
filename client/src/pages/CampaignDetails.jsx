import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Edit,
  Trash2,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/ProgressBar';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';
import { CampaignDetailsSkeleton } from '../components/LoadingSkeleton';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Donation modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Update post state (for organizer)
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/campaigns/${id}`);
      if (res.data) {
        setCampaign(res.data.campaign);
        setRecentDonations(res.data.recentDonations || []);
      }
    } catch (err) {
      console.error('Fetch campaign details error:', err);
      setError('Could not find or load the requested campaign.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Campaign link copied to clipboard! Share it with friends.');
  };

  const handleDeleteCampaign = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/campaigns/${campaign._id}`);
      showToast('Campaign has been deleted successfully.');
      navigate('/campaigns');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete campaign.', 'error');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) {
      showToast('Please provide both update headline and message content.', 'error');
      return;
    }

    try {
      setIsSubmittingUpdate(true);
      const res = await api.post(`/campaigns/${campaign._id}/updates`, {
        title: updateTitle.trim(),
        content: updateContent.trim(),
      });

      showToast('Update published to campaign supporters!');
      setCampaign((prev) => ({ ...prev, updates: res.data.updates }));
      setUpdateTitle('');
      setUpdateContent('');
      setShowUpdateForm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post update.', 'error');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleDonationSuccess = (donation, updatedCampaign) => {
    setIsDonationModalOpen(false);
    setReceiptData(donation);

    // Refresh updated amounts
    setCampaign((prev) => ({
      ...prev,
      raisedAmount: updatedCampaign.raisedAmount,
      donorCount: updatedCampaign.donorCount,
    }));

    // Prepend to recent donations
    setRecentDonations((prev) => [donation, ...prev]);
  };

  if (loading) {
    return <CampaignDetailsSkeleton />;
  }

  if (error || !campaign) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl shadow-soft text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Campaign Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">{error || 'This campaign may have been removed.'}</p>
        <Link
          to="/campaigns"
          className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm rounded-xl transition"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && campaign.organizer && (user._id === campaign.organizer._id || user._id === campaign.organizer);
  const canManage = isOwner || isAdmin;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  );
  const remainingAmount = Math.max(0, campaign.goalAmount - campaign.raisedAmount);
  const progress = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 1000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Organizer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-forest-700">
            Home
          </Link>
          <span>/</span>
          <Link to="/campaigns" className="hover:text-forest-700">
            Campaigns
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-[200px]">{campaign.category}</span>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <Link
              to={`/campaigns/edit/${campaign._id}`}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-forest-700 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Campaign
            </Link>
            <button
              onClick={handleDeleteCampaign}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image, Story, Updates */}
        <div className="lg:col-span-8 space-y-8">
          {/* Cover Image & Category Header */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 shadow-lg border border-slate-100">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-forest-800 shadow-sm border border-forest-200">
              {campaign.category}
            </div>

            <div className="absolute top-4 right-4">
              <button
                onClick={handleShare}
                className="bg-white/95 backdrop-blur-md p-2.5 rounded-full text-slate-700 hover:text-forest-700 shadow-md border border-slate-200 transition"
                title="Share Campaign"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Campaign Title & Summary */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
              {campaign.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              {campaign.shortDescription}
            </p>
          </div>

          {/* Organizer Card */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={
                  campaign.organizer?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    campaign.organizer?.name || 'Organizer'
                  )}&background=1B4332&color=fff`
                }
                alt={campaign.organizer?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-forest-500/20"
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forest-700">
                  Campaign Organizer
                </div>
                <div className="text-base font-bold text-slate-800">
                  {campaign.organizer?.name || 'Community Member'}
                </div>
                <div className="text-xs text-slate-400">
                  Verified Fundraiser Member
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-forest-800 text-xs font-bold rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-forest-600" /> Identity Vetted
            </div>
          </div>

          {/* Full Story Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <h2 className="text-xl font-black text-slate-900 pb-3 border-b border-slate-100">
              About the Cause
            </h2>
            <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {campaign.description}
            </div>
          </div>

          {/* Updates Timeline Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Campaign Updates</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparency and progress milestones directly from the organizer.
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  className="px-3 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold rounded-xl border border-forest-200 transition flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4 text-forest-600" />
                  {showUpdateForm ? 'Cancel' : 'Post Update'}
                </button>
              )}
            </div>

            {/* Organizer Post Update Form */}
            {showUpdateForm && (
              <form
                onSubmit={handlePostUpdate}
                className="p-4 bg-cream-50 rounded-2xl border border-cream-300 space-y-3"
              >
                <h4 className="text-sm font-bold text-slate-800">Publish New Milestone</h4>
                <input
                  type="text"
                  required
                  placeholder="Update Headline (e.g. Surgery Scheduled for Next Monday!)"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the progress, milestones achieved, or message to donors..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmittingUpdate}
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {isSubmittingUpdate ? 'Publishing...' : 'Publish Update'}
                </button>
              </form>
            )}

            {/* Updates List */}
            {campaign.updates && campaign.updates.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest-100">
                {campaign.updates.map((update, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-forest-600 ring-4 ring-forest-50" />
                    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <h4 className="font-bold text-sm text-slate-900">{update.title}</h4>
                        <span className="text-xs text-slate-400">
                          {new Date(update.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {update.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No milestone updates posted yet. The organizer will update supporters soon.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Donation Card & Recent Donors */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sticky Donation Card */}
          <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-hover space-y-6">
            {/* Raised vs Goal */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-3xl font-black text-forest-700">
                  ${Number(campaign.raisedAmount || 0).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Target: ${Number(campaign.goalAmount).toLocaleString()}
                </span>
              </div>
              <ProgressBar current={campaign.raisedAmount} target={campaign.goalAmount} />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200 text-center">
              <div>
                <span className="block text-xl font-bold text-slate-800">
                  {campaign.donorCount || recentDonations.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Supporters</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-slate-800">{daysLeft}</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {daysLeft === 1 ? 'Day Left' : 'Days Remaining'}
                </span>
              </div>
            </div>

            {/* Remaining Amount */}
            {remainingAmount > 0 && (
              <div className="text-xs text-slate-500 text-center">
                Need <span className="font-bold text-slate-700">${remainingAmount.toLocaleString()}</span> more to hit 100% of the goal.
              </div>
            )}

            {/* Primary Donate Button */}
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-extrabold text-base rounded-2xl transition shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-warm-400 text-warm-400 group-hover:scale-110 transition-transform" />
              <span>Donate Now</span>
            </button>

            {/* Share Campaign CTA */}
            <button
              onClick={handleShare}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-slate-500" /> Share Campaign
            </button>

            {/* Trust Pill */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-forest-600" />
              <span>Safe & Secure Simulated Contributions</span>
            </div>

            {/* Recent Supporters List */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Recent Supporters</h3>
                <span className="text-xs text-slate-400">
                  {recentDonations.length} shown
                </span>
              </div>

              {recentDonations.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {recentDonations.map((d, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-forest-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {d.donorName ? d.donorName[0].toUpperCase() : 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-800 truncate">{d.donorName}</span>
                          <span className="font-extrabold text-forest-700 ml-2">
                            ${d.amount}
                          </span>
                        </div>
                        {d.message && (
                          <p className="text-slate-500 mt-1 italic line-clamp-2">
                            "{d.message}"
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Be the first generous donor to support this cause!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={campaign}
        onDonationSuccess={handleDonationSuccess}
      />

      {/* Receipt Modal */}
      <DonationReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default CampaignDetails;
