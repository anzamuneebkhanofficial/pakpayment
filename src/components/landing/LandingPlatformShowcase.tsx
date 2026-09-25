"use client";

import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Code2,
  Globe,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Smartphone,
  Server,
  Lock,
  Building2,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPlatformShowcase() {
  const [activePlatform, setActivePlatform] = useState<'woo' | 'shopify' | 'react' | 'html' | 'nocode'>('woo');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulator state
  const [simStep, setSimStep] = useState<1 | 2 | 3>(1);
  const [simMethod, setSimMethod] = useState<'Meezan Bank' | 'JazzCash' | 'EasyPaisa'>('Meezan Bank');
  const [simTrx, setSimTrx] = useState('');
  const [simCopied, setSimCopied] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const platforms = [
    {
      id: 'woo',
      name: 'WooCommerce',
      icon: '🛒',
      badge: 'Official Plugin (.zip)',
      desc: 'Native WordPress gateway plugin. Direct customer settlement on checkout and automated HMAC order completion upon merchant approval.',
      code: `// 1. Download & upload pakpayment-woocommerce.zip via WP Admin
// 2. Navigate to WooCommerce -> Settings -> Payments -> PakPayment
// 3. Enter your Public App ID & Secret Key
// 4. Save! Webhooks will automatically update orders to "Processing".`,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      icon: '🛍️',
      badge: 'Manual Gateway + Script',
      desc: 'Seamless manual payment method for Shopify checkouts. Displays your payment instructions and embeds our hosted payment portal.',
      code: `<!-- Add to Shopify Admin -> Settings -> Checkout -> Additional scripts -->
<script>
  if (Shopify.Checkout && Shopify.Checkout.isOrderStatusPage) {
    var orderId = Shopify.checkout.order_id;
    var total = Shopify.checkout.total_price;
    var portalUrl = "https://pakpayment.com/pay/YOUR_APP_ID?order=" + orderId + "&amount=" + total;
    console.log("PakPayment portal active:", portalUrl);
  }
</script>`,
    },
    {
      id: 'react',
      name: 'Next.js 16 & React',
      icon: '⚡',
      badge: 'Server-Locked SDK',
      desc: 'Lock order amounts securely on your backend via Secret Key, then mount the zero-iframe responsive payment widget.',
      code: `// 1. Server Route Handler (app/api/checkout/route.ts)
export async function POST(req: Request) {
  const res = await fetch('https://pakpayment.com/api/v1/orders', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.PAK_SECRET_KEY },
    body: JSON.stringify({ orderId: 'ORD-101', amount: 3500, currency: 'PKR' })
  });
  const { sessionId } = await res.json();
  return Response.json({ sessionId });
}

// 2. Client Checkout Page (app/checkout/page.tsx)
<PakPaymentWidget sessionId={sessionId} onSuccess={(claim) => router.push('/thank-you')} />`,
    },
    {
      id: 'html',
      name: 'HTML & PHP',
      icon: '🌐',
      badge: 'Universal Script',
      desc: 'Embed on Laravel, Django, WordPress, or plain HTML websites with a 2-line embed snippet.',
      code: `<!-- 1. Place container on your payment page -->
<div id="pakpayment-widget" data-session="cs_live_SESSION_ID"></div>

<!-- 2. Include the lightweight script -->
<script src="https://pakpayment.com/widget.js?appId=YOUR_APP_ID" async></script>`,
    },
    {
      id: 'nocode',
      name: 'Instagram & No-Code',
      icon: '🔗',
      badge: 'Hosted URL',
      desc: 'Zero coding required. Copy your /pay/your-id link and place it in your Instagram bio, WhatsApp catalog, or invoice buttons.',
      code: `https://pakpayment.com/pay/YOUR_APP_ID?amount=3500&order=INV-88`,
    },
  ];

  const currentPlatform = platforms.find((p) => p.id === activePlatform)!;

  return (
    <section id="integrations" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
          <Layers size={12} className="text-primary" /> Multi-Platform Ecosystem
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Integrate with Any Platform in Under 5 Minutes
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          From full WooCommerce automated fulfillment to Shopify order portals, Next.js 16 full-stack SDKs, and zero-code WhatsApp payment links.
        </p>
      </div>

      {/* Platform Switcher & Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Platform Tabs */}
        <div className="lg:col-span-4 space-y-2.5">
          {platforms.map((p) => {
            const isSelected = activePlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlatform(p.id as any)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-primary/50 bg-neutral-900 shadow-[0_0_20px_rgba(197,248,42,0.08)]'
                    : 'border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-mono">{p.badge}</span>
                  </div>
                </div>
                <ArrowRight
                  size={15}
                  className={`transition-transform ${isSelected ? 'text-primary translate-x-1' : 'text-neutral-600'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Code & Features Preview */}
        <div className="lg:col-span-8 bg-surface border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentPlatform.icon}</span>
                <h3 className="text-lg font-extrabold text-white">{currentPlatform.name} Integration</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed max-w-lg">
                {currentPlatform.desc}
              </p>
            </div>

            {activePlatform === 'woo' && (
              <a
                href="/downloads/pakpayment-woocommerce.zip"
                download="pakpayment-woocommerce.zip"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs shadow-sm hover:brightness-105 transition-all shrink-0"
              >
                <Download size={13} /> Download Plugin (.zip)
              </a>
            )}
          </div>

          {/* Code Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Terminal size={13} className="text-primary" /> Integration Blueprint
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentPlatform.id, currentPlatform.code)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              >
                {copiedKey === currentPlatform.id ? (
                  <><Check size={12} className="text-primary" /> Copied</>
                ) : (
                  <><Copy size={12} /> Copy Code</>
                )}
              </button>
            </div>

            <div className="relative bg-black/90 rounded-2xl border border-neutral-800 p-4 font-mono text-xs overflow-x-auto text-neutral-300">
              <pre className="whitespace-pre-wrap leading-relaxed">{currentPlatform.code}</pre>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Zero Gateway Fees</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <Lock size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Server-Locked Prices</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <Layers size={16} className="text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Real-Time Webhooks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Gateway Simulator */}
      <div className="mt-20 bg-surface/50 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider">
            Interactive Test Drive
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Experience the Live Checkout Flow
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Simulate how a customer completes a direct deposit with instant proof submission.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
          {/* Simulator Step 1: Account Selection */}
          {simStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Order #DEMO-4821</span>
                  <p className="text-sm font-bold text-white">Custom Leather Wallet</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Total Due</span>
                  <p className="text-base font-black font-mono text-primary">PKR 3,500</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-300">1. Select Payment Rail:</span>
                {[
                  { id: 'Meezan Bank', label: 'Meezan Bank (IBAN)', icon: Building2 },
                  { id: 'JazzCash', label: 'JazzCash Mobile Wallet', icon: Wallet },
                  { id: 'EasyPaisa', label: 'EasyPaisa Digital Account', icon: Smartphone }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSimMethod(id as any)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      simMethod === id
                        ? 'border-primary/60 bg-neutral-900 text-white'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={simMethod === id ? 'text-primary' : 'text-neutral-400'} />
                      <span className="text-xs font-bold">{label}</span>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      simMethod === id ? 'border-primary bg-primary' : 'border-neutral-600'
                    }`}>
                      {simMethod === id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Transfer Account Number / IBAN:</span>
                <div className="flex items-center justify-between bg-black px-3 py-2 rounded-lg border border-neutral-800">
                  <code className="text-xs font-mono font-bold text-white select-all">
                    {simMethod === 'Meezan Bank' ? 'PK27MEZN0002300102293201' : '03334098558'}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      setSimCopied(true);
                      setTimeout(() => setSimCopied(false), 2000);
                    }}
                    className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {simCopied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                    {simCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimStep(2)}
                className="w-full py-3 rounded-xl bg-primary text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all cursor-pointer"
              >
                I&apos;ve Sent PKR 3,500 &mdash; Enter TRX ID <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Simulator Step 2: Proof Submission */}
          {simStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs font-bold text-white">Step 2: Enter Transaction Reference</span>
                <span className="text-xs font-mono text-primary font-bold">PKR 3,500</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">TRX ID / Bank Reference:</label>
                <input
                  type="text"
                  value={simTrx}
                  onChange={(e) => setSimTrx(e.target.value)}
                  placeholder="e.g. TRX-998822"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                disabled={simLoading}
                onClick={() => {
                  setSimLoading(true);
                  setTimeout(() => {
                    setSimLoading(false);
                    setSimStep(3);
                  }, 800);
                }}
                className="w-full py-3 rounded-xl bg-primary text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all cursor-pointer"
              >
                {simLoading ? 'Simulating Verification...' : 'Submit Claim'}
              </button>

              <button
                type="button"
                onClick={() => setSimStep(1)}
                className="w-full py-2 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                &larr; Back to Payment Details
              </button>
            </div>
          )}

          {/* Simulator Step 3: Verified & Webhook Triggered */}
          {simStep === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Payment Claim Logged!</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Claim registered. Webhook <code>payment.confirmed</code> simulated for store backend.
                </p>
              </div>

              <div className="p-3 bg-black rounded-xl border border-neutral-800 text-left font-mono text-[11px] text-emerald-400 space-y-1">
                <p>&gt; HTTP POST /?wc-api=pakpayment_webhook</p>
                <p>&gt; Status: 200 OK</p>
                <p>&gt; Order #DEMO-4821 marked as Processing</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSimStep(1);
                  setSimTrx('');
                }}
                className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Reset Simulator
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
