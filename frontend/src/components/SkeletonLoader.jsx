import React from 'react';
import { Loader2 } from 'lucide-react';

export const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100/50 animate-pulse space-y-4">
    <div className="h-6 w-1/3 bg-emerald-50 rounded-md shimmer-loader"></div>
    <div className="space-y-2">
      <div className="h-4 w-3/4 bg-emerald-50 rounded-md shimmer-loader"></div>
      <div className="h-4 w-1/2 bg-emerald-50 rounded-md shimmer-loader"></div>
    </div>
    <div className="h-10 w-full bg-emerald-50 rounded-xl shimmer-loader"></div>
  </div>
);

export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-emerald-100/30">
    <td className="p-4"><div className="h-5 w-24 bg-emerald-50 rounded shimmer-loader"></div></td>
    <td className="p-4"><div className="h-5 w-16 bg-emerald-50 rounded shimmer-loader"></div></td>
    <td className="p-4"><div className="h-5 w-16 bg-emerald-50 rounded shimmer-loader"></div></td>
    <td className="p-4"><div className="h-5 w-32 bg-emerald-50 rounded shimmer-loader"></div></td>
    <td className="p-4"><div className="h-9 w-20 bg-emerald-50 rounded shimmer-loader"></div></td>
  </tr>
);

export const SkeletonDocument = () => (
  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-emerald-100/60 animate-pulse space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-emerald-100">
      <div className="h-7 w-1/3 bg-emerald-50 rounded-md shimmer-loader"></div>
      <div className="h-7 w-20 bg-emerald-50 rounded-md shimmer-loader"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="h-4 w-1/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-5 w-3/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-4 w-1/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-5 w-1/2 bg-emerald-50 rounded-md shimmer-loader"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-1/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-5 w-3/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-4 w-1/4 bg-emerald-50 rounded-md shimmer-loader"></div>
        <div className="h-5 w-1/2 bg-emerald-50 rounded-md shimmer-loader"></div>
      </div>
    </div>
    <div className="space-y-2 pt-4 border-t border-emerald-50">
      <div className="h-4 w-full bg-emerald-50 rounded-md shimmer-loader"></div>
      <div className="h-4 w-5/6 bg-emerald-50 rounded-md shimmer-loader"></div>
      <div className="h-4 w-4/6 bg-emerald-50 rounded-md shimmer-loader"></div>
    </div>
  </div>
);

export const LoadingSpinner = ({ message = 'Please wait...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 rounded-2xl border border-emerald-100/50">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-lg font-medium text-emerald-900 mb-1">{message}</p>
      <span className="text-sm text-emerald-600/80">Connecting securely to digital land servers...</span>
    </div>
  );
};
