import { ShieldCheck, Server, Smartphone, CheckCircle2, Lock, ArrowRight, XCircle, ArrowUpRight, Cpu } from 'lucide-react';

export default function LandingArchitecture() {
  return (
    <section id="architecture" className="w-full bg-surface/40 border-y border-border/80 py-24 px-6 scroll-mt-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
            <Lock size={12} className="text-primary" /> Cryptographic Integrity Standard
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            How the Gateway Architecture Protects Your Store
          </h2>
          <p className="text-neutral-400 mt-4 text-sm sm:text-base leading-relaxed">
            Unlike fragile client-side scripts that allow buyers to edit prices in browser Developer Tools, PakPayment enforces server-locked order sessions and HMAC-SHA256 signature verification.
          </p>
        </div>

        {/* Comparison: Vulnerable Client-Side vs PakPayment Cryptographic Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Vulnerable Client-Side Approach */}
          <div className="bg-red-950/10 border border-red-900/30 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <XCircle size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Traditional Client-Side Script</h4>
                  <span className="text-[11px] text-red-400 font-mono font-semibold">High Fraud & Tampering Risk</span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                Simple JavaScript tags that read the product price directly from DOM attributes allow malicious buyers to manipulate checkout numbers before sending payment.
              </p>

              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span>Reads price from browser HTML tags (e.g. <code>data-price</code>), susceptible to inspect-element manipulation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span>Any customer can right-click, edit HTML, and change Rs 50,000 to Rs 1 without server detection.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span>Blocked by modern Shopify Checkout Extensibility standards due to security non-compliance.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span>No automated server-to-server webhook order completion; manual confirmation chaos.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-red-900/20 flex items-center justify-between text-[11px] font-mono text-red-400/80">
              <span>Security Level: Unverified</span>
              <span>Price Integrity: 0%</span>
            </div>
          </div>

          {/* PakPayment Server-Side Gateway Model */}
          <div className="bg-surface border border-primary/20 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-[0_0_35px_rgba(197,248,42,0.05)]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/30">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">PakPayment Gateway Model</h4>
                  <span className="text-[11px] text-primary font-mono font-semibold">100% Cryptographically Sealed</span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                Orders are generated server-side with your Secret API Key. The price is cryptographically locked into a session ID that cannot be modified from the buyer’s browser.
              </p>

              <ul className="space-y-3 text-xs text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold shrink-0 mt-0.5">✓</span>
                  <span>Server locks the amount before checkout (tamper-proof against browser DevTools).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold shrink-0 mt-0.5">✓</span>
                  <span>Direct peer-to-merchant deposit (0% fee, zero custody of funds, instant liquidity).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold shrink-0 mt-0.5">✓</span>
                  <span>HMAC-SHA256 signed webhooks auto-fulfill WooCommerce, Shopify, and custom backend orders.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold shrink-0 mt-0.5">✓</span>
                  <span>Compatible with WooCommerce, Shopify, Next.js 16, Vite React, PHP, and Webflow.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-primary">
              <span>Security Level: Enterprise HMAC</span>
              <span>Price Integrity: 100% Guaranteed</span>
            </div>
          </div>
        </div>

        {/* 3-Step Architecture Pipeline */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic Transaction Lifecycle</h3>
              <p className="text-xs text-neutral-400">Complete end-to-end payment state machine</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Zero-Custody Protocol</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono font-bold text-primary">
                  STAGE 01
                </span>
                <Server size={17} className="text-neutral-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Server-Side Order Creation</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your store backend calls <code>POST /api/v1/orders</code> with your Secret Key. Order total and items are sealed with a unique session ID.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono font-bold text-primary">
                  STAGE 02
                </span>
                <Smartphone size={17} className="text-neutral-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Direct Peer Settlement</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Customer transfers exact PKR to your Meezan IBAN, JazzCash, or EasyPaisa in their banking app, then submits their TRX reference ID.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono font-bold text-primary">
                  STAGE 03
                </span>
                <CheckCircle2 size={17} className="text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Automated Webhook Fulfillment</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upon merchant confirmation in dashboard, an HMAC-SHA256 signed webhook triggers, instantly transitioning the store order to Processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
