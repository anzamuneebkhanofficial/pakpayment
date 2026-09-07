"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is PakPayment really free?",
    a: "Yes, completely. PakPayment charges 0% platform fees, 0% transaction fees, and has no subscription plans. The product is open source and free forever. The only fees you pay are whatever your own bank or mobile wallet charges for receiving money — which are typically zero for receiving.",
  },
  {
    q: "Does PakPayment hold or process my money?",
    a: "Never. PakPayment is a non-custodial system. All payments go directly from your customer's bank/wallet to your own bank account or mobile wallet. We act purely as a coordination layer — displaying your payment details and logging claims. We have no ability to hold, freeze, or refund any funds.",
  },
  {
    q: "How do I get paid with JazzCash or EasyPaisa?",
    a: "You add your JazzCash/EasyPaisa registered mobile number in your merchant dashboard under Payment Accounts. Your checkout page then displays that number so customers can transfer directly from their JazzCash or EasyPaisa app to you.",
  },
  {
    q: "What is a 'payment claim' and how does verification work?",
    a: "When a customer completes a transfer, they submit the transaction reference number on your checkout page. This creates a 'payment claim' in your dashboard. You then open your actual bank app, verify the deposit arrived, and confirm or reject the claim. This two-step process prevents fraud while keeping PakPayment out of the money flow.",
  },
  {
    q: "Do I need a website to use PakPayment?",
    a: "No. Every merchant gets a hosted payment page at pakpayment.com/pay/your-id. You can share that link directly on WhatsApp, Instagram, Fiverr, or anywhere else. You can also download a printable QR code for a physical shop.",
  },
  {
    q: "Can I embed PakPayment on my existing website?",
    a: "Yes. From your dashboard, go to Embed and copy a single <script> tag. Paste it anywhere on your site and the payment widget appears instantly — no framework required.",
  },
  {
    q: "How does PakPayment integrate with WooCommerce?",
    a: "We provide an official, downloadable WooCommerce plugin (pakpayment-woocommerce.zip). You upload it in WordPress, enter your Public App ID and Secret Key, and save. When customers checkout, they are redirected to your server-locked payment session. Once you confirm the payment claim, a secure webhook automatically marks the WooCommerce order as Processing/Completed.",
  },
  {
    q: "Does PakPayment work with Shopify?",
    a: "Yes. In Shopify Admin, you add PakPayment as a Manual Payment Method and insert your hosted payment portal URL. Customers complete their direct transfer, and you can optionally install our Thank You page script to guide customers smoothly.",
  },
  {
    q: "What prevents customers from tampering with the price?",
    a: "PakPayment uses server-locked order sessions. When your store initiates an order, your server calls POST /api/v1/orders with your Secret Key and locks the amount. The customer cannot change the price in HTML or developer tools — the payment page enforces the exact amount from your server.",
  },
  {
    q: "How do automated Webhooks work?",
    a: "When you verify a customer's payment claim in your merchant dashboard, PakPayment signs an HMAC SHA-256 event and POSTs it directly to your store's webhook endpoint. Your store validates the signature and marks the order as paid in real time.",
  },
  {
    q: "Is PakPayment open source? Can I self-host it?",
    a: "Yes, PakPayment is 100% open source under the MIT license. You can clone the repository, deploy it on your own server or Vercel, and customize it however you like. There is no vendor lock-in.",
  },
  {
    q: "Is PakPayment legal in Pakistan?",
    a: "PakPayment facilitates direct peer-to-peer bank transfers which are fully legal and standard practice in Pakistan. We do not process, pool, or hold funds, so no payment gateway license is required. We are simply a record-keeping, verification, and coordination layer for direct transfers.",
  },
];

export default function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full bg-neutral-900/30 border-y border-neutral-800/60 py-24 px-6 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3 block">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
            Common Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#171717] border border-neutral-800 rounded-2xl overflow-hidden"
            >
              <button
                id={`faq-btn-${i}`}
                className="w-full flex justify-between items-center px-7 py-5 text-left font-bold text-white hover:bg-neutral-800/40 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#CCFF00] transition-transform duration-300 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-7 pb-6 text-sm text-neutral-400 leading-relaxed border-t border-neutral-800 pt-5">
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
