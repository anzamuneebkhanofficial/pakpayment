"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Is PakPayment really free?",
    a: "Yes, completely. PakPayment charges 0% platform fees, 0% transaction fees, and has no hidden subscription costs. The project is open-source under the MIT license. You only experience standard receiving terms from your personal bank or digital wallet (which are typically 0 PKR for inward transfers).",
  },
  {
    q: "Does PakPayment hold, pool, or custody my customer funds?",
    a: "Never. PakPayment is strictly non-custodial. Money moves directly from your customer's bank account or mobile wallet into your registered account. We provide the cryptographic order lock, receipt submission flow, and automated webhook callback — we never touch or hold any capital.",
  },
  {
    q: "How do customers pay via JazzCash and EasyPaisa?",
    a: "You add your JazzCash/EasyPaisa mobile account in your dashboard. During checkout, your customer is shown your account number and title. They transfer directly from their mobile app and input their TRX ID for one-click verification.",
  },
  {
    q: "What is a 'Payment Claim' and how does verification work?",
    a: "When a customer finishes their transfer, they submit their bank reference or transaction ID. This logs an immutable claim in your dashboard. You verify the credit in your own bank app and click 'Confirm' — instantly notifying the customer and firing an automated webhook to your eCommerce store.",
  },
  {
    q: "Can I use PakPayment without having an eCommerce website?",
    a: "Yes. Every merchant gets an instant, hosted payment link at /pay/your-id. You can share this URL directly on WhatsApp, Instagram Bio, invoices, or SMS. You can also generate printable high-res QR codes for physical counters.",
  },
  {
    q: "How does PakPayment integrate with WooCommerce and Shopify?",
    a: "For WooCommerce, download the pre-packaged pakpayment-woocommerce.zip plugin directly from your dashboard and upload it to WordPress. For Shopify, configure PakPayment as a Manual Payment Method with our hosted checkout URL and Order Status script.",
  },
  {
    q: "What prevents buyers from tampering with the price in DevTools?",
    a: "PakPayment relies on server-locked order sessions. When an order initiates, your server invokes POST /api/v1/orders with your Secret Key. The price is cryptographically bound to that session ID. The client cannot manipulate the required amount.",
  },
  {
    q: "Is PakPayment compliant with Pakistani financial regulations?",
    a: "Yes. PakPayment facilitates direct peer-to-merchant settlements (IBAN, Raast, JazzCash, EasyPaisa). Because no funds are pooled or held by an intermediary, it complies with direct merchant collection models under State Bank of Pakistan (SBP) guidelines.",
  },
];

export default function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full bg-surface/30 border-y border-border/80 py-24 px-6 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-semibold text-neutral-300 mb-4 shadow-sm">
            <HelpCircle size={12} className="text-primary" /> Questions &amp; Answers
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-surface border border-neutral-800/80 rounded-2xl overflow-hidden transition-colors hover:border-neutral-700"
            >
              <button
                id={`faq-btn-${i}`}
                className="w-full flex justify-between items-center px-6 py-4.5 text-left font-bold text-sm text-white transition-colors cursor-pointer"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-primary transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
