<div align="center">

<img src="https://raw.githubusercontent.com/pakpayment/assets/main/logo.png" alt="PakPayment Logo" width="90" height="90" onerror="this.src='https://via.placeholder.com/90x90/CCFF00/000000?text=P'" style="border-radius:20px" />

# ⚡ PakPayment

### Free · Open-Source · Zero-Custody Payment Gateway · Built for Pakistan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7%20(Mongoose%20TTL)-green?logo=mongodb)](https://mongodb.com)
[![Zero Custody](https://img.shields.io/badge/Zero%20Custody-100%25%20Direct-CCFF00)](/)
[![Platform Fees](https://img.shields.io/badge/Transaction%20Fees-0%25%20Ever-brightgreen)](/)

**PakPayment is a modern, non-custodial, peer-to-merchant payment gateway infrastructure for Pakistan.**  
Accept direct bank transfers, JazzCash, EasyPaisa, and crypto across **WooCommerce, Shopify, Next.js 16, React (Vite), Webflow, Wix, or custom websites** — with zero merchant gateway fees, zero fund custody, and automated HMAC webhook reconciliation.

[🌟 Star on GitHub](#-star--support-the-project) · [🚀 Live Hosted Gateway](https://pakpayment.vercel.app) · [🛒 WooCommerce Plugin](#-woocommerce-plugin-integration) · [⚡ Next.js 16 Guide](#-nextjs-16-full-stack-integration) · [⚛️ React Vite Guide](#-react-vite-spa-integration)

</div>

---

## 💡 The Core Philosophy: "We Never Touch Your Money"

Traditional payment gateways in emerging markets charge steep transaction cuts (2%–5%), hold merchant payouts for days, and require complicated paperwork or KYC.

**PakPayment reverses this model:**
1. **Zero Fund Custody**: Money flows directly from your customer's banking or mobile wallet app into your own bank account or JazzCash/EasyPaisa wallet.
2. **0% Transaction Fees Forever**: No commissions, no monthly fees, and no per-transaction charges.
3. **Cryptographic Order Integrity**: Order totals are locked on the server via Secret API Keys, preventing client-side price tampering in browser DevTools.
4. **Automated Order Reconciliation**: HMAC-SHA256 signed webhooks automatically update order statuses to *Processing / Paid* in WooCommerce, Shopify, or custom backends upon merchant confirmation.

---

## 💳 Supported Payment Rails

| Payment Rail | Type | Features |
| :--- | :--- | :--- |
| 🏦 **Bank Transfer** | Direct Inter-Bank | Any Pakistani bank via IBAN / Raast |
| 🟠 **JazzCash** | Mobile Financial Services | Pakistan's leading mobile wallet |
| 🟢 **EasyPaisa** | Mobile Financial Services | Telenor digital mobile wallet |
| ₿ **Cryptocurrency** | Decentralized | USDT (TRC-20/ERC-20), BTC, ETH |
| 🏪 **Cash on Counter** | Point of Sale (POS) | Branded, printable fixed or open-amount QR codes |

---

## 🌐 Multi-Platform Integration Ecosystem

PakPayment integrates seamlessly across any modern web stack:

### 1. 🛒 WooCommerce / WordPress
- **Pre-Packaged Plugin**: Ready-to-install `.zip` file downloadable directly from your merchant dashboard (`/downloads/pakpayment-woocommerce.zip`).
- **Zero-Code Setup**: Upload via WP Admin -> Plugins -> Add New -> Upload Plugin.
- **Automated Webhooks**: Automatically moves orders from `Pending Payment` to `Processing` when the merchant marks a claim as verified.

### 2. ⚡ Next.js 16 (Full-Stack App Router)
Next.js 16 handles both backend route handlers and client pages inside a single codebase without external servers:
```text
my-nextjs-app/
├── app/
│   ├── api/checkout/route.ts   <-- Server Route Handler (locks price & protects Secret Key)
│   └── checkout/page.tsx       <-- Client Page ('use client' checkout & widget)
└── .env.local                  <-- Secret Key & App ID stored safely on server
```
- **Secret Key Isolation**: Stored strictly in `.env.local`, never exposed in browser bundles.
- **Race Condition Safeguards**: Double-click lockout with loading spinner and Next `<Script strategy="lazyOnload">`.
- **1-Click Error Recovery**: Non-blocking failure alerts with one-tap retry.

### 3. ⚛️ React (Vite SPA)
- Designed for client-only single-page applications.
- **Security Standard**: Secret Keys are never bundled into Vite assets. Vite components fetch server-locked sessions from an existing API (Node, Laravel, PHP, Python), or use the Public App ID direct embed.
- **StrictMode Safe**: Automatic script deduplication prevents duplicate iframe/script injections during React 18/19 double-invocations.

### 4. 🛍️ Shopify
- Works out of the box via Shopify Custom Manual Payment Methods + Order Status Portal scripts.
- Compatible with modern Shopify checkout flows without transaction fee penalties.

### 5. 🎨 Webflow, Wix & Squarespace
- **Webflow**: 2-line embed element with Shadow DOM styling isolation.
- **Wix & Squarespace**: Direct zero-code button linking to your hosted `/pay/:appId` page with pre-filled query parameters (`?amount=3500&order=ORD-99`).

---

## 🛡️ Database Architecture & Automated Lifecycle (TTL)

To prevent database bloat and comply with privacy best practices, PakPayment enforces strict data lifecycle rules:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PAKPAYMENT MONGODB DATA RETENTION                    │
├───────────────────────────────────┬────────────────────────────────────┤
│   PERMANENT LIFETIME DATA         │   EPHEMERAL AUTO-PURGE DATA (TTL)  │
├───────────────────────────────────┼────────────────────────────────────┤
│ • User Accounts (Auth)            │ • Payment Claims (30 Days TTL)     │
│ • Payment Methods (IBAN/JazzCash) │ • Analytics Views (30 Days TTL)    │
│ • Custom QR Codes                 │ • Webhook Logs (14 Days TTL)       │
│ • Store Brand Configs             │ • Unclaimed Orders (24 Hours TTL)  │
└───────────────────────────────────┴────────────────────────────────────┘
```

- **Permanent Records**: Merchant profiles, bank credentials, custom QR codes, and widget branding remain for a lifetime.
- **Ephemeral Records**: Customer receipts, screenshots, raw impressions, and webhook logs automatically self-purge via MongoDB background TTL threads.

---

## 📡 REST API v1 Overview

### Create Payment Session (Server-Side)
```http
POST /api/v1/orders
Authorization: Bearer pp_sk_live_...
Content-Type: application/json

{
  "orderId": "ORD-10024",
  "amount": 2800,
  "currency": "PKR",
  "customerEmail": "buyer@example.com",
  "redirectUrl": "https://yourstore.com/thank-you"
}
```

### Lookup Session Status
```http
GET /api/v1/orders/:sessionId
Authorization: Bearer pp_sk_live_...
```

### Webhook Event Signature Verification
All webhook dispatches include an HMAC-SHA256 signature in the `X-PakPayment-Signature` header:
```javascript
const crypto = require('crypto');

function verifyWebhook(payloadString, signatureHeader, secret) {
  const [tPart, v1Part] = signatureHeader.split(',');
  const timestamp = tPart.split('=')[1];
  const signature = v1Part.split('=')[1];

  const computed = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payloadString}`)
    .digest('hex');

  return computed === signature;
}
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js 18+** installed
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 2. Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/pakpayment.git
cd pakpayment

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local
```

### 3. Environment Configuration
Open `.env.local` and configure your database and authentication secrets:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/pakpayment
BETTER_AUTH_SECRET=your_32_character_random_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to explore the landing page and merchant dashboard.

---

## 🌟 Star & Support the Project

If PakPayment helps you, your business, or your clients accept direct payments with zero transaction fees, please consider giving it a star on GitHub! ⭐

- ⭐ **Star the Repository**: Helps more freelancers and small businesses discover open-source payments.
- 🍴 **Fork & Contribute**: Submit PRs, report bugs, or add integrations for more eCommerce platforms.
- 📢 **Share with Fellow Sellers**: Spread the word on Twitter/X, LinkedIn, and WhatsApp developer groups.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.  
Completely free to use, modify, self-host, or integrate into commercial client projects.

<div align="center">

Built with ❤️ for Pakistani freelancers, creators, and eCommerce entrepreneurs.

</div>
