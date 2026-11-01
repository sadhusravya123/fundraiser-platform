import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Trees,
  Dog,
  Users2,
  AlertTriangle,
  CheckCircle,
  Quote,
} from 'lucide-react';
import api from '../services/api';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import DonationReceiptModal from '../components/DonationReceiptModal';
import { CampaignCardSkeleton } from '../components/LoadingSkeleton';

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

  // Modal states for quick donation
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
        // Featured campaigns or first 3
        const featured = res.data.campaigns.filter((c) => c.featured);
        setFeaturedCampaigns(featured.length > 0 ? featured.slice(0, 3) : res.data.campaigns.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch campaigns for homepage:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate live impact stats from real database campaigns
  const totalRaised = allCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalDonors = allCampaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0);
  const totalCampaigns = allCampaigns.length;

  const handleQuickDonate = (campaign) => {
    setSelectedCampaignForDonation(campaign);
  };

  const handleDonationSuccess = (donation, updatedCampaign) => {
    setSelectedCampaignForDonation(null);
    setReceiptData(donation);

    // Update in local state
    setAllCampaigns((prev) =>
      prev.map((c) =>
        c._id === updatedCampaign._id
          ? { ...c, raisedAmount: updatedCampaign.raisedAmount, donorCount: updatedCampaign.donorCount }
          : c
      )
    );
    setFeaturedCampaigns((prev) =>
      prev.map((c) =>
        c._id === updatedCampaign._id
          ? { ...c, raisedAmount: updatedCampaign.raisedAmount, donorCount: updatedCampaign.donorCount }
          : c
      )
    );
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-emerald-50/70 via-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-forest-600" />
                <span>Empowering 50,000+ Changemakers Across Communities</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Fund Urgent Causes. <br />
                <span className="text-forest-700 bg-clip-text">
                  Spread Boundless Hope.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Join our transparent, community-driven crowdfunding platform. Support verified medical treatments, education scholarships, eco-reforestation, and disaster relief programs in real-time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/campaigns"
                  className="px-8 py-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group text-base"
                >
                  Explore Campaigns
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/campaigns/create"
                  className="px-8 py-4 bg-warm-50 hover:bg-warm-100 text-warm-700 font-bold rounded-2xl transition border border-warm-200 flex items-center justify-center gap-2 text-base"
                >
                  <Heart className="w-5 h-5 fill-warm-500 text-warm-500" />
                  Start a Fundraiser
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                  <span>100% Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <TrendingUp className="w-4 h-4 text-forest-600" />
                  <span>Real-time Ledger</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Users className="w-4 h-4 text-forest-600" />
                  <span>Safe Community</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow Backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-forest-400 to-emerald-200 rounded-3xl blur-2xl opacity-40 -z-10" />

                {/* Hero Showcase Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80"
                      alt="Featured Cause"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rose-700 border border-rose-200">
                      Medical Emergency
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2">
                    Emergency Pediatric Heart Surgery for Baby Leo
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    Corrective open-heart procedure for 10-month-old Leo suffering from congenital heart defect.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-forest-700">$18,450 raised</span>
                      <span className="text-slate-500">Goal: $25,000</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-forest-600 h-full rounded-full w-[74%]" />
                    </div>
                  </div>

                  <Link
                    to="/campaigns"
                    className="block text-center py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl transition shadow"
                  >
                    View All Active Campaigns
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Impact Statistics Banner (Live Database Driven) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-forest-600/60">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-warm-300">
                ${totalRaised.toLocaleString()}+
              </div>
              <p className="text-xs sm:text-sm font-medium text-forest-100 mt-1">
                Direct Contributions Raised
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {totalDonors > 0 ? totalDonors : 22}+
              </div>
              <p className="text-xs sm:text-sm font-medium text-forest-100 mt-1">
                Generous Global Supporters
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {totalCampaigns > 0 ? totalCampaigns : 8}
              </div>
              <p className="text-xs sm:text-sm font-medium text-forest-100 mt-1">
                Active & Completed Causes
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-300">
                98.4%
              </div>
              <p className="text-xs sm:text-sm font-medium text-forest-100 mt-1">
                Verified Fund Delivery Rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Diverse Impact Sectors
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Explore Causes by Category
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Support the issues closest to your heart with dedicated project vetting.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/campaigns?category=${encodeURIComponent(cat.name)}`)}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-forest-600 hover:shadow-hover text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition group-hover:scale-110 ${cat.color}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-bold text-sm text-slate-800 group-hover:text-forest-700">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
              Urgent & Urgent Attention
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Featured Fundraising Drives
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Hand-picked campaigns with verified milestones and critical timelines.
            </p>
          </div>

          <Link
            to="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-700 hover:text-forest-800 group"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
          </div>
        ) : featuredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onQuickDonate={handleQuickDonate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500">No campaigns found. Start the very first one!</p>
          </div>
        )}
      </section>

      {/* 5. How It Works Section */}
      <section className="bg-cream-100/70 py-20 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3">
              How KindWave Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From initiating a fundraiser to delivering real relief in four easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Campaign',
                desc: 'Fill in essential details, fundraising goals, compelling story, and upload verified campaign photography.',
              },
              {
                step: '02',
                title: 'Spread the Word',
                desc: 'Share your cause link across WhatsApp, social media, and community networks to rally support.',
              },
              {
                step: '03',
                title: 'Receive Support',
                desc: 'Supporters contribute seamlessly through safe, instant simulated payment channels with digital receipts.',
              },
              {
                step: '04',
                title: 'Deliver Impact',
                desc: 'Post transparent progress updates and photo reports directly to your campaign timeline for all donors.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-4xl font-black text-forest-200 block mb-3 font-mono">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-forest-700 text-xs font-bold gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Milestone Checked
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Inspiring Community Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Heartfelt Stories
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Voices from Our Caring Community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'When our school lab in Maple Creek lacked basic computers, KindWave donors mobilized $12,000 in under two weeks. Our students now have access to robotics kits and digital literacy every day!',
              author: 'Sarah Jenkins',
              role: 'Maple Creek School Principal',
              avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
            },
            {
              quote:
                'Transparent updates and zero hidden fees give me 100% confidence. I can see the exact medical consults and surgery dates for little Leo right in the campaign timeline.',
              author: 'Alex Rivera',
              role: 'Active Regular Donor',
              avatar:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            },
            {
              quote:
                'The platform made organizing flash-flood emergency kits swift and completely frictionless. Being able to post live distribution photos built incredible trust.',
              author: 'Eleanor Vance',
              role: 'Relief Coordinator',
              avatar:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-7 border border-slate-100 shadow-soft flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-warm-400 mb-4" />
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-forest-500/20"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{item.author}</h4>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-8 sm:p-14 text-white text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Spark a Meaningful Difference?
            </h2>
            <p className="text-forest-100 text-sm sm:text-base leading-relaxed">
              Whether you need to raise funds for an urgent medical need, school project, or environmental protection, KindWave provides the tools to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                to="/campaigns/create"
                className="px-8 py-3.5 bg-warm-500 hover:bg-warm-600 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                Start a Fundraiser Today
              </Link>
              <Link
                to="/campaigns"
                className="px-8 py-3.5 bg-forest-700 hover:bg-forest-600 text-white font-bold rounded-xl transition border border-forest-600 flex items-center justify-center"
              >
                Explore Active Causes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Donation Modal */}
      <DonationModal
        isOpen={Boolean(selectedCampaignForDonation)}
        onClose={() => setSelectedCampaignForDonation(null)}
        campaign={selectedCampaignForDonation}
        onDonationSuccess={handleDonationSuccess}
      />

      {/* Donation Receipt Modal */}
      <DonationReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default Home;
