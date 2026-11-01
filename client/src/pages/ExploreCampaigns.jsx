import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, AlertCircle, Compass } from 'lucide-react';
import api from '../services/api';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';
import { CampaignCardSkeleton } from '../components/LoadingSkeleton';

const CATEGORIES = [
  'All',
  'Medical',
  'Education',
  'Environment',
  'Animal Welfare',
  'Community',
  'Emergency',
];

const ExploreCampaigns = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Quick donate modal
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  // Sync with searchParams on mount or param change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== category) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

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
      console.error('Fetch campaigns error:', err);
      setError('Failed to load campaigns. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sort]);

  // Debounced search / trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setSort('newest');
    setSearchParams({});
  };

  const handleDonationSuccess = (donation, updatedCampaign) => {
    setSelectedCampaignForDonation(null);
    setReceiptData(donation);

    setCampaigns((prev) =>
      prev.map((c) =>
        c._id === updatedCampaign._id
          ? {
              ...c,
              raisedAmount: updatedCampaign.raisedAmount,
              donorCount: updatedCampaign.donorCount,
            }
          : c
      )
    );
  };

  const hasActiveFilters = search || category !== 'All' || status !== 'All' || sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cream-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5 text-forest-600" />
            <span>Discover Causes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore Campaigns
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse verified community fundraisers and make a direct impact.
          </p>
        </div>

        {/* Total Count Badge */}
        {!loading && (
          <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
            Showing <span className="font-bold text-slate-800">{campaigns.length}</span> campaigns
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, story or cause keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="most-funded">Sort: Most Funded</option>
              <option value="deadline">Sort: Ending Soon</option>
              <option value="goal-high">Sort: Goal (High to Low)</option>
              <option value="goal-low">Sort: Goal (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSearchParams(cat === 'All' ? {} : { category: cat });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                category === cat
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1 rounded-full hover:bg-red-50 transition whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onQuickDonate={(c) => setSelectedCampaignForDonation(c)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft max-w-lg mx-auto">
          <div className="w-16 h-16 bg-cream-100 text-forest-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No campaigns found</h3>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't find any fundraising campaigns matching your current filter criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm rounded-xl transition shadow"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Quick Donation Modal */}
      <DonationModal
        isOpen={Boolean(selectedCampaignForDonation)}
        onClose={() => setSelectedCampaignForDonation(null)}
        campaign={selectedCampaignForDonation}
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

export default ExploreCampaigns;
