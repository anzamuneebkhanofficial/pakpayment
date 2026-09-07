"use client";

import { useState } from 'react';
import CopyButton from '@/components/dashboard/CopyButton';
import { 
  Globe, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  MessageCircle, 
  CreditCard, 
  ShoppingBag, 
  Check, 
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface EmbedCodeClientProps {
  appUrl: string;
  appId: string;
  version: number;
  isLocalhost: boolean;
  isOrderButtonEnabled?: boolean;
}

export default function EmbedCodeClient({
  appUrl,
  appId,
  version,
  isLocalhost,
  isOrderButtonEnabled = true,
}: EmbedCodeClientProps) {
  const [activeTab, setActiveTab] = useState<'checkout' | 'order_button'>('checkout');
  const [activePlatform, setActivePlatform] = useState<'html' | 'woocommerce' | 'shopify' | 'react'>('html');

  // ─── 1. Checkout Widget Code Snippets ───────────────────────────────────────
  const checkoutHtmlSnippet = `<div id="pakpayment-widget"></div>\n<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const checkoutReactCode = `import { useEffect } from "react";

export default function PakPaymentCheckout() {
  useEffect(() => {
    if (document.getElementById("pakpayment-script")) return;
    const s = document.createElement("script");
    s.id = "pakpayment-script";
    s.src = "${appUrl}/widget.js?appId=${appId}&v=${version}";
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  return <div id="pakpayment-widget" />;
}`;

  const checkoutWooSnippet = `<!-- 1. Go to WordPress Admin -> Pages -> Edit your Checkout / Payment page -->
<!-- 2. Add a 'Custom HTML' block and paste: -->
<div id="pakpayment-widget"></div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const checkoutShopifySnippet = `<!-- Paste inside sections/main-cart.liquid or a dedicated checkout page -->
<div id="pakpayment-widget"></div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  // ─── 2. Direct Product Order Button Snippets ───────────────────────────────
  const orderButtonHtmlSnippet = `<!-- Place directly below your "Add to Cart" or "Buy Now" button -->
<div id="pakpayment-order-button"></div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const orderButtonCustomAttrSnippet = `<!-- Custom parameters (optional) for custom web stores -->
<div 
  id="pakpayment-order-button"
  data-product-name="Guess Matrix Watch"
  data-product-price="40500"
  data-product-sku="GW0423G5"
  data-product-qty="1">
</div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const orderButtonWooSnippet = `<!-- WooCommerce: Place inside your Single Product Template or Theme Hooks -->
<!-- Option A: Insert into single-product.php or use hook 'woocommerce_after_add_to_cart_button' -->
<div id="pakpayment-order-button"></div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const orderButtonShopifySnippet = `<!-- Shopify: In sections/main-product.liquid right below the buy buttons block -->
<div id="pakpayment-order-button"></div>
<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>`;

  const orderButtonReactCode = `import { useEffect } from "react";

export default function WhatsAppOrderButton({ productName, price, sku }) {
  useEffect(() => {
    if (document.getElementById("pakpayment-script")) return;
    const s = document.createElement("script");
    s.id = "pakpayment-script";
    s.src = "${appUrl}/widget.js?appId=${appId}&v=${version}";
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div 
      id="pakpayment-order-button"
      data-product-name={productName}
      data-product-price={price}
      data-product-sku={sku}
    />
  );
}`;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Integration & Embed Center</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Add manual zero-custody payments or 1-click WhatsApp order buttons to any store, platform, or framework.
        </p>
      </div>

      {/* Localhost Warning */}
      {isLocalhost && (
        <div className="flex items-start gap-4 p-5 bg-secondary/10 border border-secondary/25 rounded-2xl">
          <AlertTriangle className="text-secondary shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-secondary text-sm mb-1">You are in Local Development Mode</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Your embed code currently points to <code className="bg-black/40 px-1.5 py-0.5 rounded text-secondary font-mono">{appUrl}</code>.
              This address only works on your own computer.
            </p>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              <strong className="text-white">To use on your live store:</strong> Deploy this app (e.g. to Vercel or your hosting) and set{' '}
              <code className="bg-black/40 px-1.5 py-0.5 rounded text-neutral-300 font-mono">NEXT_PUBLIC_APP_URL=https://yourdomain.com</code>.
            </p>
          </div>
        </div>
      )}

      {/* ─── Mode Switcher (Main Tabs) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('checkout')}
          className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'checkout'
              ? 'bg-neutral-900 border-primary shadow-[0_0_25px_rgba(204,255,0,0.15)] ring-1 ring-primary'
              : 'bg-surface border-neutral-800 hover:border-neutral-700 opacity-75 hover:opacity-100'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300">
                Checkout Page
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">1. Full Checkout & Payment Widget</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              For your checkout or payment screen. Displays JazzCash, EasyPaisa & Bank Transfer accounts with TRX verification claim submission.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-xs text-primary font-semibold">
            <span>Container: <code className="text-white font-mono">#pakpayment-widget</code></span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('order_button')}
          className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'order_button'
              ? 'bg-neutral-900 border-green-400 shadow-[0_0_25px_rgba(37,211,102,0.15)] ring-1 ring-green-400'
              : 'bg-surface border-neutral-800 hover:border-neutral-700 opacity-75 hover:opacity-100'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <MessageCircle size={20} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                <Sparkles size={11} /> Product Pages
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">2. "Order through WhatsApp" Button</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Place right below "Add to Cart" on product pages. Automatically grabs product name, price, and link, opening a 1-click WhatsApp order.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-xs text-green-400 font-semibold">
            <span>Container: <code className="text-white font-mono">#pakpayment-order-button</code></span>
          </div>
        </button>
      </div>

      {/* ─── TAB 1: CHECKOUT PAYMENT WIDGET ─── */}
      {activeTab === 'checkout' && (
        <div className="space-y-6">
          {/* Where to put explanation */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <Info size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Where to place the Checkout Widget:</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Place this on the <strong>final payment step</strong>, your <strong>cart checkout page</strong>, or your <strong>order confirmation page</strong>.
                Customers will view your payment accounts, transfer funds in their banking app, and enter their TRX reference ID.
              </p>
            </div>
          </div>

          {/* Platform Selector */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
            {[
              { id: 'html', label: 'Universal HTML / PHP', icon: Globe },
              { id: 'woocommerce', label: 'WordPress & WooCommerce', icon: ShoppingBag },
              { id: 'shopify', label: 'Shopify', icon: Layers },
              { id: 'react', label: 'React / Next.js', icon: FileCode },
            ].map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlatform(p.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activePlatform === p.id
                      ? 'bg-primary text-black shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <Icon size={14} /> {p.label}
                </button>
              );
            })}
          </div>

          {/* Code Box by Platform */}
          {activePlatform === 'html' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Universal HTML Snippet</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Works on any HTML, PHP, Webflow, Wix, or static site</p>
                </div>
                <CopyButton text={checkoutHtmlSnippet} label="Copy Snippet" />
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-primary font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{checkoutHtmlSnippet}
              </pre>
            </div>
          )}

          {activePlatform === 'woocommerce' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">WordPress / WooCommerce Integration</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Step-by-step for WordPress sites</p>
                </div>
                <CopyButton text={checkoutHtmlSnippet} label="Copy Code" />
              </div>
              <div className="space-y-3 text-xs text-neutral-300">
                <p><strong>Step 1:</strong> In your WordPress Admin, go to <em>Pages → Checkout</em> (or your Custom Payment Page).</p>
                <p><strong>Step 2:</strong> Add a <strong>"Custom HTML"</strong> block in the block editor.</p>
                <p><strong>Step 3:</strong> Paste the snippet below and click <strong>Update / Publish</strong>.</p>
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-primary font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{checkoutWooSnippet}
              </pre>
            </div>
          )}

          {activePlatform === 'shopify' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Shopify Liquid Integration</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Custom payment on Shopify</p>
                </div>
                <CopyButton text={checkoutShopifySnippet} label="Copy Shopify Code" />
              </div>
              <div className="space-y-3 text-xs text-neutral-300">
                <p><strong>Step 1:</strong> Go to <em>Online Store → Themes → Actions → Edit code</em>.</p>
                <p><strong>Step 2:</strong> Locate <code className="text-primary font-mono">sections/main-cart.liquid</code> or create a custom payment page template.</p>
                <p><strong>Step 3:</strong> Paste the code where you want the payment widget to appear.</p>
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-primary font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{checkoutShopifySnippet}
              </pre>
            </div>
          )}

          {activePlatform === 'react' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">React / Next.js Component</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">For modern React, Next.js, Vite &amp; Remix apps</p>
                </div>
                <CopyButton text={checkoutReactCode} label="Copy Component" />
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-neutral-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{checkoutReactCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PRODUCT ORDER THROUGH WHATSAPP BUTTON ─── */}
      {activeTab === 'order_button' && (
        <div className="space-y-6">
          {/* Where to put explanation */}
          <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-5 flex items-start gap-4">
            <MessageCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-green-400">Where to place the "Order through WhatsApp" Button:</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Place this snippet on your <strong>single product pages</strong> (directly below or next to your <em>"Add to Cart"</em> or <em>"Buy Now"</em> button).
                Our script automatically reads the product title, price, SKU, and page URL, and formats an instant WhatsApp message for the buyer.
              </p>
            </div>
          </div>

          {/* Platform Selector */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
            {[
              { id: 'html', label: 'Standard Product HTML', icon: Globe },
              { id: 'woocommerce', label: 'WooCommerce Product Page', icon: ShoppingBag },
              { id: 'shopify', label: 'Shopify Product Liquid', icon: Layers },
              { id: 'react', label: 'React / Next.js Store', icon: FileCode },
            ].map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlatform(p.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activePlatform === p.id
                      ? 'bg-green-500 text-black shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <Icon size={14} /> {p.label}
                </button>
              );
            })}
          </div>

          {/* Code Box by Platform */}
          {activePlatform === 'html' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Automatic Auto-Detection Snippet</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Zero config required — auto-detects title, price &amp; link from page</p>
                </div>
                <CopyButton text={orderButtonHtmlSnippet} label="Copy Snippet" />
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{orderButtonHtmlSnippet}
              </pre>

              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-white text-xs">Optional: Custom Data Attributes (For custom product pages)</h5>
                  <CopyButton text={orderButtonCustomAttrSnippet} label="Copy Custom Attributes" />
                </div>
                <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-neutral-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{orderButtonCustomAttrSnippet}
                </pre>
              </div>
            </div>
          )}

          {activePlatform === 'woocommerce' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">WooCommerce Product Page Integration</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Place under "Add to Cart" button</p>
                </div>
                <CopyButton text={orderButtonHtmlSnippet} label="Copy Code" />
              </div>
              <div className="space-y-3 text-xs text-neutral-300">
                <p><strong>Option A (Elementor / Page Builder):</strong> Drag an "HTML" widget directly below the "Add to Cart" button and paste the code.</p>
                <p><strong>Option B (Theme functions.php Hook):</strong> You can hook it to display automatically on all products:</p>
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{`// Add to your child theme's functions.php
add_action('woocommerce_after_add_to_cart_button', function() {
    echo '<div id="pakpayment-order-button" style="margin-top:10px;"></div>' .
         '<script src="${appUrl}/widget.js?appId=${appId}&v=${version}" defer></script>';
});`}
              </pre>
            </div>
          )}

          {activePlatform === 'shopify' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Shopify Product Page (Liquid)</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Add to product buy buttons</p>
                </div>
                <CopyButton text={orderButtonShopifySnippet} label="Copy Code" />
              </div>
              <div className="space-y-3 text-xs text-neutral-300">
                <p><strong>Step 1:</strong> In Shopify Admin, navigate to <em>Online Store → Themes → Edit Code</em>.</p>
                <p><strong>Step 2:</strong> Open <code className="text-green-400 font-mono">sections/main-product.liquid</code> (or <code className="text-green-400 font-mono">snippets/buy-buttons.liquid</code>).</p>
                <p><strong>Step 3:</strong> Paste the code right below the <code className="text-neutral-400 font-mono">{'{{ form | payment_button }}'}</code> or submit button.</p>
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{orderButtonShopifySnippet}
              </pre>
            </div>
          )}

          {activePlatform === 'react' && (
            <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">React / Next.js Product Component</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Pass product props or let it auto-detect</p>
                </div>
                <CopyButton text={orderButtonReactCode} label="Copy Component" />
              </div>
              <pre className="bg-black/90 p-4 rounded-xl border border-neutral-800 text-neutral-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
{orderButtonReactCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── FAQ & Best Practices ─── */}
      <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-white">Frequently Asked Questions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
            <h5 className="font-bold text-white">Can I use both the Checkout Widget &amp; Product Button?</h5>
            <p>Yes! You can put the <em>"Order through WhatsApp"</em> button on individual product pages for quick inquiries, and use the <em>Checkout Widget</em> on your cart/payment page for customers paying via JazzCash/EasyPaisa/Bank Transfer.</p>
          </div>
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
            <h5 className="font-bold text-white">How does WhatsApp opening work?</h5>
            <p>When buyers click either button, WhatsApp opens immediately in a <strong>new tab</strong> without navigating away or closing your website, allowing the customer to keep browsing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
