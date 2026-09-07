"use client";

import { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Code2,
  Globe,
  ExternalLink,
  ShieldCheck,
  Key,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Terminal,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'woocommerce' | 'shopify' | 'webflow' | 'wix' | 'custom' | 'react' | 'nocode'>('woocommerce');
  const [credentials, setCredentials] = useState<{
    appId: string;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    webhookUrl: string;
    apiEndpoint: string;
    hostedCheckoutBaseUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [backendLang, setBackendLang] = useState<'express' | 'php' | 'laravel' | 'python' | 'curl'>('express');
  const [frontendLang, setFrontendLang] = useState<'html' | 'react' | 'nextjs'>('html');
  const [reactFramework, setReactFramework] = useState<'nextjs' | 'vite'>('nextjs');

  useEffect(() => {
    fetch('/api/merchant/apikeys')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCredentials(data);
        }
      })
      .catch((err) => console.error('Failed to load API keys:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success(`Copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const appId = credentials?.appId || 'pp_app_sample123';
  const secretKey = credentials?.secretKey || 'pp_sk_live_sample456';
  const webhookSecret = credentials?.webhookSecret || 'pp_whsec_sample789';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pakpayment.vercel.app';

  const getBackendCode = (lang: 'express' | 'php' | 'laravel' | 'python' | 'curl') => {
    switch (lang) {
      case 'express':
        return `// server.js (Node.js & Express)
// Install dependencies: npm install express cors
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows frontend to call this endpoint smoothly
app.use(express.json());

// Endpoint called by your frontend when customer clicks "Pay"
app.post('/api/create-payment-session', async (req, res) => {
  try {
    const { orderId, amount, customerEmail } = req.body;

    // Call PakPayment API to lock the order amount and details
    const response = await fetch('${appUrl}/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${secretKey}'
      },
      body: JSON.stringify({
        orderId: orderId || ('ORD-' + Date.now()),
        amount: amount || 2800, // Amount in PKR
        currency: 'PKR',
        customerEmail: customerEmail || 'customer@example.com',
        redirectUrl: 'https://yourstore.com/thank-you'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Return the generated sessionId to your frontend
    res.json({ sessionId: data.sessionId, checkoutUrl: data.checkoutUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));`;

      case 'php':
        return `<?php
// create-order.php (Native PHP)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Read input payload from frontend
$input = json_decode(file_get_contents('php://input'), true);

$payload = [
    'orderId'       => $input['orderId'] ?? ('ORD-' . time()),
    'amount'        => $input['amount'] ?? 2800, // PKR
    'currency'      => 'PKR',
    'customerEmail' => $input['customerEmail'] ?? 'customer@example.com',
    'redirectUrl'   => 'https://yourstore.com/thank-you'
];

// 2. Call PakPayment Order API to lock session
$ch = curl_init('${appUrl}/api/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ${secretKey}'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 3. Return JSON containing sessionId
http_response_code($httpCode);
echo $response;
?>`;

      case 'laravel':
        return `<?php
// app/Http/Controllers/PaymentController.php (Laravel 10 / 11)
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function createSession(Request $request)
    {
        // 1. Calculate price from database or cart
        $orderId = $request->input('orderId', 'ORD-' . time());
        $amount  = $request->input('amount', 2800); // PKR

        // 2. Lock order with PakPayment API using your Secret Key
        $response = Http::withToken('${secretKey}')
            ->post('${appUrl}/api/v1/orders', [
                'orderId'       => $orderId,
                'amount'        => $amount,
                'currency'      => 'PKR',
                'customerEmail' => $request->input('customerEmail', 'customer@example.com'),
                'redirectUrl'   => route('order.success')
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Payment session creation failed'], 400);
        }

        // 3. Return sessionId to frontend
        return response()->json([
            'sessionId'   => $response->json('sessionId'),
            'checkoutUrl' => $response->json('checkoutUrl')
        ]);
    }
}`;

      case 'python':
        return `# app.py (Python / Flask)
# Run: pip install flask flask-cors requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app) # Enables smooth local/remote cross-origin requests

PAK_SECRET_KEY = "${secretKey}"
PAK_API_URL = "${appUrl}/api/v1/orders"

@app.route('/api/create-payment-session', methods=['POST'])
def create_payment_session():
    data = request.get_json() or {}

    payload = {
        "orderId": data.get("orderId", f"ORD-{int(time.time())}"),
        "amount": data.get("amount", 2800), # PKR
        "currency": "PKR",
        "customerEmail": data.get("customerEmail", "customer@example.com"),
        "redirectUrl": "https://yourstore.com/thank-you"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PAK_SECRET_KEY}"
    }

    # Call PakPayment API to generate locked session
    res = requests.post(PAK_API_URL, json=payload, headers=headers)
    return jsonify(res.json()), res.status_code

if __name__ == '__main__':
    app.run(port=5000, debug=True)`;

      case 'curl':
        return `curl -X POST ${appUrl}/api/v1/orders \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${secretKey}" \\
  -d '{
    "orderId": "ORD-9988",
    "amount": 2800,
    "currency": "PKR",
    "customerEmail": "customer@gmail.com",
    "redirectUrl": "https://mystore.com/thankyou"
  }'`;
    }
  };

  const getFrontendCode = (lang: 'html' | 'react' | 'nextjs') => {
    switch (lang) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Checkout Demo</title>
</head>
<body style="background: #09090b; color: #fff; font-family: sans-serif; display: flex; justify-content: center; padding: 40px;">

  <div style="max-width: 520px; width: 100%;">
    <h2>Order Summary</h2>
    <p>Product: Wireless Gaming Headset — <strong>PKR 2,800</strong></p>

    <!-- Pay Button -->
    <button id="pay-btn" onclick="createOrderAndPay()" style="background: #CCFF00; color: #000; font-weight: bold; padding: 14px 20px; border: none; border-radius: 10px; cursor: pointer; width: 100%;">
      ⚡ Pay PKR 2,800 Now
    </button>

    <!-- Container where the PakPayment widget will appear -->
    <div id="checkout-area" style="margin-top: 20px;"></div>
  </div>

  <script>
    async function createOrderAndPay() {
      const btn = document.getElementById('pay-btn');
      btn.innerText = 'Creating Secure Payment Session...';
      btn.disabled = true;

      try {
        // STEP 1: Call your backend (Express, PHP, Python, Laravel)
        // (Or directly ${appUrl}/api/v1/orders for quick testing)
        const response = await fetch('http://localhost:5000/api/create-payment-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: 'ORD-' + Date.now(),
            amount: 2800,
            currency: 'PKR',
            customerEmail: 'customer@example.com'
          })
        });

        const orderData = await response.json();
        if (!orderData.sessionId) {
          throw new Error(orderData.error || orderData.message || 'Failed to create payment session');
        }

        // STEP 2: Embed the widget using the REAL sessionId returned from Step 1
        const container = document.getElementById('checkout-area');
        container.innerHTML = '<div id="pakpayment-widget" data-session="' + orderData.sessionId + '"></div>';

        // Load widget.js
        const script = document.createElement('script');
        script.src = '${appUrl}/widget.js?appId=${appId}';
        document.body.appendChild(script);

        btn.style.display = 'none';
      } catch (err) {
        alert('Checkout error: ' + err.message);
        btn.innerText = '⚡ Pay PKR 2,800 Now';
        btn.disabled = false;
      }
    }
  </script>

</body>
</html>`;

      case 'react':
        return `import React, { useState } from 'react';

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Call your backend server to create the locked session
      const res = await fetch('http://localhost:5000/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'ORD-' + Date.now(),
          amount: 2800,
          currency: 'PKR'
        })
      });

      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);

        // 2. Load widget.js if not already in document
        if (!document.querySelector('script[src*="widget.js"]')) {
          const script = document.createElement('script');
          script.src = '${appUrl}/widget.js?appId=${appId}';
          script.async = true;
          document.body.appendChild(script);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (sessionId) {
    // 3. Mount widget container with sessionId
    return <div id="pakpayment-widget" data-session={sessionId} />;
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#CCFF00] text-black font-bold py-3.5 px-6 rounded-xl hover:brightness-95 transition-all cursor-pointer"
    >
      {loading ? 'Creating Session...' : '⚡ Pay PKR 2,800 Now'}
    </button>
  );
}`;

      case 'nextjs':
        return `'use client';

