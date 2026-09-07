"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";

interface LandingNavbarProps {
  isLoggedIn: boolean;
}

export default function LandingNavbar({ isLoggedIn }: LandingNavbarProps) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Integrations", href: "#integrations" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="w-full border-b border-neutral-900 sticky top-0 bg-black/85 backdrop-blur-md z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.35)]">
            P
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Pak<span className="text-[#CCFF00]">Payment</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs — swap based on auth state */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              id="nav-dashboard-btn"
              className="flex items-center gap-2 bg-[#CCFF00] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
              <LayoutDashboard size={16} />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                id="nav-signin-btn"
                className="text-neutral-400 hover:text-white px-4 py-2 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                id="nav-signup-btn"
                className="bg-[#CCFF00] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center gap-1.5"
              >
                Get Started Free <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-black border-t border-neutral-900 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 border-t border-neutral-900 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#CCFF00] text-black text-sm font-bold"
              >
                <LayoutDashboard size={16} /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-center py-3 rounded-xl border border-neutral-800 text-sm font-semibold text-neutral-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-center py-3 rounded-xl bg-[#CCFF00] text-black text-sm font-bold"
                >
                  Get Started Free →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
