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

  // Calculate days left
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  );

  const isCompleted = status === 'completed' || daysLeft === 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Category Pill */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md bg-white/95 ${
            categoryColors[category] || categoryColors.Other
          }`}
        >
          {category}
        </span>

        {/* Status / Days Left Pill */}
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

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organizer Info */}
          {organizer && (
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <img
                src={
                  organizer.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    organizer.name || 'User'
                  )}&background=2D6A4F&color=fff`
                }
                alt={organizer.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate">by {organizer.name}</span>
            </div>
          )}

          {/* Title */}
          <Link to={`/campaigns/${_id}`}>
            <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2 group-hover:text-forest-700 transition mb-2">
              {title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        <div>
          {/* Financials & Progress Bar */}
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

          {/* Donors & CTA */}
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
