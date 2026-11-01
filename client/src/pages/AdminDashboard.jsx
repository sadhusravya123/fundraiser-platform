import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('campaigns'); // 'campaigns' | 'users' | 'donations'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data) {
        setStats(res.data.stats);
        setCampaigns(res.data.campaigns || []);
        setUsersList(res.data.users || []);
        setDonations(res.data.recentDonations || []);
      }
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      showToast('Failed to retrieve admin control data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await api.patch(`/dashboard/admin/campaigns/${campaignId}/status`, {
        status: newStatus,
      });
      showToast(`Campaign status updated to '${newStatus}'.`);

      setCampaigns((prev) =>
        prev.map((c) => (c._id === campaignId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Admin Action: Permanently delete this campaign and its records?')) return;

    try {
      await api.delete(`/campaigns/${campaignId}`);
      showToast('Campaign successfully removed by Administrator.');
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

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-forest-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center font-bold shadow-lg flex-shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">Admin Oversight Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase">
                Admin
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Platform-wide moderation, compliance review, and donation transaction logs.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 self-start md:self-auto">
          Logged in as: <span className="font-bold text-white">{user?.email}</span>
        </div>
      </div>

      {/* Platform-Wide Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Raised</span>
            <DollarSign className="w-4 h-4 text-warm-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-warm-600">
            ${Number(stats?.totalFundsRaised || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Accumulated demo donations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Campaigns</span>
            <Target className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800">
            {stats?.totalCampaigns || 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Live & completed campaigns</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Registered organizers & donors</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Donations</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-700">
            {stats?.totalDonations || 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Processed transactions</span>
        </div>
      </div>

      {/* Admin Tab Switching */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setAdminTab('campaigns')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            adminTab === 'campaigns'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Campaign Management</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            adminTab === 'users'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>User Accounts</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('donations')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            adminTab === 'donations'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Donation Audit Log</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {donations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Campaign Moderation */}
      {adminTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Campaign & Organizer</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Raised / Goal</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4">Moderate Status</th>
                    <th className="px-6 py-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCampaigns.map((c) => (
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
                              by {c.organizer?.name || 'Unknown'} ({c.organizer?.email})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs">
                        <span className="text-forest-700 font-bold">
                          ${Number(c.raisedAmount || 0).toLocaleString()}
                        </span>{' '}
                        / ${Number(c.goalAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : c.status === 'rejected'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          <option value="active">Set Active</option>
                          <option value="pending">Set Pending</option>
                          <option value="completed">Set Completed</option>
                          <option value="rejected">Set Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCampaign(c._id)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                          title="Remove Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Accounts */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={
                          u.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.name
                          )}&background=1B4332&color=fff`
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-800">{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Donation Audit Trail */}
      {adminTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Donor Name & Email</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {d.transactionId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {d.campaign?.title || 'Unknown Campaign'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{d.donorName}</div>
                      <div className="text-xs text-slate-400">{d.donorEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-forest-700">
                      ${Number(d.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {d.paymentMethod || 'Demo Card'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
