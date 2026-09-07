"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Eye, FileCheck2, DollarSign, Percent, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/merchant/analytics')
      .then((res) => res.json())
      .then((analytics) => {
        setData(analytics);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-neutral-500">Loading conversion analytics...</div>;

  const d = data || { views: 0, claims: 0, confirmedAmount: 0, conversionRate: 0, methodBreakdown: [] };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Conversion Analytics</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Lightweight 30-day funnel performance and payment method popularity
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Widget Views</span>
            <Eye size={16} className="text-white" />
          </div>
          <p className="text-4xl font-black text-white mt-4">{d.views}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">Last 30 days total impressions</span>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Payment Claims</span>
            <FileCheck2 size={16} className="text-secondary" />
          </div>
          <p className="text-4xl font-black text-secondary mt-4">{d.claims}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">Submitted receipts</span>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Claim-to-View Rate</span>
            <Percent size={16} className="text-primary" />
          </div>
          <p className="text-4xl font-black text-primary mt-4">{d.conversionRate}%</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">Conversion efficiency</span>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Confirmed Volume</span>
            <DollarSign size={16} className="text-green-400" />
          </div>
          <p className="text-3xl font-black text-white mt-4">PKR {d.confirmedAmount?.toLocaleString()}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">Verified in banking app</span>
        </div>
      </div>

      {/* Method Popularity Breakdown */}
      <div className="bg-surface p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
        <h3 className="font-bold text-lg text-white mb-2">Payment Method Popularity</h3>
        <p className="text-xs text-neutral-400 mb-6">Which rails your customers use the most</p>

        {d.methodBreakdown.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No payment method transactions logged yet. As claims come in, breakdown graphs will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {d.methodBreakdown.map((m: any) => {
              const percentage = d.claims > 0 ? Math.round((m.count / d.claims) * 100) : 0;
              return (
                <div key={m.method} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-white">{m.method}</span>
                    <span className="text-neutral-400 text-xs font-mono">
                      {m.count} claims ({percentage}%) • PKR {m.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