import { useState } from 'react';
import Script from 'next/script';

export default function NextCheckout() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    try {
      // 1. Call your Next.js Route Handler (/api/checkout) or backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: 'ORD-' + Date.now(), amount: 2800 })
      });
      const data = await res.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      {!sessionId ? (
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full bg-[#CCFF00] text-black font-bold py-3.5 px-6 rounded-xl hover:brightness-95"
        >
          {loading ? 'Creating Session...' : '⚡ Pay PKR 2,800 Now'}
        </button>
      ) : (
        <>
          {/* Mount Widget Container with dynamic sessionId */}
          <div id="pakpayment-widget" data-session={sessionId} />

          {/* Next.js optimized script loading */}
          <Script
            src="${appUrl}/widget.js?appId=${appId}"
            strategy="lazyOnload"
          />
        </>
      )}
    </div>
  );
}`;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Zap size={13} /> Multi-Platform Gateway Hub
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Integrations</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Connect PakPayment to WooCommerce, Shopify, React/Next.js, or custom websites in minutes.
          </p>
        </div>

        <a
          href="/downloads/pakpayment-woocommerce.zip"
          download="pakpayment-woocommerce.zip"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-black font-extrabold text-xs shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:brightness-95 transition-all"
        >
          <Download size={15} /> Download WooCommerce Plugin (.zip)
        </a>
      </div>

      {/* API Credentials Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-primary">
              <Key size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Gateway Credentials</h3>
              <p className="text-xs text-neutral-400">Use these keys to connect your website securely.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {showSecret ? 'Hide Secret Key' : 'Reveal Secret Key'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Public App ID */}
          <div className="bg-black/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">Public App ID</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-neutral-200 truncate">{appId}</code>
              <button
                type="button"
                onClick={() => handleCopy('appId', appId)}
                className="text-neutral-400 hover:text-white shrink-0 p-1"
                title="Copy App ID"
              >
                {copiedKey === 'appId' ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="bg-black/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">Secret API Key</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-neutral-200 truncate">
                {showSecret ? secretKey : '••••••••••••••••••••••••••••••••'}
              </code>
              <button
                type="button"
                onClick={() => handleCopy('secretKey', secretKey)}
                className="text-neutral-400 hover:text-white shrink-0 p-1"
                title="Copy Secret Key"
              >
                {copiedKey === 'secretKey' ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="bg-black/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">Webhook Signing Secret</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-neutral-200 truncate">
                {showSecret ? webhookSecret : '••••••••••••••••••••••••••••••••'}
              </code>
              <button
                type="button"
                onClick={() => handleCopy('webhookSecret', webhookSecret)}
                className="text-neutral-400 hover:text-white shrink-0 p-1"
                title="Copy Webhook Secret"
              >
                {copiedKey === 'webhookSecret' ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcut Banner to Embed Code Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Need 1-Click WhatsApp Order Buttons on Single Product Pages?</h4>
            <p className="text-[11px] text-neutral-400">Place a green order button directly below your &quot;Add to Cart&quot; button to capture instant mobile sales.</p>
          </div>
        </div>
        <a
          href="/dashboard/embed"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors shrink-0"
        >
          Open Embed Studio <ArrowRight size={13} />
        </a>
      </div>

      {/* Platform Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'woocommerce', label: '🛒 WooCommerce / WordPress', badge: 'Plugin Ready' },
          { id: 'shopify', label: '🛍️ Shopify', badge: 'Manual Gateway' },
          { id: 'webflow', label: '🎨 Webflow', badge: 'HTML Embed' },
          { id: 'wix', label: '🔗 Wix & Squarespace', badge: 'Button Link' },
          { id: 'custom', label: '🌐 Custom HTML / JS', badge: 'Universal Script' },
          { id: 'react', label: '⚛️ React & Next.js', badge: 'SDK / Component' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-black/20 text-black' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: WOOCOMMERCE */}
      {activeTab === 'woocommerce' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-neutral-950 via-neutral-900/40 to-neutral-950 border border-neutral-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">WooCommerce Payment Gateway Plugin</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Standard WooCommerce plugin with server-locked checkout & automatic order status sync.
                </p>
              </div>
              <a
                href="/downloads/pakpayment-woocommerce.zip"
                download="pakpayment-woocommerce.zip"
                className="px-5 py-2.5 bg-primary text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:brightness-95 transition-all"
              >
                <Download size={14} /> Download pakpayment-woocommerce.zip
              </a>
            </div>

            {/* Step-by-Step Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Upload & Activate</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  In WordPress Admin, go to <strong>Plugins &gt; Add New &gt; Upload Plugin</strong> and upload the downloaded <code>pakpayment-woocommerce.zip</code>.
                </p>
              </div>

              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">Configure Gateway</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Navigate to <strong>WooCommerce &gt; Settings &gt; Payments &gt; PakPayment</strong>. Enter your <strong>Public App ID</strong> and choose your preferred <strong>Checkout Mode</strong>.
                </p>
              </div>

              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  3
                </div>
                <h4 className="text-xs font-bold text-white">Choose Checkout Mode</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Select <strong>Hosted Portal Redirect</strong> (recommended) or enter your <strong>Direct Accounts</strong> (Bank IBAN, JazzCash, EasyPaisa) to display them directly on the checkout page.
                </p>
              </div>

              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  4
                </div>
                <h4 className="text-xs font-bold text-white">Webhook Sync</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Copy the provided Webhook URL into your <a href="/dashboard/webhooks" className="text-primary hover:underline">Webhooks tab</a>. Orders auto-confirm upon merchant claim approval!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHOPIFY */}
      {activeTab === 'shopify' && (
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Shopify Integration Guide</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Since modern Shopify prohibits untrusted third-party JavaScript scripts on checkout, the industry-standard way to accept direct payments is via Shopify Manual Payment Methods combined with your Hosted Checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Step 1: Add Payment Method in Shopify Admin</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In your Shopify Admin, go to <strong>Settings &gt; Payments &gt; Manual Payment Methods</strong> and click <strong>Add manual payment method</strong> (e.g. <em>Bank Deposit / JazzCash / EasyPaisa</em>).
                </p>
              </div>

              <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Step 2: Customer Checkout Instructions</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In the payment details box, paste your instructions and your hosted checkout link:
                </p>
                <div className="relative bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre-wrap">
{`Please complete your payment via direct Bank Transfer, JazzCash, or EasyPaisa:
👉 Payment Portal: ${appUrl}/pay/${appId}

