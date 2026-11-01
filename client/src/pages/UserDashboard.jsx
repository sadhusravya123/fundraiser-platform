import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  PlusCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  Edit,
  Trash2,
  Receipt,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/ProgressBar';
import DonationReceiptModal from '../components/DonationReceiptModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'donations'

  // Receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/user');
      if (res.data) {
        setStats(res.data.stats);
        setCampaigns(res.data.campaigns || []);
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('User dashboard error:', err);
      showToast('Failed to load user dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await api.delete(`/campaigns/${campaignId}`);
      showToast('Campaign deleted successfully.');
      setCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete campaign.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-forest-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Profile Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=1B4332&color=fff&size=128`
            }
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-forest-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-100 text-forest-800 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Member since{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <Link
          to="/campaigns/create"
          className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Start New Campaign
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Donated
          </span>
          <span className="text-2xl sm:text-3xl font-black text-warm-600">
            ${Number(stats?.totalDonated || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Across all campaigns</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Raised by You
          </span>
          <span className="text-2xl sm:text-3xl font-black text-forest-700">
            ${Number(stats?.totalRaised || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block mt-1">From your campaigns</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Campaigns Created
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {stats?.campaignsCreated || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            {stats?.activeCampaignsCount || 0} currently active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Donations Made
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {stats?.totalDonationsCount || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Verified demo gifts</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Campaigns</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'donations'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Donation History</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {donations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Campaigns Created By User */}
      {activeTab === 'campaigns' && (
        <div>
          {campaigns.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Raised / Goal</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {campaigns.map((c) => {
                      const pct = Math.min(
                        Math.round((c.raisedAmount / c.goalAmount) * 100),
                        100
                      );
                      return (
                        <tr key={c._id} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.image}
                                alt={c.title}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                              />
                              <div>
                                <Link
                                  to={`/campaigns/${c._id}`}
                                  className="font-bold text-slate-900 hover:text-forest-700 line-clamp-1"
                                >
                                  {c.title}
                                </Link>
                                <span className="text-xs text-slate-400">
                                  Created {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {c.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 min-w-[180px]">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-forest-700">
                                ${Number(c.raisedAmount || 0).toLocaleString()}
                              </span>
                              <span className="text-slate-400">
                                ${Number(c.goalAmount).toLocaleString()}
                              </span>
                            </div>
                            <ProgressBar current={c.raisedAmount} target={c.goalAmount} showLabel={false} />
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                c.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/campaigns/${c._id}`}
                                className="p-2 text-slate-500 hover:text-forest-700 rounded-lg hover:bg-slate-100"
                                title="View Campaign"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/campaigns/edit/${c._id}`}
                                className="p-2 text-slate-500 hover:text-forest-700 rounded-lg hover:bg-slate-100"
                                title="Edit Campaign"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteCampaign(c._id)}
                                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft">
              <Heart className="w-12 h-12 text-forest-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                You haven't launched any campaigns yet
              </h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                Got a cause you believe in? Create your first fundraiser in minutes.
              </p>
              <Link
                to="/campaigns/create"
                className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl transition shadow"
              >
                Start a Fundraiser
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Donations History */}
      {activeTab === 'donations' && (
        <div>
          {donations.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {donations.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {d.transactionId}
                        </td>
                        <td className="px-6 py-4">
                          {d.campaign ? (
                            <Link
                              to={`/campaigns/${d.campaign._id}`}
                              className="font-bold text-slate-900 hover:text-forest-700 line-clamp-1"
                            >
                              {d.campaign.title}
                            </Link>
                          ) : (
                            <span className="text-slate-400">Campaign Archived</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-black text-forest-700 text-base">
                          ${Number(d.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Demo Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedReceipt({
                                transactionId: d.transactionId,
                                amount: d.amount,
                                donorName: d.donorName,
                                donorEmail: d.donorEmail,
                                createdAt: d.createdAt,
                                campaign: d.campaign,
                                paymentMethod: d.paymentMethod,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-bold bg-cream-100 hover:bg-cream-200 text-slate-700 rounded-lg transition border border-cream-200 inline-flex items-center gap-1"
                          >
                            <Receipt className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                No donation records yet
              </h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                Discover active fundraisers and make your first simulated contribution today.
              </p>
              <Link
                to="/campaigns"
                className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl transition shadow"
              >
                Explore Campaigns
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      <DonationReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receiptData={selectedReceipt}
      />
    </div>
  );
};

export default UserDashboard;
