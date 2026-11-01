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
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Thank You for Your Support!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Your demo donation has been recorded and campaign funds updated.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulated Demo Transaction • No Real Payment Charged</span>
          </div>
        </div>

        {/* Printable Receipt Card */}
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
            <span className="text-slate-500">Donor Email</span>
            <span className="text-slate-700">{donorEmail}</span>
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

        {/* Action Buttons */}
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
