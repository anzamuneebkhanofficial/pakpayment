"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Check, MessageCircle, Mail, HelpCircle, ShieldCheck, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

const checkoutClaimSchema = z.object({
  reference: z.string().optional(),
  senderName: z.string().optional(),
  customerWhatsApp: z.string().optional(),
  customerEmail: z.string().optional(),
});

type CheckoutClaimFormValues = z.infer<typeof checkoutClaimSchema>;

interface Method {
  _id: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  additionalDetails?: string;
}

const POPULAR_CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD'];

// Approx exchange rates for guidance when paying in PKR via local wallets (JazzCash, EasyPaisa, Meezan)
const APPROX_PKR_RATES: Record<string, number> = {
  USD: 278,
  EUR: 302,
  GBP: 355,
  AED: 76,
  SAR: 74,
  CAD: 205,
};

export default function HostedCheckoutClient({
  appId,
  config,
  methods,
  initialAmount,
  initialOrder,
  initialCurrency = 'PKR',
  sessionId,
  isLocked,
  items = [],
  redirectUrl,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  merchantWa = '',
}: {
  appId: string;
  config: any;
  methods: Method[];
  initialAmount: number | null;
  initialOrder: string;
  initialCurrency?: string;
  sessionId?: string;
  isLocked?: boolean;
  items?: Array<{ name: string; quantity: number; price: number }>;
  redirectUrl?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  merchantWa?: string;
}) {
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(methods[0] || null);
  const [currency, setCurrency] = useState<string>(initialCurrency || 'PKR');
  const [amount, setAmount] = useState<number | null>(initialAmount);
  const [orderId, setOrderId] = useState<string>(initialOrder);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Submission & Countdown Redirect States
  const [isClaimSubmitted, setIsClaimSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState<string | null>(null);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Per-channel loading state — tracks which button is busy
  const [loadingChannel, setLoadingChannel] = useState<'whatsapp' | 'email' | null>(null);

  // Confirmation modal before submitting
  const [pendingChannel, setPendingChannel] = useState<'whatsapp' | 'email' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isAnyLoading = loadingChannel !== null || confirmLoading;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<CheckoutClaimFormValues>({
    resolver: zodResolver(checkoutClaimSchema),
    defaultValues: {
      reference: '',
      senderName: customerName || '',
      customerWhatsApp: customerPhone || '',
      customerEmail: customerEmail || '',
    },
  });

  const c = config || {};
  const primaryColor = c.primaryColor || '#CCFF00';
  const borderRadius = c.borderRadius || '16px';

  // Sanitize Merchant's WhatsApp number to International Format (e.g., 03334098558 -> 923334098558)
  const rawWaNumber = c.whatsappNumber || merchantWa || '';
  let cleanWaNumber = rawWaNumber.replace(/[^0-9]/g, '');
  if (cleanWaNumber.startsWith('0')) {
    cleanWaNumber = '92' + cleanWaNumber.substring(1);
  } else if (cleanWaNumber.startsWith('0092')) {
    cleanWaNumber = cleanWaNumber.substring(2);
  }

  const handleCopyAccount = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    toast.success(`Copied ${num} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Build the complete, rich, professional WhatsApp message
  const getFormattedMessage = (
    referenceVal: string,
    senderVal: string,
    custWaVal: string,
    custEmailVal: string
  ) => {
    let template = c.whatsappTemplate || '';

    // If template is empty or legacy, upgrade to the complete professional template
    if (
      !template ||
      template.trim() === 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.'
    ) {
      template = `Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}.
• Transaction Reference (TRX ID): {{REF}}
• Sender Account Title / Name: {{SENDER}}
• Customer WhatsApp: {{WHATSAPP}}
• Customer Email: {{EMAIL}}

I have attached my transfer receipt screenshot below. Please verify and confirm my order. Thank you!`;
    }

    const contactSummary = [custWaVal ? `WhatsApp: ${custWaVal}` : '', custEmailVal ? `Email: ${custEmailVal}` : ''].filter(Boolean).join(' • ');

    let msg = template
      .replace(/{{AMOUNT}}/g, amount ? `${currency} ${amount.toLocaleString()}` : 'the requested amount')
      .replace(/{{ORDER_ID}}/g, orderId || 'Direct Payment')
      .replace(/{{METHOD}}/g, selectedMethod?.provider || 'Direct Transfer')
      .replace(/{{REF}}/g, referenceVal || 'N/A')
      .replace(/{{SENDER}}/g, senderVal || 'N/A')
      .replace(/{{CUSTOMER_WHATSAPP}}/g, custWaVal || 'N/A')
      .replace(/{{WHATSAPP}}/g, custWaVal || 'N/A')
      .replace(/{{CUSTOMER_EMAIL}}/g, custEmailVal || 'N/A')
      .replace(/{{EMAIL}}/g, custEmailVal || 'N/A')
      .replace(/{{CONTACT}}/g, contactSummary || 'N/A');

    // Smart fallback: If a custom template is missing any of these variables, cleanly append them!
    if (!template.includes('{{REF}}') && referenceVal) {
      msg += `\n• Transaction Reference: ${referenceVal}`;
    }
    if (!template.includes('{{SENDER}}') && senderVal) {
      msg += `\n• Sender Account Title: ${senderVal}`;
    }
    if (!template.includes('{{WHATSAPP}}') && !template.includes('{{CUSTOMER_WHATSAPP}}') && custWaVal) {
      msg += `\n• Customer WhatsApp: ${custWaVal}`;
    }
    if (!template.includes('{{EMAIL}}') && !template.includes('{{CUSTOMER_EMAIL}}') && custEmailVal) {
      msg += `\n• Customer Email: ${custEmailVal}`;
    }
    if (!msg.toLowerCase().includes('screenshot')) {
      msg += `\n\nI have attached my transfer receipt screenshot below. Please verify and confirm my order.`;
    }

    return msg;
  };

  const handleSelectMethod = (m: Method) => {
    setSelectedMethod(m);
    fetch(`/api/public/widget/${appId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'method_selected', method: m.provider }),
    }).catch(() => {});
  };

  // Step 1: open confirm modal
  const handleConfirmClick = (channel: 'whatsapp' | 'email') => {
    if (!selectedMethod) {
      toast.error('Please select a payment method first.');
      return;
    }
    setPendingChannel(channel);
    setConfirmOpen(true);
  };

  // Step 2: user confirmed — actually submit
  const handleConfirmPayment = async () => {
    const channel = pendingChannel;
    if (!channel || !selectedMethod) return;

    setConfirmLoading(true);
    setConfirmOpen(false);
    setLoadingChannel(channel);

    const formValues = getValues();
    const reference = formValues.reference || '';
    const sender = formValues.senderName || '';
    const custWhatsApp = formValues.customerWhatsApp || '';
    const custEmail = formValues.customerEmail || '';
    const messageText = getFormattedMessage(reference, sender, custWhatsApp, custEmail);

    try {
      const res = await fetch(`/api/public/widget/${appId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          orderId: orderId || 'Direct Payment',
          amount: amount && amount > 0 ? Number(amount) : null,
          currency: currency,
          methodUsed: selectedMethod.provider,
          reference: reference || (sender ? `Sender: ${sender}` : 'Direct Transfer'),
          senderName: sender,
          customerWhatsApp: custWhatsApp,
          customerEmail: custEmail,
          contactChannel: channel,
          customerContact: custEmail || custWhatsApp || sender || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('Claim submission response:', errorData);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.redirectUrl && !redirectUrl) {
          setPendingRedirectUrl(data.redirectUrl);
        }
      }

      setIsClaimSubmitted(true);
      setCountdown(10);
      setAutoRedirectCancelled(false);

      if (channel === 'whatsapp' && cleanWaNumber) {
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanWaNumber}&text=${encodeURIComponent(messageText)}`;
        setPendingRedirectUrl(waUrl);
        toast.success('Payment claim logged! Opening WhatsApp in 10 seconds...');
      } else if (channel === 'email' && c.fallbackEmail) {
        const mailUrl = `mailto:${c.fallbackEmail}?subject=${encodeURIComponent(
          `Payment Receipt: Order #${orderId || 'Direct'}`
        )}&body=${encodeURIComponent(messageText)}`;
        setPendingRedirectUrl(mailUrl);
        toast.success('Payment claim logged! Opening email in 10 seconds...');
      } else {
        toast.success('Payment claim submitted successfully! Merchant has received your notification.');
      }
    } catch (e) {
      console.error('Error submitting payment claim:', e);
      setIsClaimSubmitted(true);
      setCountdown(10);
      if (channel === 'whatsapp' && cleanWaNumber) {
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanWaNumber}&text=${encodeURIComponent(messageText)}`;
        setPendingRedirectUrl(waUrl);
      }
    } finally {
      setLoadingChannel(null);
      setConfirmLoading(false);
      setPendingChannel(null);
    }
  };

  // 10-second countdown and redirect handler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isClaimSubmitted && pendingRedirectUrl && !autoRedirectCancelled) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      } else if (countdown === 0) {
        window.location.href = pendingRedirectUrl;
      }
    }
    return () => clearTimeout(timer);
  }, [isClaimSubmitted, countdown, pendingRedirectUrl, autoRedirectCancelled]);

  const handleOpenNow = () => {
    if (pendingRedirectUrl) {
      window.location.href = pendingRedirectUrl;
    }
  };

  const handleCancelAutoRedirect = () => {
    setAutoRedirectCancelled(true);
    toast.info('Auto-redirect cancelled. You can stay on this page.');
  };

  const formValues = getValues();

  return (
    <>
    {/* Confirm before submitting claim */}
    <ConfirmModal
      open={confirmOpen}
      variant="confirm"
      title={pendingChannel === 'whatsapp' ? 'Confirm via WhatsApp?' : 'Send Confirmation via Email?'}
      description={pendingChannel === 'whatsapp'
        ? 'This will log your payment claim and open WhatsApp with your complete receipt details pre-filled. The merchant will receive an email notification instantly.'
        : 'This will log your payment claim and open your email app with the receipt details. The merchant will be notified instantly.'
      }
      details={[
        { label: 'Order', value: orderId || 'Direct Payment' },
        { label: 'Amount', value: amount ? `${currency} ${amount.toLocaleString()}` : 'Custom' },
        { label: 'Method', value: selectedMethod?.provider || '—' },
        { label: 'TRX Ref', value: formValues.reference || '—' },
        { label: 'Sender Name', value: formValues.senderName || '—' },
      ]}
      yesLabel={pendingChannel === 'whatsapp' ? '✓ Yes, Open WhatsApp' : '✓ Yes, Send via Email'}
      loading={confirmLoading}
      onConfirm={handleConfirmPayment}
      onCancel={() => { setConfirmOpen(false); setPendingChannel(null); }}
    />
    <div
      className="w-full max-w-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all"
      style={{
        backgroundColor: '#171717',
        borderRadius: borderRadius,
        border: '1px solid #262626',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        {c.businessLogoUrl && (
          <img src={c.businessLogoUrl} alt={c.businessName} className="h-10 mx-auto mb-3 object-contain" />
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{c.businessName || 'Merchant Payment'}</h1>
        <h2 className="text-sm opacity-80 mt-0.5 text-neutral-300">{c.widgetTitle || 'Direct Bank & Wallet Transfer'}</h2>
        {c.widgetSubtitle && <p className="text-xs text-neutral-400 mt-1">{c.widgetSubtitle}</p>}

        {/* Order / Amount Banner */}
        <div className="mt-4 p-3.5 bg-black/60 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-left flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 text-neutral-400">Order Reference</span>
            {orderId ? (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-mono font-extrabold text-white">Order #{orderId.replace(/^Order\s*#/i, '')}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Tracked</span>
              </div>
            ) : (
              <input
                type="text"
                disabled={isClaimSubmitted}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. Order #101 or Note (Optional)"
                className="mt-1 w-full bg-black/80 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-primary disabled:opacity-50"
              />
            )}
          </div>
          <div className="text-left sm:text-right flex-1 sm:flex-none">
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 text-neutral-400">Amount to Pay</span>
              {/* Currency Selector Dropdown */}
              <select
                value={currency}
                disabled={isClaimSubmitted}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-white rounded-md px-1.5 py-0.5 focus:outline-none focus:border-primary cursor-pointer hover:border-neutral-500 transition-colors"
                title="Select Currency"
              >
                {POPULAR_CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 mt-1 sm:justify-end">
              <span className="text-xs font-mono font-bold text-neutral-400">{currency}</span>
              <input
                type="number"
                disabled={isClaimSubmitted}
                value={amount ?? ''}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : null)}
                placeholder="Amount"
                className="w-28 bg-black/80 border border-neutral-800 rounded-lg px-2 py-1 text-base font-black font-mono focus:outline-none focus:border-primary sm:text-right disabled:opacity-50"
                style={{ color: primaryColor }}
              />
            </div>

            {/* Approximate PKR conversion guide for foreign currencies when using local wallets */}
            {currency !== 'PKR' && amount && APPROX_PKR_RATES[currency] && (
              <p className="text-[10px] text-neutral-400 mt-1 font-mono sm:text-right">
                ≈ PKR {Math.round(amount * APPROX_PKR_RATES[currency]).toLocaleString()} (@ {APPROX_PKR_RATES[currency]}/{currency})
              </p>
            )}
          </div>
        </div>

        {isLocked && (
          <div className="mt-2.5 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck size={14} className="text-emerald-400" /> Server-Verified Checkout Session
            </span>
            <span className="font-mono text-[10px] opacity-80">{sessionId?.slice(0, 16)}...</span>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="mt-2.5 p-3 bg-black/40 rounded-xl border border-neutral-800/80 text-left text-xs space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Order Items</span>
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-neutral-300">
                <span>{it.name} × {it.quantity}</span>
                <span className="font-mono text-white">{currency} {(it.price * it.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isClaimSubmitted ? (
        /* Post-Submission Success Screen with 10s Countdown */
        <div className="space-y-6 text-center py-4 animate-fade-in">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/30 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-white">Payment Claim Submitted!</h3>
            <p className="text-sm text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Your transaction details have been logged. The merchant has received an instant email notification.
            </p>
          </div>

          <div className="bg-black/60 p-4 rounded-2xl border border-neutral-800 text-left text-xs space-y-2.5 max-w-sm mx-auto">
            <div className="flex justify-between">
              <span className="text-neutral-400">Order Reference:</span>
              <span className="font-bold text-white font-mono">{orderId || 'Direct Payment'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Amount Paid:</span>
              <span className="font-bold font-mono" style={{ color: primaryColor }}>
                {currency} {amount ? amount.toLocaleString() : 'Custom'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Payment Account:</span>
              <span className="font-bold text-white">{selectedMethod?.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Status:</span>
              <span className="font-bold text-secondary">Pending Verification</span>
            </div>
          </div>

          {/* 10-Second Countdown Banner */}
          {pendingRedirectUrl && !autoRedirectCancelled && (
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 flex items-center gap-2">
                  <MessageCircle size={14} className="text-green-400" /> Redirecting to WhatsApp in:
                </span>
                <span className="font-mono font-extrabold text-primary text-sm">{countdown}s</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    backgroundColor: primaryColor,
                    width: `${((10 - countdown) / 10) * 100}%`,
                  }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenNow}
                  className="flex-1 py-2.5 bg-primary text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:brightness-95 transition-all shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                >
                  Open WhatsApp Now <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelAutoRedirect}
                  className="px-3 py-2.5 bg-black border border-neutral-800 text-neutral-400 hover:text-white text-xs rounded-xl transition-colors"
                >
                  Stay Here
                </button>
              </div>
            </div>
          )}

          {(!pendingRedirectUrl || autoRedirectCancelled) && (
            <div className="space-y-2 max-w-sm mx-auto">
              {redirectUrl && (
                <a
                  href={redirectUrl}
                  className="w-full py-3 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:brightness-95 transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] mb-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Return to Merchant Store <ArrowRight size={13} />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {}
                }}
                className="w-full py-3 bg-neutral-900 border border-neutral-800 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Close Window
              </button>
              <p className="text-[11px] text-neutral-500">
                You will receive confirmation via WhatsApp and Email once verified.
              </p>
            </div>
          )}
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center p-8 bg-black/50 rounded-2xl border border-neutral-800 space-y-2">
          <p className="font-semibold text-sm text-white">No payment methods configured yet.</p>
          <p className="text-xs text-neutral-400">Please contact the merchant for payment details.</p>
        </div>
      ) : (
        /* Main Payment Form */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 text-neutral-300">
              1. Transfer to Merchant Account
            </span>
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 opacity-90"
            >
              <HelpCircle size={13} /> How it works
            </button>
          </div>

          {/* Account Selector Cards */}
          <div className="space-y-2.5">
            {methods.map((m) => {
              const isSelected = selectedMethod?._id === m._id;
              return (
                <div
                  key={m._id}
                  onClick={() => handleSelectMethod(m)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-700 bg-black/80 shadow-lg'
                      : 'border-neutral-800/60 bg-black/30 hover:bg-black/50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs uppercase font-black"
                        style={{ backgroundColor: primaryColor, color: '#000' }}
                      >
                        {m.provider.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight text-white">{m.provider}</p>
                        <p className="text-xs text-neutral-400 leading-tight mt-0.5">{m.accountName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">{isSelected ? '● Selected' : '○'}</span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 text-neutral-400">
                          Transfer Account / IBAN
                        </span>
                        <div className="flex items-center justify-between bg-neutral-900/90 px-3.5 py-2.5 rounded-xl border border-neutral-800 mt-1">
                          <code className="font-mono text-sm font-bold text-white select-all">{m.accountNumber}</code>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAccount(m._id, m.accountNumber);
                            }}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-medium transition-colors text-white"
                          >
                            {copiedId === m._id ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                            {copiedId === m._id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {m.additionalDetails && (
                        <p className="text-xs text-neutral-400 bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-800/60">
                          {m.additionalDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {c.instructionNotice && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs rounded-xl leading-relaxed">
              {c.instructionNotice}
            </div>
          )}

          {/* Verification Form */}
          <form className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-semibold opacity-70 uppercase tracking-wider mb-1 text-neutral-300">
                2. Transaction Reference / TRX ID (Optional)
              </label>
              <input
                type="text"
                {...register('reference')}
                placeholder="e.g. TID-987654321 from your receipt"
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-70 uppercase tracking-wider mb-1 text-neutral-300">
                Sender Account Title / Name (From which account you transferred)
              </label>
              <input
                type="text"
                {...register('senderName')}
                placeholder="e.g. Your Name"
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Must match the account title on your JazzCash, EasyPaisa, or Bank app.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold opacity-70 uppercase tracking-wider mb-1 text-neutral-300">
                  Your WhatsApp Number
                </label>
                <input
                  type="text"
                  {...register('customerWhatsApp')}
                  placeholder="e.g. 03331234567"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Active WhatsApp for direct merchant order updates.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold opacity-70 uppercase tracking-wider mb-1 text-neutral-300">
                  Your Email Address
                </label>
                <input
                  type="email"
                  {...register('customerEmail')}
                  placeholder="e.g. yourname@example.com"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  For automated receipt & dispatch tracking emails.
                </p>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={() => handleConfirmClick('whatsapp')}
                disabled={isAnyLoading || isClaimSubmitted}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                {loadingChannel === 'whatsapp' ? (
                  <><Loader2 className="animate-spin" size={16} /> Submitting claim...</>
                ) : (
                  <><MessageCircle size={18} /> I've Paid — Confirm via WhatsApp</>
                )}
              </button>

              {rawWaNumber && (
                <p className="text-[11px] text-center text-neutral-400">
                  Direct WhatsApp chat will open with <strong className="text-white font-mono">{rawWaNumber}</strong>
                </p>
              )}

              {/* Email Button — disabled while WhatsApp is loading */}
              {c.fallbackEmail && (
                <button
                  type="button"
                  onClick={() => handleConfirmClick('email')}
                  disabled={isAnyLoading || isClaimSubmitted}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-neutral-300 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingChannel === 'email' ? (
                    <><Loader2 className="animate-spin" size={13} /> Submitting...</>
                  ) : (
                    <><Mail size={13} /> Send Confirmation via Email ({c.fallbackEmail})</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-medium px-1">
        <span>Zero Custody Architecture</span>
        <span className="flex items-center gap-1.5">
          Powered by <span className="text-white font-bold">Pak Payment</span> <ShieldCheck size={12} className="text-primary" />
        </span>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white">How Direct Payment Works</h3>
              <button type="button" onClick={() => setShowHowItWorks(false)} className="text-neutral-500 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-neutral-300">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-black font-extrabold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  <strong className="text-white">Direct Transfer:</strong> You send money directly from your bank or wallet app (JazzCash, EasyPaisa, Meezan) to the merchant's account. No middleman holds your funds.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-black font-extrabold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  <strong className="text-white">Submit Claim:</strong> You enter your transaction reference and click "Confirm via WhatsApp" to send the receipt screenshot to the merchant.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-black font-extrabold flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  <strong className="text-white">Merchant Verifies:</strong> The merchant checks their own banking app for the incoming deposit and marks your order confirmed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-3 bg-neutral-900 border border-neutral-800 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Got it, continue payment
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
