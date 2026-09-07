// Server Component — checks session on the server and passes auth state to Navbar
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
  Star,
  Globe,
  Smartphone,
  Store,
  Users,
  Copy,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingPlatformShowcase from "@/components/landing/LandingPlatformShowcase";
import LandingArchitecture from "@/components/landing/LandingArchitecture";
import { getServerSession } from "@/lib/session";

// Inline GitHub SVG (lucide-react v1.x doesn't export Github)
function GithubIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
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
      {/* Glowing orb bg */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#CCFF00]/5 blur-[120px] pointer-events-none" />

      {/* Pill badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 mb-8 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
        Free · Open Source · Zero Custody · Made for Pakistan
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-white">
        Accept Payments{" "}
        <span className="text-[#CCFF00]">Directly.</span>
        <br />
        <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          No Gateway. No Fees. Ever.
        </span>
      </h1>

      {/* Trust quote */}
      <div className="my-4 px-6 py-3 rounded-2xl bg-[#CCFF00]/8 border border-[#CCFF00]/20 inline-block">
        <p className="text-xl sm:text-2xl font-black text-[#CCFF00] tracking-tight">
          &quot;We never touch your money.&quot;
        </p>
      </div>

      {/* Sub copy */}
      <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mt-4 mb-10 leading-relaxed">
        PakPayment lets freelancers, creators, and online stores collect direct
        bank transfers, JazzCash, EasyPaisa, and crypto — with a hosted payment
        link, embeddable widget, and a fully auditable merchant dashboard.
        Completely free, forever.
      </p>

      {/* CTAs — swap based on auth */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            id="hero-cta-dashboard"
            className="w-full sm:w-auto bg-[#CCFF00] text-black text-base font-black px-8 py-4 rounded-2xl hover:brightness-95 active:scale-95 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2"
          >
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        ) : (
          <>
            <Link
              href="/sign-up"
              id="hero-cta-signup"
              className="w-full sm:w-auto bg-[#CCFF00] text-black text-base font-black px-8 py-4 rounded-2xl hover:brightness-95 active:scale-95 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2"
            >
              Start Collecting Payments <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-howto"
              className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white px-8 py-4 rounded-2xl text-base font-bold transition-colors flex items-center justify-center gap-2"
            >
              See How It Works
            </a>
          </>
        )}
      </div>

      <p className="text-xs text-neutral-500 font-semibold mt-4">
        {isLoggedIn
          ? "Welcome back! Your dashboard is ready."
          : "Free, forever, for everyone. No credit card. No KYC. No hidden fees."}
      </p>

      {/* Trust row */}
      <div className="mt-12 flex flex-wrap justify-center gap-5">
        {[
          { icon: <ShieldCheck size={15} />, label: "Zero Custody of Funds" },
          { icon: <BadgeCheck size={15} />, label: "100% Free, No Fees" },
          { icon: <GithubIcon size={15} />, label: "Open Source on GitHub" },
          { icon: <Lock size={15} />, label: "Auditable Claims Ledger" },
        ].map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-2 text-xs text-neutral-400 font-semibold"
          >
            <span className="text-[#CCFF00]">{t.icon}</span>
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
    { value: "0%", label: "Platform Fees — Ever" },
    { value: "5+", label: "Payment Methods Supported" },
    { value: "100%", label: "Direct Peer-to-Merchant" },
    { value: "∞", label: "Free Accounts, No Limits" },
  ];
  return (
    <section className="w-full border-y border-neutral-800/60 bg-neutral-900/30">
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-4xl sm:text-5xl font-black text-[#CCFF00]">
              {s.value}
            </p>
            <p className="text-xs text-neutral-400 font-semibold mt-2 leading-snug">
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
      step: "01",
      icon: <Wallet size={26} />,
      color: "text-[#CCFF00]",
      borderColor: "border-[#CCFF00]/20",
      bgColor: "bg-[#CCFF00]/8",
      title: "Customer Transfers Directly",
      desc: "Your hosted checkout page displays your bank IBAN, JazzCash, or EasyPaisa number. The customer opens their own banking app and sends the money directly to you — PakPayment is never in the loop.",
    },
    {
      step: "02",
      icon: <MessageCircle size={26} />,
      color: "text-[#FF8C42]",
      borderColor: "border-[#FF8C42]/20",
      bgColor: "bg-[#FF8C42]/8",
      title: "Customer Submits Proof",
      desc: "After paying, the customer enters their transaction reference ID on the checkout page and taps a single button to send the confirmation screenshot to your WhatsApp instantly.",
    },
    {
      step: "03",
      icon: <ShieldCheck size={26} />,
      color: "text-green-400",
      borderColor: "border-green-500/20",
      bgColor: "bg-green-500/8",
      title: "You Verify & Confirm",
      desc: "Check the deposit in your own bank app, then open your merchant dashboard and confirm or reject the payment claim. Every action is logged in your fully auditable claims ledger.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="max-w-5xl mx-auto px-6 py-24 scroll-mt-20"
    >
      <div className="text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
          How It Works
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Simple as 1 – 2 – 3
        </h2>
        <p className="text-neutral-400 mt-4 max-w-lg mx-auto leading-relaxed">
          Zero custody, zero gateway. 100% direct peer-to-merchant transfers,
          verified by you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px bg-gradient-to-r from-[#CCFF00]/20 via-[#FF8C42]/20 to-green-500/20" />
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-[#171717] border border-neutral-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-neutral-700 transition-all hover:-translate-y-1 duration-300"
          >
            <div className="absolute bottom-4 right-6 text-7xl font-black text-white/4 select-none">
              {s.step}
            </div>
            <div
              className={`w-14 h-14 ${s.bgColor} rounded-2xl border ${s.borderColor} flex items-center justify-center mb-6 ${s.color}`}
            >
              {s.icon}
            </div>
            <span className={`text-xs font-bold font-mono ${s.color} uppercase tracking-wider`}>
              Step {s.step}
            </span>
            <h3 className="text-xl font-bold text-white mt-2 mb-3">{s.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAYMENT METHODS
───────────────────────────────────────────── */
function PaymentMethods() {
  const methods = [
    { name: "Bank Transfer", detail: "Any Pakistani bank via IBAN", emoji: "🏦", color: "border-blue-500/30 bg-blue-500/5", tag: "Direct" },
    { name: "JazzCash", detail: "Pakistan's #1 mobile wallet", emoji: "🟠", color: "border-orange-500/30 bg-orange-500/5", tag: "MFS" },
    { name: "EasyPaisa", detail: "Telenor digital payments", emoji: "🟢", color: "border-green-500/30 bg-green-500/5", tag: "MFS" },
    { name: "Crypto", detail: "USDT / BTC / ETH wallets", emoji: "₿", color: "border-yellow-500/30 bg-yellow-500/5", tag: "Crypto" },
    { name: "Cash on Counter", detail: "QR code for physical stores", emoji: "🏪", color: "border-purple-500/30 bg-purple-500/5", tag: "Offline" },
  ];
  return (
    <section className="w-full bg-neutral-900/30 border-y border-neutral-800/60 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
            Payment Methods
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Every way your customers want to pay
          </h2>
          <p className="text-neutral-400 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Add all your account details once, and your checkout page shows them all.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {methods.map((m) => (
            <div
              key={m.name}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${m.color} hover:-translate-y-0.5 transition-transform duration-200 min-w-[200px]`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <div>
                <p className="font-bold text-white text-sm">{m.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{m.detail}</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                {m.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES GRID
───────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: <Globe size={22} />, color: "text-[#CCFF00]", bg: "bg-[#CCFF00]/8 border-[#CCFF00]/20", title: "Hosted Payment Page", desc: "Every merchant gets a beautiful, branded checkout page at /pay/your-id. Share the link in Instagram bio, WhatsApp status, or any DM — no website needed." },
    { icon: <Code2 size={22} />, color: "text-[#FF8C42]", bg: "bg-[#FF8C42]/8 border-[#FF8C42]/20", title: "Embeddable Widget", desc: "Already have a website? Drop a single <script> tag and our payment widget appears on any page — Shopify, WordPress, or raw HTML." },
    { icon: <QrCode size={22} />, color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20", title: "Counter QR Codes", desc: "Generate a printable, professional QR code for your physical shop counter or market stall. Open-amount or fixed-amount — your choice." },
    { icon: <Lock size={22} />, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/20", title: "Auditable Claims Ledger", desc: "Every payment claim — transaction reference, customer contact, amount, and proof screenshot — is logged and searchable in your merchant dashboard." },
    { icon: <MessageCircle size={22} />, color: "text-green-400", bg: "bg-green-500/8 border-green-500/20", title: "WhatsApp Integration", desc: "Customers send payment proof directly to your WhatsApp with one tap — pre-filled message with order details. No manual copy-paste." },
    { icon: <BarChart3 size={22} />, color: "text-[#FF8C42]", bg: "bg-[#FF8C42]/8 border-[#FF8C42]/20", title: "Analytics Dashboard", desc: "Track widget views, payment conversion, confirmed revenue, and pending claims — all in one place. Know exactly what's performing." },
    { icon: <Zap size={22} />, color: "text-yellow-400", bg: "bg-yellow-500/8 border-yellow-500/20", title: "Instant Account Setup", desc: "Sign up, add your payment accounts, and get your live payment link in under 2 minutes. No approval, no KYC, no waiting." },
    { icon: <ShieldCheck size={22} />, color: "text-[#CCFF00]", bg: "bg-[#CCFF00]/8 border-[#CCFF00]/20", title: "Zero Custody, Always", desc: "PakPayment never holds, touches, or processes your money. Every rupee goes directly from your customer to your bank account." },
    { icon: <Copy size={22} />, color: "text-pink-400", bg: "bg-pink-500/8 border-pink-500/20", title: "Appearance Customization", desc: "Customize your checkout widget colors, business name, logo, and description so it matches your brand perfectly." },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
          Features
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Everything you need to collect payments
        </h2>
        <p className="text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
          A complete payment infrastructure — built for Pakistan&apos;s reality, not a Western card-first market.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#171717] border border-neutral-800/80 p-7 rounded-3xl hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-2xl border ${f.bg} flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   USE CASES
───────────────────────────────────────────── */
function UseCases() {
  const cases = [
    {
      emoji: "👨‍💻",
      audience: "Freelancers & Agencies",
      color: "border-[#CCFF00]/30",
      accent: "text-[#CCFF00]",
      scenarios: [
        "Share payment link with international/local clients",
        "Accept PKR via bank or JazzCash invoice payment",
        "Log every payment with proof for your records",
        "No payment gateway approval needed",
      ],
    },
    {
      emoji: "🛍️",
      audience: "Instagram & WhatsApp Sellers",
      color: "border-[#FF8C42]/30",
      accent: "text-[#FF8C42]",
      scenarios: [
        "Put your /pay link in Instagram bio",
        "Share in WhatsApp Status — customers pay directly",
        "Receive proof in WhatsApp from every buyer",
        "Track all orders in one dashboard",
      ],
    },
    {
      emoji: "🏪",
      audience: "Physical Shops & Markets",
      color: "border-purple-400/30",
      accent: "text-purple-400",
      scenarios: [
        "Print a QR code for your shop counter",
        "Customers scan and pay via JazzCash/EasyPaisa",
        "Fixed or open-amount QR options available",
        "Zero POS hardware required",
      ],
    },
  ];

  return (
    <section id="use-cases" className="w-full bg-neutral-900/30 border-y border-neutral-800/60 py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
            Who Is It For?
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
            Built for every Pakistani seller
          </h2>
          <p className="text-neutral-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Whether you have a full website or just an Instagram page — PakPayment works for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div key={c.audience} className={`bg-[#171717] border ${c.color} p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300`}>
              <div className="text-5xl mb-5">{c.emoji}</div>
              <h3 className={`text-xl font-bold mb-5 ${c.accent}`}>{c.audience}</h3>
              <ul className="space-y-3">
                {c.scenarios.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle2 size={16} className={`${c.accent} shrink-0 mt-0.5`} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GET STARTED STEPS
───────────────────────────────────────────── */
function GetStarted() {
  const steps = [
    { num: "1", title: "Create your free account", desc: "Sign up with just your email. No credit card, no KYC, no approval process." },
    { num: "2", title: "Add your payment accounts", desc: "Enter your bank IBAN, JazzCash number, EasyPaisa account, or crypto wallet address." },
    { num: "3", title: "Share your payment link", desc: "Copy your unique /pay/your-id link and paste it anywhere — Instagram, WhatsApp, email, or your website." },
    { num: "4", title: "Verify & track payments", desc: "Open your dashboard to review payment claims, confirm deposits, and track your full payment history." },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
          Getting Started
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
          Up and running in 2 minutes
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {steps.map((s) => (
          <div key={s.num} className="bg-[#171717] border border-neutral-800 rounded-3xl p-8 flex gap-5 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#CCFF00] flex items-center justify-center font-black text-black text-lg">
              {s.num}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/sign-up"
          id="getstarted-cta"
          className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-black px-10 py-4 rounded-2xl text-base hover:brightness-95 active:scale-95 transition-all shadow-[0_0_30px_rgba(204,255,0,0.25)]"
        >
          Create Your Free Account <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPEN SOURCE CTA
───────────────────────────────────────────── */
function OpenSourceCTA() {
  return (
    <section id="open-source" className="max-w-4xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="relative bg-[#171717] border border-[#CCFF00]/20 rounded-3xl p-10 sm:p-16 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CCFF00]/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold mb-6">
            <GithubIcon size={14} /> Open Source on GitHub
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
            Free &amp; Open Source.
            <br />
            <span className="text-[#CCFF00]">No strings attached.</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed mb-8">
            PakPayment is 100% free — no subscription, no transaction fee, no premium tier. The entire source code is open on GitHub. Self-host it, contribute to it, or fork it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              id="github-cta"
              className="flex items-center gap-2 bg-white text-black font-bold px-7 py-3.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <GithubIcon size={18} /> View on GitHub
            </a>
            <Link
              href="/sign-up"
              id="open-source-signup"
              className="flex items-center gap-2 bg-[#CCFF00] text-black font-bold px-7 py-3.5 rounded-xl hover:brightness-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            >
              Create Free Account <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
            {["MIT License", "Self-hostable", "Next.js 16", "MongoDB", "No vendor lock-in"].map((b) => (
              <div key={b} className="flex items-center gap-2">
                <Star size={13} className="text-[#CCFF00]" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────── */
function FinalCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="relative bg-gradient-to-br from-[#CCFF00]/10 via-neutral-900 to-[#FF8C42]/5 border border-neutral-800 rounded-3xl p-12 sm:p-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-[#CCFF00]/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-5">
            {isLoggedIn ? (
              <>Welcome back.<br /><span className="text-[#CCFF00]">Your dashboard awaits.</span></>
            ) : (
              <>Start accepting payments<br /><span className="text-[#CCFF00]">today. For free.</span></>
            )}
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto leading-relaxed mb-10">
            {isLoggedIn
              ? "Head to your dashboard to review payment claims, check analytics, and manage your accounts."
              : "Join thousands of Pakistani freelancers, sellers, and shop owners who collect payments directly — no middleman, no fees, no hassle."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                id="final-cta-dashboard"
                className="flex items-center gap-2 bg-[#CCFF00] text-black font-black px-10 py-4 rounded-2xl text-lg hover:brightness-95 active:scale-95 transition-all shadow-[0_0_40px_rgba(204,255,0,0.3)]"
              >
                Open Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  id="final-cta-signup"
                  className="flex items-center gap-2 bg-[#CCFF00] text-black font-black px-10 py-4 rounded-2xl text-lg hover:brightness-95 active:scale-95 transition-all shadow-[0_0_40px_rgba(204,255,0,0.3)]"
                >
                  Create Free Account <ArrowRight size={20} />
                </Link>
                <Link
                  href="/sign-in"
                  id="final-cta-signin"
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white px-8 py-4 rounded-2xl text-base font-bold transition-colors"
                >
                  Sign In to Dashboard <ExternalLink size={16} />
                </Link>
              </>
            )}
          </div>
          {!isLoggedIn && (
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-neutral-500 font-semibold">
              {["No credit card", "No KYC", "No fees ever", "Open source"].map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#CCFF00]" />
                  {b}
                </span>
              ))}
            </div>
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
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Use Cases", href: "#use-cases" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Create Account", href: "/sign-up" },
        { label: "Sign In", href: "/sign-in" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Forgot Password", href: "/forgot-password" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "GitHub", href: "https://github.com" },
        { label: "Embed Widget", href: "/dashboard/embed" },
        { label: "API Docs", href: "#" },
        { label: "Self-host Guide", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-neutral-900 bg-black">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#CCFF00] flex items-center justify-center text-black font-black text-sm">
                P
              </div>
              <span className="font-extrabold text-white">
                Pak<span className="text-[#CCFF00]">Payment</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-[200px]">
              Free, open-source, zero-custody payment collection for Pakistan.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <GithubIcon size={18} />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <TrendingUp size={18} />
              </a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">{c.title}</h4>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} PakPayment. Free direct payment infrastructure. Zero custody of funds.</p>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500">MIT License</span>
            <span className="px-2.5 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00]">Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE ROOT — Server Component
───────────────────────────────────────────── */
export default async function Home() {
  const session = await getServerSession();
  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-white selection:bg-[#CCFF00] selection:text-black overflow-x-hidden">
      {/* Auth-aware navbar — client component */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        <Hero isLoggedIn={isLoggedIn} />
        <StatsBar />
        <LandingPlatformShowcase />
        <LandingArchitecture />
        <HowItWorks />
        <PaymentMethods />
        <Features />
        <UseCases />
        <GetStarted />
        <OpenSourceCTA />
        {/* FAQ needs useState — client component */}
        <LandingFAQ />
        <FinalCTA isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </div>
  );
}
