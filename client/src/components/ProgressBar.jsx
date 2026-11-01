import React from 'react';

const ProgressBar = ({ current = 0, target = 1, showLabel = true, className = '' }) => {
  const percentage = Math.min(Math.round((current / (target || 1)) * 100), 1000);
  const visualWidth = Math.min(percentage, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span className="text-forest-700 font-bold">{percentage}% Funded</span>
          <span>Target: ${Number(target).toLocaleString()}</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            visualWidth >= 100
              ? 'bg-gradient-to-r from-forest-500 to-emerald-400'
              : visualWidth > 75
              ? 'bg-gradient-to-r from-forest-600 to-forest-500'
              : 'bg-gradient-to-r from-forest-700 to-forest-600'
          }`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
