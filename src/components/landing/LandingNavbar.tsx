"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";

interface LandingNavbarProps {
  isLoggedIn: boolean;
}

export default function LandingNavbar({ isLoggedIn }: LandingNavbarProps) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Integrations", href: "#integrations" },
    { label: "Architecture", href: "#architecture" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Payment Rails", href: "#rails" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="w-full border-b border-border/80 sticky top-0 bg-background/85 backdrop-blur-xl z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(197,248,42,0.25)] group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white leading-tight">
              PakPayment
            </span>
            <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-semibold">
              Direct Rails
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              id="nav-dashboard-btn"
              className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(197,248,42,0.2)]"
            >
              <LayoutDashboard size={15} />
              Merchant Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                id="nav-signin-btn"
                className="text-neutral-300 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                id="nav-signup-btn"
                className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(197,248,42,0.2)] flex items-center gap-1.5"
              >
                Get Started Free <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-neutral-300 hover:text-white p-1 rounded-lg focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black text-sm font-bold"
              >
                <LayoutDashboard size={16} /> Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-center py-2.5 rounded-xl border border-neutral-800 text-sm font-semibold text-neutral-300 hover:bg-neutral-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-center py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:brightness-105"
                >
                  Get Started Free &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
