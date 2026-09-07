"use client";

import { useEffect, useState } from 'react';
import { Copy, MessageCircle, Check, Eye } from 'lucide-react';

export default function PreviewPage() {
  const [config, setConfig] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('2500');
  const [orderId, setOrderId] = useState('DEMO-101');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/merchant/config').then((r) => r.json()),
      fetch('/api/merchant/methods').then((r) => r.json()),
    ]).then(([configData, methodsData]) => {
      setConfig(configData.draftConfig || configData.publishedConfig || {});
      setMethods(methodsData || []);
      if (methodsData?.length > 0) setSelectedMethod(methodsData[0]);
      setLoading(false);
    });
  }, []);

  const handleTestClaim = () => {
    setClaimSubmitted(true);
    setTimeout(() => setClaimSubmitted(false), 4000);
  };

  if (loading) return <div className="text-neutral-500">Loading live preview sandbox...</div>;

  const c = config || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Live Widget Preview</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Interactive test sandbox rendering your current draft settings and payment methods
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Mock Order Controls */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
          <h3 className="font-bold text-white text-md flex items-center gap-2">
            <Eye size={18} className="text-primary" /> Test Order Parameters
          </h3>
          <p className="text-xs text-neutral-400">
            Simulate how your widget receives checkout details from your store.
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Amount (PKR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-500 space-y-1">
            <p>• Methods loaded: <span className="text-white font-medium">{methods.length}</span></p>
            <p>• Primary Color: <span className="font-mono text-primary">{c.primaryColor || '#CCFF00'}</span></p>
            <p>• Draft status: <span className="text-green-400 font-medium">Ready</span></p>
          </div>
        </div>

        {/* Right Side: Rendered Widget Box */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className="w-full max-w-md p-6 rounded-3xl shadow-2xl relative overflow-hidden transition-all"
            style={{
              backgroundColor: c.backgroundColor || '#000000',
              color: c.textColor || '#ffffff',
              borderRadius: c.borderRadius || '16px',
              border: '1px solid #262626',
            }}
          >
            <div className="text-center mb-6">
              <h1 className="text-xl font-extrabold">{c.businessName || 'Your Store'}</h1>
              <h2 className="text-sm font-semibold opacity-90 mt-1">{c.widgetTitle || 'Select Payment Method'}</h2>
              {c.widgetSubtitle && <p className="text-xs opacity-60 mt-1">{c.widgetSubtitle}</p>}

              <div className="mt-4 p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs opacity-70">Order #{orderId}</span>
                <span className="text-md font-bold font-mono" style={{ color: c.primaryColor || '#CCFF00' }}>
                  PKR {Number(amount).toLocaleString()}
                </span>
              </div>
            </div>

            {methods.length === 0 ? (
              <div className="text-center p-8 bg-black/40 rounded-2xl border border-neutral-800">
                <p className="text-sm opacity-60">This merchant hasn't set up payment methods yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Payment Rails:</p>
                {methods.map((m) => {
                  const isSelected = selectedMethod?._id === m._id;
                  return (
                    <div
                      key={m._id}
                      onClick={() => setSelectedMethod(m)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-neutral-700 bg-neutral-900/90 shadow-lg'
                          : 'border-neutral-800/60 bg-black/40 hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs uppercase font-extrabold"
                            style={{ backgroundColor: c.primaryColor || '#CCFF00', color: '#000' }}
                          >
                            {m.provider.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{m.provider}</p>
                            <p className="text-xs opacity-60 leading-tight mt-0.5">{m.accountName}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono opacity-80">{isSelected ? '✓' : ''}</span>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider opacity-60">Account Number / IBAN</span>
                            <div className="flex items-center justify-between bg-black/80 px-3 py-2 rounded-xl border border-neutral-800/80 mt-1">
                              <code className="font-mono text-sm font-semibold">{m.accountNumber}</code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(m.accountNumber);
                                }}
                                className="opacity-70 hover:opacity-100 p-1"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>

                          {c.instructionNotice && (
                            <p className="text-[11px] p-2.5 rounded-xl bg-blue-500/10 text-blue-200 border border-blue-500/20">
                              {c.instructionNotice}
                            </p>
                          )}

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider opacity-60 mb-1">
                              Transaction Reference ID (TRX / Ref)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 987654321"
                              value={reference}
                              onChange={(e) => setReference(e.target.value)}
                              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={handleTestClaim}
                            className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
                            style={{ backgroundColor: c.primaryColor || '#CCFF00', color: '#000' }}
                          >
                            <MessageCircle size={15} /> I've Paid — Confirm via WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {claimSubmitted && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/40 text-green-300 text-xs rounded-xl text-center">
                ✓ Test claim registered! In live mode, this logs a claim & opens WhatsApp.
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-[10px] opacity-40">Zero Custody • Direct Bank Transfer • Pak Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