Enter your Order Number on the payment page to verify your payment.
Zero transaction fees apply.`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy('shopify_instructions', `Please complete your payment via direct Bank Transfer, JazzCash, or EasyPaisa:\n👉 Payment Portal: ${appUrl}/pay/${appId}\nEnter your Order Number on the payment page to verify your payment.`)}
                    className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-white"
                  >
                    {copiedKey === 'shopify_instructions' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Step 3: Order Status Page Automatic Redirection (Optional)</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In Shopify Admin, go to <strong>Settings &gt; Checkout &gt; Order status page additional scripts</strong> and paste this snippet to automatically provide an embedded payment button on the Thank You page:
                </p>
                <div className="relative bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre-wrap">
{`<script>
  if (Shopify.Checkout && Shopify.Checkout.isOrderStatusPage) {
    var orderId = Shopify.checkout.order_id;
    var total = Shopify.checkout.total_price;
    var payUrl = "${appUrl}/pay/${appId}?order=" + encodeURIComponent(orderId) + "&amount=" + encodeURIComponent(total);
    console.log("PakPayment portal:", payUrl);
  }
</script>`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy('shopify_script', `<script>\n  if (Shopify.Checkout && Shopify.Checkout.isOrderStatusPage) {\n    var orderId = Shopify.checkout.order_id;\n    var total = Shopify.checkout.total_price;\n    var payUrl = "${appUrl}/pay/${appId}?order=" + encodeURIComponent(orderId) + "&amount=" + encodeURIComponent(total);\n  }\n</script>`)}
                    className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-white"
                  >
                    {copiedKey === 'shopify_script' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REACT & NEXT.JS */}
      {activeTab === 'react' && (
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">React & Next.js Modern Integration</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Production-grade implementation for <strong>Next.js 16 (Full-Stack App Router)</strong> and <strong>React (Vite Client SPA)</strong>.
                </p>
              </div>

              {/* Sub-framework switcher tabs */}
              <div className="flex p-1 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setReactFramework('nextjs')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    reactFramework === 'nextjs'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>⚡ Next.js 16 (App Router)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReactFramework('vite')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    reactFramework === 'vite'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>⚛️ React (Vite SPA)</span>
                </button>
              </div>
            </div>

            {/* Architecture Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setReactFramework('nextjs')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  reactFramework === 'nextjs'
                    ? 'bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(204,255,0,0.08)]'
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>⚡</span> Next.js 16 (App Router)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                    Full-Stack • No Express Needed
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                  Next.js handles server and client in one codebase. Secret keys stay protected inside Server Route Handlers (<code className="text-neutral-300">app/api/...</code>). Prices are locked server-side, immune to client tampering.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-emerald-400">✔ Server Route Handlers</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-emerald-400">✔ Secret Key Isolation</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-emerald-400">✔ &lt;Script&gt; Optimized</span>
                </div>
              </div>

              <div
                onClick={() => setReactFramework('vite')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  reactFramework === 'vite'
                    ? 'bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>⚛️</span> React (Vite SPA)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                    Client SPA • Browser Execution
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                  Vite compiles to pure client-side static assets. Never expose Secret Keys in Vite bundles. Vite apps communicate with your existing backend (Node, PHP, Python, or Laravel) to fetch locked session IDs.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-cyan-400">✔ Race Condition Guards</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-cyan-400">✔ Double-Click Protected</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-cyan-400">✔ Full Error Recovery</span>
                </div>
              </div>
            </div>

            {/* Enterprise Engineering Guarantees Bar */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <span className="font-bold text-white block">Zero Race Conditions</span>
                  <span className="text-[11px] text-neutral-400 leading-tight">Double-click locks &amp; script deduplication prevent duplicate order calls.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={14} />
                </div>
                <div>
                  <span className="font-bold text-white block">Zero UI Blockage</span>
                  <span className="text-[11px] text-neutral-400 leading-tight">Async non-blocking state with animated progress spinners.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="font-bold text-white block">1-Click Error Recovery</span>
                  <span className="text-[11px] text-neutral-400 leading-tight">Instant inline alert banner with one-tap retry without page reload.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Key size={14} />
                </div>
                <div>
                  <span className="font-bold text-white block">Zero Secret Key Leak</span>
                  <span className="text-[11px] text-neutral-400 leading-tight">Secret keys never touch client bundles or Vite build outputs.</span>
                </div>
              </div>
            </div>

            {/* NEXT.JS 16 APP ROUTER SECTION */}
            {reactFramework === 'nextjs' && (
              <div className="space-y-6 animate-fade-in">
                {/* File Tree Visualization */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    Project Folder Structure
                  </span>
                  <div className="bg-black/80 p-3.5 rounded-xl border border-neutral-800/80 font-mono text-xs text-neutral-300 space-y-1">
                    <p className="text-neutral-500">my-nextjs-app/</p>
                    <p className="text-neutral-400">├── app/</p>
                    <p className="text-neutral-300">│   ├── api/checkout/<strong className="text-primary">route.ts</strong> <span className="text-neutral-500">// 1. Server Route Handler (locks price & protects Secret Key)</span></p>
                    <p className="text-neutral-300">│   └── checkout/<strong className="text-primary">page.tsx</strong> <span className="text-neutral-500">// 2. Client Page ('use client' checkout & widget)</span></p>
                    <p className="text-neutral-300">└── <strong className="text-yellow-400">.env.local</strong> <span className="text-neutral-500">// 3. Private environment variables (Server-only)</span></p>
                  </div>
                </div>

                {/* Step 1: .env.local */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">1</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Save Credentials in .env.local
                    </span>
                  </div>
                  <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto">
{`# .env.local (Safe on server — never committed to Git!)
PAKPAYMENT_SECRET_KEY=${secretKey}
PAKPAYMENT_APP_ID=${appId}
NEXT_PUBLIC_PAKPAYMENT_URL=${appUrl}`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy('next_env', `PAKPAYMENT_SECRET_KEY=${secretKey}\nPAKPAYMENT_APP_ID=${appId}\nNEXT_PUBLIC_PAKPAYMENT_URL=${appUrl}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy .env.local"
                    >
                      {copiedKey === 'next_env' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Step 2: app/api/checkout/route.ts */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">2</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Server Route Handler (app/api/checkout/route.ts)
                    </span>
                  </div>
                  <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[380px]">
{`// app/api/checkout/route.ts (Next.js 16 App Router)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { items, customerEmail } = await req.json();

    // 1. Calculate order total securely on server (never trust client prices!)
    const orderTotal = 2800; // PKR (e.g. calculated from database or cart)
    const orderId = 'ORD-' + Date.now();

    // 2. Call PakPayment API using server-side Secret Key
    const response = await fetch('${appUrl}/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.PAKPAYMENT_SECRET_KEY || '${secretKey}'),
      },
      body: JSON.stringify({
        orderId,
        amount: orderTotal,
        currency: 'PKR',
        customerEmail: customerEmail || 'customer@example.com',
        redirectUrl: 'https://yourdomain.com/thank-you',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to create payment session' }, { status: response.status });
    }

    // 3. Return the generated sessionId to client
    return NextResponse.json({
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy('next_route_code', `// app/api/checkout/route.ts (Next.js 16 App Router)\nimport { NextResponse } from 'next/server';\n\nexport async function POST(req: Request) {\n  try {\n    const { customerEmail } = await req.json();\n    const orderTotal = 2800;\n    const orderId = 'ORD-' + Date.now();\n\n    const response = await fetch('${appUrl}/api/v1/orders', {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json',\n        'Authorization': 'Bearer ' + (process.env.PAKPAYMENT_SECRET_KEY || '${secretKey}'),\n      },\n      body: JSON.stringify({\n        orderId,\n        amount: orderTotal,\n        currency: 'PKR',\n        customerEmail: customerEmail || 'customer@example.com',\n        redirectUrl: 'https://yourdomain.com/thank-you',\n      }),\n    });\n\n    const data = await response.json();\n    if (!response.ok) {\n      return NextResponse.json({ error: data.error || 'Failed to create payment session' }, { status: response.status });\n    }\n\n    return NextResponse.json({\n      sessionId: data.sessionId,\n      checkoutUrl: data.checkoutUrl,\n    });\n  } catch (err: any) {\n    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });\n  }\n}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy Route Handler"
                    >
                      {copiedKey === 'next_route_code' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Step 3: app/checkout/page.tsx */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">3</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Client Checkout Page (app/checkout/page.tsx)
                    </span>
                  </div>
                  <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[420px]">
{`'use client';

import { useState } from 'react';
import Script from 'next/script';

export default function CheckoutPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCheckout = async () => {
    // Prevent race conditions on rapid double clicks
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      // 1. Call Next.js Server Route Handler (server-side price security)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: 'buyer@example.com' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment session');

      // 2. Set returned sessionId to mount payment widget
      setSessionId(data.sessionId);
      setStatus('ready');

      // 3. Trigger widget initialization safely if script already executed
      if (typeof window !== 'undefined' && (window as any).PakPayment?.init) {
        (window as any).PakPayment.init();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment service unreachable');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Order Checkout</h2>
        <p className="text-xs text-neutral-400 mb-6">Wireless Gaming Headset — PKR 2,800</p>

        {/* Error Alert with 1-Click Retry */}
        {status === 'error' && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center justify-between gap-3">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={startCheckout}
              className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-bold text-[11px] shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Action Button: Disabled during loading to prevent race conditions */}
        {status !== 'ready' ? (
          <button
            onClick={startCheckout}
            disabled={status === 'loading'}
            className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-extrabold text-sm hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Securing Order Session...</span>
              </>
            ) : (
              <span>⚡ Pay PKR 2,800 Now</span>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* The PakPayment widget container rendered with locked session */}
            <div id="pakpayment-widget" data-session={sessionId} />

            {/* Next.js optimized script tag */}
            <Script
              src="${appUrl}/widget.js?appId=${appId}"
              strategy="lazyOnload"
              onLoad={() => {
                if ((window as any).PakPayment?.init) {
                  (window as any).PakPayment.init();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy('next_page_code', `'use client';\n\nimport { useState } from 'react';\nimport Script from 'next/script';\n\nexport default function CheckoutPage() {\n  const [sessionId, setSessionId] = useState<string | null>(null);\n  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');\n  const [errorMessage, setErrorMessage] = useState<string | null>(null);\n\n  const startCheckout = async () => {\n    if (status === 'loading') return;\n    setStatus('loading');\n    setErrorMessage(null);\n    try {\n      const res = await fetch('/api/checkout', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ customerEmail: 'buyer@example.com' }),\n      });\n      const data = await res.json();\n      if (!res.ok) throw new Error(data.error || 'Failed to create payment session');\n      setSessionId(data.sessionId);\n      setStatus('ready');\n      if (typeof window !== 'undefined' && (window as any).PakPayment?.init) {\n        (window as any).PakPayment.init();\n      }\n    } catch (err: any) {\n      setErrorMessage(err.message || 'Payment service unreachable');\n      setStatus('error');\n    }\n  };\n\n  return (\n    <div className="max-w-lg mx-auto py-12 px-4">\n      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">\n        <h2 className="text-lg font-bold text-white mb-1">Order Checkout</h2>\n        <p className="text-xs text-neutral-400 mb-6">Wireless Gaming Headset — PKR 2,800</p>\n        {status === 'error' && (\n          <div className="p-3.5 mb-4 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center justify-between gap-3">\n            <span>⚠️ {errorMessage}</span>\n            <button onClick={startCheckout} className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-bold text-[11px] shrink-0">Retry</button>\n          </div>\n        )}\n        {status !== 'ready' ? (\n          <button onClick={startCheckout} disabled={status === 'loading'} className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-extrabold text-sm hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">\n            {status === 'loading' ? <span>Securing Order Session...</span> : <span>⚡ Pay PKR 2,800 Now</span>}\n          </button>\n        ) : (\n          <div className="space-y-4">\n            <div id="pakpayment-widget" data-session={sessionId} />\n            <Script src="${appUrl}/widget.js?appId=${appId}" strategy="lazyOnload" onLoad={() => { if ((window as any).PakPayment?.init) (window as any).PakPayment.init(); }} />\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy Checkout Page"
                    >
                      {copiedKey === 'next_page_code' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REACT (VITE SPA) SECTION */}
            {reactFramework === 'vite' && (
              <div className="space-y-6 animate-fade-in">
                {/* File Tree Visualization */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    Vite Project Folder Structure
                  </span>
                  <div className="bg-black/80 p-3.5 rounded-xl border border-neutral-800/80 font-mono text-xs text-neutral-300 space-y-1">
                    <p className="text-neutral-500">my-vite-react-app/</p>
                    <p className="text-neutral-400">├── src/</p>
                    <p className="text-neutral-300">│   ├── components/<strong className="text-primary">PakPaymentCheckout.jsx</strong> <span className="text-neutral-500">// 1. Reusable Checkout Component</span></p>
                    <p className="text-neutral-300">│   └── <strong className="text-primary">App.jsx</strong> <span className="text-neutral-500">// 2. Your Product or Checkout Page</span></p>
                    <p className="text-neutral-300">└── <strong className="text-neutral-400">index.html</strong> <span className="text-neutral-500">// 3. Vite HTML template</span></p>
                  </div>
                </div>

                {/* Step 1: src/components/PakPaymentCheckout.jsx */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">1</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Create Component (src/components/PakPaymentCheckout.jsx)
                    </span>
                  </div>
                  <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[420px]">
{`// src/components/PakPaymentCheckout.jsx
import React, { useState } from 'react';

export default function PakPaymentCheckout({ amount = 2800, orderId = 'ORD-1001' }) {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  const startCheckout = async () => {
    // Prevent duplicate calls on double click
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      // 1. Call your backend server (Express, PHP, Laravel, Python) to lock order
      // (Or call '${appUrl}/api/v1/orders' directly during initial testing)
      const res = await fetch('http://localhost:5000/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency: 'PKR' })
      });

      const data = await res.json();
      if (!data.sessionId) throw new Error(data.error || 'Failed to initialize payment');

      setSessionId(data.sessionId);
      setStatus('ready');

      // 2. Race-condition safe script injection: only inject once
      if (!document.querySelector('script[src*="widget.js"]')) {
        const script = document.createElement('script');
        script.src = '${appUrl}/widget.js?appId=${appId}';
        script.async = true;
        document.body.appendChild(script);
      } else if (window.PakPayment?.init) {
        window.PakPayment.init();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment session failed');
      setStatus('error');
    }
  };

  if (status === 'ready' && sessionId) {
    return (
      <div className="pakpayment-mount-area mt-4">
        <div id="pakpayment-widget" data-session={sessionId}></div>
      </div>
    );
  }

  return (
    <div className="checkout-widget-container max-w-md mx-auto">
      {status === 'error' && (
        <div style={{ padding: '10px 14px', marginBottom: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMessage}</span>
          <button onClick={startCheckout} style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
            Retry
          </button>
        </div>
      )}

      <button
        onClick={startCheckout}
        disabled={status === 'loading'}
        style={{
          background: '#CCFF00',
          color: '#000',
          fontWeight: 'bold',
          padding: '14px 20px',
          border: 'none',
          borderRadius: '12px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
          width: '100%',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {status === 'loading' ? 'Securing Session...' : '⚡ Pay PKR ' + amount.toLocaleString() + ' Now'}
      </button>
    </div>
  );
}`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy('vite_comp_code', `// src/components/PakPaymentCheckout.jsx\nimport React, { useState } from 'react';\n\nexport default function PakPaymentCheckout({ amount = 2800, orderId = 'ORD-1001' }) {\n  const [sessionId, setSessionId] = useState(null);\n  const [status, setStatus] = useState('idle');\n  const [errorMessage, setErrorMessage] = useState(null);\n\n  const startCheckout = async () => {\n    if (status === 'loading') return;\n    setStatus('loading');\n    setErrorMessage(null);\n    try {\n      const res = await fetch('http://localhost:5000/api/create-payment-session', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ orderId, amount, currency: 'PKR' })\n      });\n      const data = await res.json();\n      if (!data.sessionId) throw new Error(data.error || 'Failed to initialize payment');\n      setSessionId(data.sessionId);\n      setStatus('ready');\n      if (!document.querySelector('script[src*="widget.js"]')) {\n        const script = document.createElement('script');\n        script.src = '${appUrl}/widget.js?appId=${appId}';\n        script.async = true;\n        document.body.appendChild(script);\n      } else if (window.PakPayment?.init) {\n        window.PakPayment.init();\n      }\n    } catch (err) {\n      setErrorMessage(err.message || 'Payment session failed');\n      setStatus('error');\n    }\n  };\n\n  if (status === 'ready' && sessionId) {\n    return (\n      <div className="pakpayment-mount-area mt-4">\n        <div id="pakpayment-widget" data-session={sessionId}></div>\n      </div>\n    );\n  }\n\n  return (\n    <div className="checkout-widget-container max-w-md mx-auto">\n      {status === 'error' && (\n        <div style={{ padding: '10px 14px', marginBottom: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n          <span>⚠️ {errorMessage}</span>\n          <button onClick={startCheckout} style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Retry</button>\n        </div>\n      )}\n      <button onClick={startCheckout} disabled={status === 'loading'} style={{ background: '#CCFF00', color: '#000', fontWeight: 'bold', padding: '14px 20px', border: 'none', borderRadius: '12px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.6 : 1, width: '100%', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>\n        {status === 'loading' ? 'Securing Session...' : '⚡ Pay PKR ' + amount.toLocaleString() + ' Now'}\n      </button>\n    </div>\n  );\n}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy Vite Component"
                    >
                      {copiedKey === 'vite_comp_code' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Step 2: src/App.jsx */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">2</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Use in Your App (src/App.jsx)
                    </span>
                  </div>
                  <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[350px]">
{`// src/App.jsx
import React from 'react';
import PakPaymentCheckout from './components/PakPaymentCheckout';

export default function App() {
  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Wireless Gaming Headset</h1>
      <p style={{ color: '#888' }}>Price: PKR 2,800</p>

      {/* Render the payment checkout component */}
      <PakPaymentCheckout amount={2800} orderId="ORD-2026-99" />
    </div>
  );
}`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy('vite_app_code', `// src/App.jsx\nimport React from 'react';\nimport PakPaymentCheckout from './components/PakPaymentCheckout';\n\nexport default function App() {\n  return (\n    <div style={{ maxWidth: '480px', margin: '40px auto', fontFamily: 'sans-serif' }}>\n      <h1>Wireless Gaming Headset</h1>\n      <p style={{ color: '#888' }}>Price: PKR 2,800</p>\n      <PakPaymentCheckout amount={2800} orderId="ORD-2026-99" />\n    </div>\n  );\n}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Copy App.jsx"
                    >
                      {copiedKey === 'vite_app_code' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CUSTOM HTML / JS */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Custom HTML & JavaScript Integration</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Embed your direct payment gateway into any raw HTML page, custom website, or CMS.
              </p>
            </div>

            {/* Option A: Quick 2-Line Embed */}
            <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                    Option A: Quick 2-Line Embed (Super Simple • No Backend Needed)
                  </span>
                  <p className="text-xs text-neutral-400 mt-1">
                    Just copy and paste these 2 lines into any HTML file. It will automatically load your active payment accounts and theme.
                  </p>
                </div>
                <a
                  href="/demo-simple.html"
                  target="_blank"
                  className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 font-semibold transition-colors shrink-0"
                >
                  View Live Demo ↗
                </a>
              </div>

              <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto">
{`<!-- 1. Place this div where you want the payment widget to appear -->
<div id="pakpayment-widget"></div>

<!-- 2. Include the widget script with your App ID -->
<script src="${appUrl}/widget.js?appId=${appId}"></script>`}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy('simple_embed_snippet', `<div id="pakpayment-widget"></div>\n<script src="${appUrl}/widget.js?appId=${appId}"></script>`)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Copy Code"
                >
                  {copiedKey === 'simple_embed_snippet' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Option B: Server-Locked REST API Session */}
            <div className="p-5 bg-black/50 border border-neutral-800 rounded-2xl space-y-6">
              <div>
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Option B: Server-Locked Session (Production Architecture)
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  Locks the exact order amount on your backend server so customers cannot manipulate pricing in the browser.
                </p>
              </div>

              {/* Step 1: Backend Server */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">1</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Your Server Creates Order via API
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Select your backend stack:
                  </span>
                </div>

                {/* Backend Language Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  {[
                    { id: 'express', label: 'Express (Node.js)' },
                    { id: 'php', label: 'PHP (Native)' },
                    { id: 'laravel', label: 'Laravel (PHP)' },
                    { id: 'python', label: 'Python (Flask)' },
                    { id: 'curl', label: 'cURL (Terminal)' },
                  ].map((tab) => {
                    const isActive = backendLang === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBackendLang(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-black font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Backend Code Viewer */}
                <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[380px]">
                    {getBackendCode(backendLang)}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(`backend_${backendLang}`, getBackendCode(backendLang))}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copy backend code"
                  >
                    {copiedKey === `backend_${backendLang}` ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Step 2: Frontend Client */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">2</div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Frontend Renders Widget with Returned Session ID
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Select your frontend framework:
                  </span>
                </div>

                {/* Frontend Framework Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  {[
                    { id: 'html', label: 'HTML / Vanilla JS' },
                    { id: 'react', label: 'React' },
                    { id: 'nextjs', label: 'Next.js' },
                  ].map((tab) => {
                    const isActive = frontendLang === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFrontendLang(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-black font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Frontend Code Viewer */}
                <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-[380px]">
                    {getFrontendCode(frontendLang)}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(`frontend_${frontendLang}`, getFrontendCode(frontendLang))}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copy frontend code"
                  >
                    {copiedKey === `frontend_${frontendLang}` ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBFLOW */}
      {activeTab === 'webflow' && (
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Webflow Integration Guide</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Embed your zero-custody PakPayment checkout directly onto any Webflow page using an HTML Embed component.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Add Embed Element</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  In Webflow Designer, open your page, click <strong>+ (Add Elements)</strong>, scroll down to <strong>Advanced</strong>, and drag an <strong>Embed</strong> component onto your canvas.
                </p>
              </div>

              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">Paste Widget Code</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Paste the snippet below into the HTML Embed editor and click <strong>Save &amp; Close</strong>.
                </p>
              </div>

              <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  3
                </div>
                <h4 className="text-xs font-bold text-white">Publish Site</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Click <strong>Publish</strong> in Webflow. Custom code executes on the live site and loads your payment methods with Shadow DOM isolation!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                Webflow HTML Embed Code Snippet:
              </span>
              <div className="relative bg-black p-4 rounded-xl border border-neutral-800">
                <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto">
{`<div id="pakpayment-widget"></div>
<script src="${appUrl}/widget.js?appId=${appId}" defer></script>`}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy('webflow_snippet', `<div id="pakpayment-widget"></div>\n<script src="${appUrl}/widget.js?appId=${appId}" defer></script>`)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Copy Code"
                >
                  {copiedKey === 'webflow_snippet' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                Note: Webflow requires an active Site Plan (Core, Growth, or CMS) to enable custom code embeds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WIX & SQUARESPACE */}
      {(activeTab === 'wix' || activeTab === 'nocode') && (
        <div className="space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Wix &amp; Squarespace Integration Guide</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Zero coding required. Simply link a &quot;Pay via Bank / JazzCash / EasyPaisa&quot; button directly to your hosted payment page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Step 1: Add a Button</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In Wix Studio or Squarespace Editor, add a button on your pricing, consultation, or product page. Label it: <strong>&quot;Pay via Bank Transfer / JazzCash&quot;</strong>.
                </p>
              </div>

              <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Step 2: Set Button Link</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Set the button link to open your hosted checkout URL in a new window or current tab.
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                Your Direct Hosted Payment Link:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${appUrl}/pay/${appId}`}
                  className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('hosted_link', `${appUrl}/pay/${appId}`)}
                  className="px-4 py-2.5 bg-primary text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:brightness-95 transition-all"
                >
                  {copiedKey === 'hosted_link' ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
                <a
                  href={`/pay/${appId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-lg space-y-1">
                <p className="text-xs font-bold text-white">💡 Pro Tip: Pre-fill Amount and Order Notes</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  You can pass query parameters so the customer does not have to enter the amount manually:<br />
                  <code className="text-primary font-mono">{appUrl}/pay/{appId}?amount=3500&amp;order=Course-Fee</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
