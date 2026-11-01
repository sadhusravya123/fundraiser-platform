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

    if (!donorName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!donorEmail.trim()) {
      setErrorMsg('Please enter your email.');
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
      console.error('Donation error:', err);
      const msg = err.response?.data?.message || 'Failed to process donation. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
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

        {/* Demo Mode Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 text-xs mb-5">
          <ShieldCheck className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Flow:</span> No real payment card or money will be charged. This simulates an authentic donation processing pipeline for viva demonstration.
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Donation Amounts */}
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

            {/* Custom Amount Field */}
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

          {/* Donor Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Sravya Rao"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="e.g. sravya@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Words of Encouragement (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Keeping you in our thoughts! Stay strong."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
            />
          </div>

          {/* Anonymous Option */}
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

          {/* Demo Payment Channel Selector */}
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

          {/* Submit Button */}
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
