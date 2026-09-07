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
  Sparkles,
  Zap,
  Layers,
  Smartphone,
  Server,
  Lock
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
      badge: 'Official Plugin',
      desc: '1-click WordPress plugin. Customers pay directly during checkout and orders automatically mark as paid upon merchant verification.',
      code: `// 1. Download & upload pakpayment-woocommerce.zip in WP Admin
// 2. Go to WooCommerce -> Settings -> Payments -> PakPayment
// 3. Paste your Public App ID & Secret Key
// 4. Save! All orders will update to Processing automatically.`,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      icon: '🛍️',
      badge: 'Manual Gateway + Portal',
      desc: 'Set up in Shopify Admin in 2 minutes. Provides customer instructions and directs them to your hosted checkout with zero transaction fees.',
      code: `<!-- Add to Shopify Admin -> Settings -> Checkout -> Additional scripts -->
<script>
  if (Shopify.Checkout && Shopify.Checkout.isOrderStatusPage) {
    var orderId = Shopify.checkout.order_id;
    var total = Shopify.checkout.total_price;
    var payUrl = "https://pakpayment.vercel.app/pay/YOUR_APP_ID?order=" + orderId + "&amount=" + total;
  }
</script>`,
    },
    {
      id: 'react',
      name: 'React / Next.js',
      icon: '⚛️',
      badge: 'Server-Locked SDK',
      desc: 'Create secure orders from your Node.js backend using your Secret Key, then mount the PakPaymentCheckout component.',
      code: `// 1. Server Route (app/api/checkout/route.ts)
const res = await fetch('https://pakpayment.vercel.app/api/v1/orders', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + process.env.PAK_SECRET_KEY },
  body: JSON.stringify({ orderId: 'ORD-101', amount: 3500, currency: 'PKR' })
});
const { sessionId } = await res.json();

// 2. Client Component (app/checkout/page.tsx)
<PakPaymentCheckout sessionId={sessionId} onSuccess={(claimId) => console.log('Paid!')} />`,
    },
    {
      id: 'html',
      name: 'HTML & PHP',
      icon: '🌐',
      badge: 'Universal Embed',
      desc: 'Embed on Laravel, Django, WordPress, or plain HTML websites with a 2-line script tag.',
      code: `<!-- 1. Place container on your checkout page -->
<div id="pakpayment-widget" data-session="cs_live_SESSION_ID"></div>

<!-- 2. Include the lightweight script -->
<script src="https://pakpayment.vercel.app/widget.js?appId=YOUR_APP_ID"></script>`,
    },
    {
      id: 'nocode',
      name: 'Wix & No-Code',
      icon: '🔗',
      badge: 'Hosted Link',
      desc: 'No coding needed. Copy your /pay/your-id link and paste it into any button on Wix, Squarespace, or Instagram.',
      code: `https://pakpayment.vercel.app/pay/YOUR_APP_ID?amount=4500&order=INV-88`,
    },
  ];

  const currentPlatform = platforms.find((p) => p.id === activePlatform)!;

  return (
    <section id="integrations" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20">
          <Layers size={13} /> Universal Gateway Architecture
        </span>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Integrate with Any Platform in Minutes
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          From full WooCommerce automation to Shopify manual checkouts, modern React SPAs, and zero-code payment links — PakPayment works seamlessly everywhere.
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
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#CCFF00] bg-neutral-900 shadow-[0_0_25px_rgba(204,255,0,0.12)]'
                    : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-700'
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
                  size={16}
                  className={`transition-transform ${isSelected ? 'text-[#CCFF00] translate-x-1' : 'text-neutral-600'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Code & Features Preview */}
        <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentPlatform.icon}</span>
                <h3 className="text-xl font-extrabold text-white">{currentPlatform.name} Integration</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed max-w-lg">
                {currentPlatform.desc}
              </p>
            </div>

            {activePlatform === 'woo' && (
              <a
                href="/downloads/pakpayment-woocommerce.zip"
                download="pakpayment-woocommerce.zip"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs shadow-md hover:brightness-95 transition-all shrink-0"
              >
                <Download size={14} /> Download Plugin (.zip)
              </a>
            )}
          </div>

          {/* Code Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Terminal size={14} className="text-[#CCFF00]" /> Implementation Code Snippet
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentPlatform.id, currentPlatform.code)}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
              >
                {copiedKey === currentPlatform.id ? (
                  <><Check size={12} className="text-[#CCFF00]" /> Copied</>
                ) : (
                  <><Copy size={12} /> Copy Code</>
                )}
              </button>
            </div>

            <div className="relative bg-black rounded-2xl border border-neutral-800/90 p-4 font-mono text-xs overflow-x-auto text-neutral-300">
              <pre className="whitespace-pre-wrap leading-relaxed">{currentPlatform.code}</pre>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-[#CCFF00] shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Zero Gateway Fees</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <Lock size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Server-Locked Prices</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2.5">
              <Zap size={16} className="text-[#FF8C42] shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Real-Time Webhooks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Gateway Simulator */}
      <div className="mt-20 bg-gradient-to-b from-neutral-950 to-black border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-mono font-bold uppercase text-[#CCFF00] tracking-wider">
            Interactive Test Drive
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Experience the Checkout Flow Live
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Test how customers pay you with zero intermediaries. No real money required!
          </p>
        </div>

        <div className="max-w-md mx-auto bg-neutral-950 border border-neutral-800/90 rounded-2xl p-6 space-y-5 shadow-2xl">
          {/* Simulator Step 1: Account Selection */}
          {simStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Order #DEMO-4821</span>
                  <p className="text-sm font-bold text-white">Arduino Starter Kit</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Locked Price</span>
                  <p className="text-base font-black font-mono text-[#CCFF00]">PKR 3,500</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-300">1. Select Payment Method:</span>
                {(['Meezan Bank', 'JazzCash', 'EasyPaisa'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSimMethod(method)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      simMethod === method
                        ? 'border-[#CCFF00] bg-neutral-900 text-white'
                        : 'border-neutral-800 bg-black text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{method}</span>
                    <span className="text-xs font-mono">{simMethod === method ? '●' : '○'}</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Account / IBAN Details:</span>
                <div className="flex items-center justify-between bg-black px-3 py-2 rounded-lg border border-neutral-800">
                  <code className="text-xs font-mono font-bold text-white">
                    {simMethod === 'Meezan Bank' ? 'PK27MEZN0002300102293201' : '03334098558'}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      setSimCopied(true);
                      setTimeout(() => setSimCopied(false), 2000);
                    }}
                    className="text-xs text-neutral-300 hover:text-white flex items-center gap-1"
                  >
                    {simCopied ? <Check size={12} className="text-[#CCFF00]" /> : <Copy size={12} />}
                    {simCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimStep(2)}
                className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-95 transition-all"
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
                <span className="text-xs font-mono text-[#CCFF00]">PKR 3,500</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">TRX ID / Bank Reference:</label>
                <input
                  type="text"
                  value={simTrx}
                  onChange={(e) => setSimTrx(e.target.value)}
                  placeholder="e.g. TRX-998822"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
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
                  }, 1000);
                }}
                className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-95 transition-all"
              >
                {simLoading ? 'Simulating Verification...' : 'Submit Claim'}
              </button>

              <button
                type="button"
                onClick={() => setSimStep(1)}
                className="w-full py-2 text-xs text-neutral-500 hover:text-white transition-colors"
              >
                &larr; Back to Payment Details
              </button>
            </div>
          )}

          {/* Simulator Step 3: Verified & Webhook Triggered */}
          {simStep === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Payment Claim Logged!</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Claim registered. Webhook <code>payment.confirmed</code> simulated for WooCommerce/Shopify.
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
                className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
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
