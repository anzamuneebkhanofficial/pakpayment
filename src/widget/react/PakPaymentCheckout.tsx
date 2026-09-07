"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Check, MessageCircle, ShieldCheck, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export interface PakPaymentCheckoutProps {
  sessionId: string;
  apiBaseUrl?: string;
  onSuccess?: (claimId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PakPaymentCheckout({
  sessionId,
  apiBaseUrl = '',
  onSuccess,
  onError,
  className = '',
}: PakPaymentCheckoutProps) {
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(!sessionId ? 'Missing sessionId' : null);
  const [order, setOrder] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [reference, setReference] = useState('');
  const [senderName, setSenderName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      if (onError) onError('Missing sessionId');
      return;
    }

    setLoading(true);
    fetch(`${apiBaseUrl}/api/public/session/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Payment session expired or invalid');
        return res.json();
      })
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Failed to load session');
        setOrder(data.order);
        setConfig(data.config);
        setMethods(data.methods || []);
        if (data.methods && data.methods.length > 0) {
          setSelectedMethod(data.methods[0]);
        }
        if (data.order?.customerName) setSenderName(data.order.customerName);
        if (data.order?.customerEmail) setCustomerEmail(data.order.customerEmail);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        if (onError) onError(err.message);
      });
  }, [sessionId, apiBaseUrl, onError]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) return;
    setSubmitting(true);

    try {
      const appId = config?.appId || order?.appId;
      const res = await fetch(`${apiBaseUrl}/api/public/widget/${appId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          orderId: order?.orderId,
          amount: order?.amount,
          currency: order?.currency || 'PKR',
          methodUsed: selectedMethod.provider,
          reference: reference || 'Direct Transfer',
          senderName,
          customerWhatsApp,
          customerEmail,
          contactChannel: 'whatsapp',
          customerContact: customerWhatsApp || customerEmail || senderName,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit payment claim');
      }

      setSubmitted(true);
      if (onSuccess) onSuccess(resData.claimId);
    } catch (err: any) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = config?.primaryColor || '#CCFF00';

  if (loading) {
    return (
      <div className={`p-8 text-center bg-neutral-950 border border-neutral-800 rounded-2xl ${className}`}>
        <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-400">Loading secure payment options...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center bg-red-950/20 border border-red-800/40 rounded-2xl ${className}`}>
        <p className="text-xs font-semibold text-red-400">⚠️ {error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`p-8 text-center bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 ${className}`}>
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">Payment Claim Submitted!</h4>
          <p className="text-xs text-neutral-400 mt-1">
            Order #{order?.orderId} of PKR {order?.amount?.toLocaleString()} is now awaiting verification.
          </p>
        </div>
        {order?.redirectUrl && (
          <a
            href={order.redirectUrl}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-black transition-transform active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Return to Store <ArrowRight size={13} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`p-6 bg-neutral-950 border border-neutral-800 rounded-2xl text-white space-y-5 ${className}`}>
      {/* Session Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Order Reference</span>
          <p className="text-sm font-mono font-bold text-white">{order?.orderId}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Amount Due</span>
          <p className="text-base font-black font-mono" style={{ color: primaryColor }}>
            PKR {order?.amount?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
        <ShieldCheck size={14} />
        <span>Server-Verified Session · Zero Custody</span>
      </div>

      {/* Payment Methods */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300">1. Select Payment Method:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {methods.map((m) => {
            const isSelected = selectedMethod?._id === m._id;
            return (
              <button
                key={m._id}
                type="button"
                onClick={() => setSelectedMethod(m)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected ? 'border-primary bg-neutral-900' : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/70'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white capitalize">{m.provider}</p>
                  <p className="text-[11px] text-neutral-400">{m.accountName}</p>
                </div>
                <span className="text-xs">{isSelected ? '●' : '○'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Method Details */}
      {selectedMethod && (
        <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Transfer To Account / IBAN:</span>
          <div className="flex items-center justify-between bg-black px-3 py-2 rounded-lg border border-neutral-800">
            <code className="text-xs font-mono font-bold text-white select-all">{selectedMethod.accountNumber}</code>
            <button
              type="button"
              onClick={() => handleCopy(selectedMethod._id, selectedMethod.accountNumber)}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1"
            >
              {copiedId === selectedMethod._id ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
              {copiedId === selectedMethod._id ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Verification Inputs */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Transaction Reference / TRX ID:</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TID-987654321"
            className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Sender Account Title:</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Ali Khan"
              className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Your WhatsApp Number:</label>
            <input
              type="text"
              value={customerWhatsApp}
              onChange={(e) => setCustomerWhatsApp(e.target.value)}
              placeholder="03334098558"
              className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {submitting ? (
          <><Loader2 size={14} className="animate-spin" /> Confirming...</>
        ) : (
          <><MessageCircle size={15} /> Confirm Payment</>
        )}
      </button>
    </div>
  );
}
