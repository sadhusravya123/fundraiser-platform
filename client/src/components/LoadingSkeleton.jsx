import React from 'react';

export const CampaignCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft animate-pulse flex flex-col h-full">
    <div className="aspect-[16/10] bg-slate-200" />
    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div>
        <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-full mb-1" />
        <div className="h-3 bg-slate-200 rounded w-4/5 mb-4" />
      </div>
      <div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="h-2.5 bg-slate-200 rounded-full w-full mb-3" />
        <div className="pt-3 border-t border-slate-100 flex justify-between">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-6 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  </div>
);

export const CampaignDetailsSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 bg-slate-200 rounded w-2/3 mb-4" />
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-[16/9] bg-slate-200 rounded-3xl" />
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
      <div className="h-96 bg-slate-200 rounded-3xl" />
    </div>
  </div>
);

export default CampaignCardSkeleton;
