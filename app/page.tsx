import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  Wallet,
  ArrowRight,
  Lock,
  Zap,
  QrCode,
  BarChart3,
  Code2,
  ExternalLink,
  CheckCircle2,
  Globe,
  Smartphone,
  Store,
  Users,
  Copy,
  TrendingUp,
  BadgeCheck,
  Building2,
  Layers,
  Sparkles,
  Server
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingPlatformShowcase from "@/components/landing/LandingPlatformShowcase";
import LandingArchitecture from "@/components/landing/LandingArchitecture";
import { getServerSession } from "@/lib/session";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-primary/6 blur-[140px] pointer-events-none" />

      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Non-Custodial Payment Gateway & Peer-to-Merchant Infrastructure
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-white max-w-4xl">
        Accept Direct Bank &amp; Wallet Payments in Pakistan
      </h1>

      {/* Direct Value Proposition */}
      <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mt-2 mb-4 font-medium leading-relaxed">
        Zero Gateway Fees. Zero Fund Custody. Built for Local Reality.
      </p>

      {/* Sub copy */}
      <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mb-10 leading-relaxed">
        PakPayment allows Pakistani businesses, freelancers, and online stores to collect direct payments via Meezan, HBL, JazzCash, EasyPaisa, and Crypto — with hosted checkout portals, embeddable widgets, and automated HMAC webhook fulfillment.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            id="hero-cta-dashboard"
            className="w-full sm:w-auto bg-primary text-black text-sm font-bold px-8 py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(197,248,42,0.25)] flex items-center justify-center gap-2"
          >
            Open Merchant Dashboard <ArrowRight size={16} />
          </Link>
        ) : (
          <>
            <Link
              href="/sign-up"
              id="hero-cta-signup"
              className="w-full sm:w-auto bg-primary text-black text-sm font-bold px-8 py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(197,248,42,0.25)] flex items-center justify-center gap-2"
            >
              Start Collecting Payments <ArrowRight size={16} />
            </Link>
            <a
              href="#architecture"
              id="hero-cta-howto"
              className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 hover:border-neutral-700"
            >
              Explore Architecture
            </a>
          </>
        )}
      </div>

      <p className="text-xs text-neutral-500 font-medium mt-4">
        {isLoggedIn
          ? "Authenticated session active. Ready for live transactions."
          : "Free and open source. No credit card required. Zero paperwork or KYC delays."}
      </p>

      {/* Trust bar */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 pt-6 border-t border-neutral-900 w-full max-w-3xl">
        {[
          { icon: <ShieldCheck size={15} />, label: "100% Non-Custodial" },
          { icon: <BadgeCheck size={15} />, label: "0% Transaction Fees" },
          { icon: <GithubIcon size={15} />, label: "Open Source on GitHub" },
          { icon: <Lock size={15} />, label: "Auditable Claims Ledger" },
        ].map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-2 text-xs text-neutral-400 font-medium"
          >
            <span className="text-primary">{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: "0%", label: "Platform Fees Forever" },
    { value: "5+", label: "Local & Global Rails" },
    { value: "100%", label: "Direct Peer Settlement" },
    { value: "< 2 min", label: "Instant Onboarding Time" },
  ];
  return (
    <section className="w-full border-y border-border/80 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left pl-2 border-l border-neutral-800/80">
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {s.value}
            </p>
            <p className="text-xs text-neutral-400 font-medium mt-1 leading-snug">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      stage: "Stage 01",
      icon: <Wallet size={22} />,
      title: "Direct Customer Transfer",
      desc: "Your checkout portal presents your bank IBAN, JazzCash, or EasyPaisa credentials. The buyer transfers exact funds directly inside their personal mobile banking app.",
    },
    {
      stage: "Stage 02",
      icon: <MessageCircle size={22} />,
      title: "Instant Proof Submission",
      desc: "The buyer submits their TRX reference ID on the checkout page and transmits their payment screenshot directly to your WhatsApp with a single pre-formatted tap.",
    },
    {
      stage: "Stage 03",
      icon: <CheckCircle2 size={22} />,
      title: "Merchant Verification & Webhook Sync",
      desc: "You verify the incoming deposit inside your bank account, then click Confirm in your dashboard. An automated HMAC webhook immediately updates your store order to Paid.",
    },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
          <Zap size={12} className="text-primary" /> Streamlined Transaction Flow
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          How PakPayment Works
        </h2>
        <p className="text-neutral-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Zero middleman custody. 100% peer-to-merchant transfers confirmed directly by you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div
            key={s.stage}
            className="bg-surface border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800">
                  {s.stage}
                </span>
                <div className="text-neutral-400">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAYMENT RAILS
───────────────────────────────────────────── */
function PaymentRails() {
  const rails = [
    { name: "Bank Transfer", detail: "Meezan, HBL, Alfalah via IBAN / Raast", icon: Building2, tag: "Instant Raast" },
    { name: "JazzCash", detail: "Pakistan's premier mobile financial wallet", icon: Smartphone, tag: "MFS Direct" },
    { name: "EasyPaisa", detail: "Telenor digital payments & QR", icon: Smartphone, tag: "MFS Direct" },
    { name: "Cryptocurrency", detail: "USDT (TRC-20), BTC, ETH decentralized", icon: Wallet, tag: "Zero Chargeback" },
    { name: "Cash on Counter", detail: "Printable QR display for shops & stalls", icon: QrCode, tag: "POS Ready" },
  ];

  return (
    <section id="rails" className="w-full bg-surface/30 border-y border-border/80 py-20 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
            <Building2 size={12} className="text-primary" /> Supported Payment Rails
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Every Way Pakistani Customers Prefer to Pay
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Configure your accounts once in the dashboard. Your hosted checkout and widget instantly support them all.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rails.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.name}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/90 flex items-center justify-between hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-primary shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{r.detail}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                  {r.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES GRID (ASYMMETRIC BENTO)
───────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
          <Layers size={12} className="text-primary" /> Full-Featured Architecture
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Everything You Need to Collect Direct Payments
        </h2>
        <p className="text-neutral-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Engineered for Pakistan’s emerging digital commerce landscape — eliminating chargebacks, middleman fees, and payout delays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento 1: Hosted Payment Portal */}
        <div className="md:col-span-2 bg-surface border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hosted Payment Portal</h3>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">
              Every merchant receives a dedicated, mobile-optimized payment portal at <code>/pay/your-id</code>. Share the URL directly in Instagram bio, WhatsApp messages, or invoices without building or maintaining a website.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Instant URL generation</span>
            <span className="text-primary">100% Mobile Responsive</span>
          </div>
        </div>

        {/* Bento 2: 1-Click WhatsApp Proof */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">WhatsApp Proof Flow</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Customers submit receipts with one tap. WhatsApp launches with pre-filled order ID, amount, and TRX code ready to send to your support chat.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 font-mono">
            Pre-configured templates
          </div>
        </div>

        {/* Bento 3: Auditable Claims Ledger */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Auditable Claims Ledger</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every customer transaction claim is timestamped and tracked. Review buyer phone numbers, TRX codes, and mark claims Confirmed or Rejected with one click.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 font-mono">
            Zero duplicate reference collisions
          </div>
        </div>

        {/* Bento 4: Counter POS QR Codes */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Counter QR Generator</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Generate crisp, printable branded QR codes for physical shop counters, exhibition stalls, or printed invoice flyers. Supports open or locked invoice sums.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 font-mono">
            High-res PNG export included
          </div>
        </div>

        {/* Bento 5: Server-Locked HMAC Webhooks */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
              <Lock size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">HMAC-SHA256 Webhooks</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Cryptographically signed webhooks notify your store in real time upon merchant verification, automatically shifting WooCommerce/Shopify orders to Processing.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 font-mono">
            Signature header: X-PakPayment-Signature
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TWO WAYS TO USE: WITH OR WITHOUT A WEBSITE
───────────────────────────────────────────── */
function TwoWaysToUse() {
  return (
    <section id="use-cases" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
          <Layers size={12} className="text-primary" /> Flexible Integration Modes
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          How You Can Use PakPayment
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Engineered to adapt to your business — whether you operate a high-volume online store or sell directly on WhatsApp and Instagram with zero coding or hosting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PATH A: I HAVE A WEBSITE */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-neutral-700 transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-primary mb-6">
              <Globe size={13} /> OPTION 01
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              "I Have an Online Website or Store"
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-8">
              Connect your existing web store in under 2 minutes. Receive real-time order status updates when you approve payments.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <Store size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">WooCommerce &amp; WordPress</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Download our pre-packaged 1-click plugin zip, upload to WordPress, and automate order fulfillment via webhooks.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <Code2 size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Universal HTML &amp; PHP Script</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Embed a 2-line &lt;script&gt; tag on any custom website, Webflow, or Shopify theme for an instant checkout modal.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <Server size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">React &amp; Next.js 16 SDK</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Directly import our &lt;PakPaymentCheckout /&gt; component with TypeScript types and custom styling hooks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Includes HMAC Webhooks</span>
            <span className="text-primary font-bold">Auto-Syncs Order Status</span>
          </div>
        </div>

        {/* PATH B: I DO NOT HAVE A WEBSITE */}
        <div className="bg-surface border border-neutral-800 rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-neutral-700 transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400 mb-6">
              <Smartphone size={13} /> OPTION 02
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              "I Do NOT Have a Website"
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-8">
              No developer, hosting, or website required. We host your mobile-optimized checkout portal for you completely free.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <ExternalLink size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Instagram Bio &amp; Social Links</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Put your permanent /pay/your-id link directly in your Instagram, TikTok, or Facebook bio for one-tap payments.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <MessageCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">WhatsApp 1-Tap Order Proofs</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Buyers send payments and tap one button to transmit pre-formatted order details and screenshots straight to your WhatsApp.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3">
                <QrCode size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Physical Shop Counter QR Code</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">Generate and print high-resolution QR standees for physical retail counters, exhibition stalls, and invoices.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Zero Hosting Required</span>
            <span className="text-emerald-400 font-bold">100% Free &amp; Instant</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   WHO IS IT FOR?
───────────────────────────────────────────── */
function WhoIsItFor() {
  const audiences = [
    {
      title: "WooCommerce & Shopify Stores",
      desc: "Stop paying 2% to 4% transaction fees on every sale. Give customers a native Pakistani bank/wallet payment rail with automatic status updates upon approval.",
      bullets: [
        "Pre-packaged 1-click WooCommerce plugin",
        "Automated HMAC order fulfillment",
        "Zero merchant setup fees or hidden cuts",
      ],
    },
    {
      title: "Freelancers & Digital Agencies",
      desc: "Collect client retainers and project invoices via direct bank deposit or JazzCash. Send a clean branded payment link with automatic receipt logging.",
      bullets: [
        "Customizable payment link for invoices",
        "Shareable via email, WhatsApp, or Slack",
        "Auditable payment claim records",
      ],
    },
    {
      title: "Instagram & WhatsApp Sellers",
      desc: "Turn your social DM buyers into organized orders. Place your /pay URL in your bio and receive organized TRX proofs on WhatsApp instead of messy screenshots.",
      bullets: [
        "Place live link in Instagram Bio",
        "One-tap buyer receipt submission",
        "Complete customer database tracking",
      ],
    },
  ];

  return (
    <section className="w-full bg-surface/30 border-y border-border/80 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
            <Users size={12} className="text-primary" /> Target Audiences
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for the Realities of Pakistani Commerce
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Whether you run a high-volume WordPress storefront, an agency, or a boutique Instagram catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-white mb-2">{a.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">{a.desc}</p>
                <ul className="space-y-2.5 text-xs text-neutral-300">
                  {a.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GETTING STARTED (2-MIN ONBOARDING)
───────────────────────────────────────────── */
function GettingStarted() {
  const steps = [
    { num: "01", title: "Create Free Account", desc: "Sign up with your email. No credit card or merchant approval required." },
    { num: "02", title: "Add Payment Accounts", desc: "Enter your bank IBAN, JazzCash number, EasyPaisa, or crypto wallet." },
    { num: "03", title: "Embed or Share Link", desc: "Copy your /pay link, embed the widget script, or install the WooCommerce plugin." },
    { num: "04", title: "Verify & Fulfill", desc: "Confirm customer payment claims in your dashboard to auto-complete orders." },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
          <Zap size={12} className="text-primary" /> Rapid Setup
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Live and Collecting in 2 Minutes
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((st) => (
          <div key={st.num} className="bg-surface border border-neutral-800 rounded-2xl p-6 relative">
            <span className="text-xs font-mono font-bold text-primary block mb-3">{st.num}</span>
            <h4 className="text-sm font-bold text-white mb-1.5">{st.title}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{st.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:brightness-105 transition-all shadow-[0_0_20px_rgba(197,248,42,0.2)]"
        >
          Create Your Free Account <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPEN SOURCE BANNER
───────────────────────────────────────────── */
function OpenSourceBanner() {
  return (
    <section className="w-full bg-surface/40 border-y border-border/80 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
          <GithubIcon size={14} className="text-primary" /> Open Source &amp; Transparent
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Free &amp; Open Source. Self-Hostable Anytime.
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          PakPayment is 100% free with no hidden transaction fees or premium tiers. The codebase is fully open under the MIT License for the Pakistani developer community.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-200 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <GithubIcon size={15} /> Star on GitHub
          </a>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:brightness-105 transition-all"
          >
            Launch Hosted Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BOTTOM CALL TO ACTION
───────────────────────────────────────────── */
function BottomCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24 text-center">
      <div className="bg-gradient-to-b from-surface to-neutral-950 border border-neutral-800 rounded-3xl p-10 sm:p-14 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Eliminate Gateway Commissions?
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Join Pakistani businesses collecting direct bank and wallet payments with zero middleman deductions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-primary text-black font-bold px-8 py-3.5 rounded-xl text-sm hover:brightness-105 transition-all shadow-[0_0_20px_rgba(197,248,42,0.25)] flex items-center gap-2"
            >
              Go to Merchant Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="bg-primary text-black font-bold px-8 py-3.5 rounded-xl text-sm hover:brightness-105 transition-all shadow-[0_0_20px_rgba(197,248,42,0.25)] flex items-center gap-2"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-neutral-950 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
              P
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">PakPayment</span>
            <span className="text-xs text-neutral-500 font-mono ml-2">© 2026 Direct Rails</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#rails" className="hover:text-white transition-colors">Payment Rails</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/sign-in" className="hover:text-white transition-colors">Merchant Portal</Link>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 PakPayment — Free &amp; Open Source non-custodial direct payment architecture.</p>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>Created by</span>
            <a
              href="https://muhammadanzamuneebkhan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary font-semibold transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
            >
              Muhammad Anza Muneeb Khan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE EXPORT (SERVER COMPONENT)
───────────────────────────────────────────── */
export default async function HomePage() {
  const session = await getServerSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero isLoggedIn={isLoggedIn} />
        <StatsBar />
        <LandingPlatformShowcase />
        <LandingArchitecture />
        <HowItWorks />
        <PaymentRails />
        <Features />
        <TwoWaysToUse />
        <WhoIsItFor />
        <GettingStarted />
        <OpenSourceBanner />
        <LandingFAQ />
        <BottomCTA isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </div>
  );
}
