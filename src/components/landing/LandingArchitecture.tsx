import { ShieldCheck, Server, Smartphone, CheckCircle2, Lock, ArrowRight, XCircle } from 'lucide-react';

export default function LandingArchitecture() {
  return (
    <section id="architecture" className="w-full bg-neutral-900/30 border-y border-neutral-800/60 py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20">
            <Lock size={13} /> Enterprise-Grade Security
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            How the Gateway Architecture Protects Your Revenue
          </h2>
          <p className="text-neutral-400 mt-4 text-sm sm:text-base leading-relaxed">
            Unlike simple HTML embed scripts that are vulnerable to price tampering in developer tools, PakPayment uses server-locked order sessions and cryptographic webhook signatures.
          </p>
        </div>

        {/* Comparison: Vulnerable vs PakPayment Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vulnerable Client-Side Approach */}
          <div className="bg-red-950/10 border border-red-900/30 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <XCircle size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Traditional Client-Side Script</h4>
                <span className="text-xs text-red-400 font-mono">High Fraud Risk</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span>Reads price from browser HTML tags (e.g. <code>data-price</code>).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span>Any user can right-click, inspect HTML, and change Rs 50,000 to Rs 1.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span>Blocked by Shopify Checkout Extensibility for security reasons.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span>No automated server-to-server webhook order completion.</span>
              </li>
            </ul>
          </div>

          {/* PakPayment Server-Side Gateway Model */}
          <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_40px_rgba(204,255,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">PakPayment Gateway Model</h4>
                <span className="text-xs text-[#CCFF00] font-mono">100% Cryptographically Secure</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-bold shrink-0">✓</span>
                <span>Server locks the amount before checkout (tamper-proof).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-bold shrink-0">✓</span>
                <span>Direct peer-to-merchant deposit (0% fee, zero custody of funds).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-bold shrink-0">✓</span>
                <span>HMAC SHA-256 signed webhooks auto-fulfill WooCommerce/Shopify orders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-bold shrink-0">✓</span>
                <span>Compatible with WooCommerce, Shopify, React, Next.js, and Custom APIs.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3-Step Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-[#CCFF00]">
                01
              </div>
              <Server size={18} className="text-neutral-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Server-Side Order Creation</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your WooCommerce plugin or backend calls <code>POST /api/v1/orders</code> with your Secret API Key. The price is locked into a tamper-proof session.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-[#CCFF00]">
                02
              </div>
              <Smartphone size={18} className="text-neutral-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Direct Customer Transfer</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Customer transfers funds directly to your IBAN, JazzCash, or EasyPaisa in their banking app and enters their TRX ID. Money goes directly to you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-[#CCFF00]">
                03
              </div>
              <CheckCircle2 size={18} className="text-neutral-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Automated Webhook Fulfillment</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When confirmed in your merchant dashboard, an HMAC-signed webhook notifies your store in real time, automatically marking the order as Paid.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
