<div align="center">

# ⚡ PakPayment

### The Modern, Non-Custodial Direct Payment Gateway & Infrastructure for Pakistan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7%20(Multi--Tenant)-green?logo=mongodb)](https://mongodb.com)
[![Custody](https://img.shields.io/badge/Custody-0%25%20Non--Custodial-C5F82A)](/)
[![Platform Fees](https://img.shields.io/badge/Platform%20Fees-0%25%20Forever-brightgreen)](/)

**PakPayment** solves the biggest barrier in Pakistani digital commerce: high intermediary gateway cuts (2%–5%), frozen payouts, and complicated merchant onboarding. Collect direct bank transfers (Raast / IBAN), JazzCash, EasyPaisa, and crypto directly into your own personal or business account with **zero middlemen**, **zero platform fees**, and **automated order reconciliation**.

---

[🚀 Quick Start](#-quickstart--local-development) · [👤 For Non-Technical Merchants](#-for-non-technical-merchants--business-owners) · [💻 For Developers](#-for-developers--system-architects) · [🗄️ Database Architecture](#-database-architecture--multi-tenancy) · [📡 API & Webhooks](#-rest-api-v1-reference)

---

</div>

## 📑 Table of Contents
1. [What is PakPayment?](#-what-is-pakpayment)
2. [👤 For Non-Technical Merchants & Business Owners (Plain English)](#-for-non-technical-merchants--business-owners)
3. [💻 For Developers & System Architects](#-for-developers--system-architects)
4. [🗄️ Database Architecture & Multi-Tenancy (How Data is Stored)](#-database-architecture--multi-tenancy)
5. [💳 Supported Payment Rails](#-supported-payment-rails)
6. [🔌 Integration Methods](#-integration-methods)
7. [📡 REST API v1 Reference & Webhooks](#-rest-api-v1-reference)
8. [⚙️ Environment Variables Explained](#-environment-variables-reference)
9. [🚀 Quickstart & Local Development](#-quickstart--local-development)
10. [❓ Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
11. [📄 License & Credits](#-license--credits)

---

## 🌟 What is PakPayment?

Traditional payment gateways (Stripe, Paymob, Safepay, etc.) act as financial middlemen:
* They charge 2% to 4% per transaction + sales tax.
* They hold your funds for days or weeks before depositing them.
* They require corporate registration, tax certificates, and lengthy verification.

**PakPayment reverses this entire model:**
* **Money moves directly**: When a customer buys something, they transfer money straight into **your** JazzCash, EasyPaisa, or Bank IBAN.
* **We never touch your money**: PakPayment does not hold customer funds, meaning **zero risk of frozen balances**.
* **Zero commission**: You keep 100% of your earnings. No platform cut, ever.
* **Automated store updates**: An easy verification dashboard + automated HMAC webhooks automatically update your store orders (WooCommerce, Shopify, custom apps) the moment you verify the payment.

---

## 🎯 Two Ways to Use PakPayment (With or Without a Website)

PakPayment is specifically designed to eliminate the need for a developer or a website, while still offering enterprise-grade APIs for businesses that have one:

| Scenario | Where You Can Use It | How It Resolves Your Problem |
| :--- | :--- | :--- |
| 🌐 **OPTION 1:<br>"I Have an Online Website or Store"** | • **WooCommerce / WordPress**: Pre-built 1-click plugin zip.<br>• **Shopify**: Manual payment instructions + order status script.<br>• **Custom HTML / PHP**: 2-line embed script (`widget.js`).<br>• **Next.js & React**: Headless `<PakPaymentCheckout />` SDK. | • Eliminates 2%–4% gateway cuts.<br>• Eliminates hold periods on payouts.<br>• Webhook automatically transitions store orders to **Paid** upon merchant claim approval. |
| 📱 **OPTION 2:<br>"I Do NOT Have a Website"** | • **Instagram / TikTok**: Paste `/pay/your-id` in your bio.<br>• **WhatsApp DM Orders**: Send checkout links in customer chats.<br>• **Invoices & Quotes**: Include payment links on PDF invoices.<br>• **Physical Shops & Stalls**: Printable high-resolution QR standees for cash counters. | • **Zero hosting or website needed** — we host your secure, mobile-optimized checkout portal for you.<br>• **Zero database setup** — all records are safely organized in your dashboard.<br>• Customers send money directly to your JazzCash or Bank, and send proof via WhatsApp with 1 tap. |

---

## 👤 For Non-Technical Merchants & Business Owners

> **If you run an online store, Instagram shop, freelance service, or retail counter, you do NOT need any programming or database experience to use PakPayment.**

### How You Use PakPayment in 3 Simple Steps:

#### Step 1: Create an Account
1. Open the website and click **Create Account**.
2. Enter your email and choose a password. That's it! No corporate paperwork, no bank merchant application, no setup fee.

#### Step 2: Add Your Payment Accounts
1. In your Merchant Dashboard, go to **Payment Accounts**.
2. Click **Add Payment Method** and enter whatever accounts you use to receive money:
   * **JazzCash Mobile Account** (e.g., `0333-1234567`)
   * **EasyPaisa Account**
   * **Bank Account IBAN / Raast ID** (e.g., Meezan, HBL, Bank Alfalah, etc.)
   * **Crypto Wallet** (e.g., USDT TRC-20) if you do international business.

#### Step 3: Start Getting Paid!
You have multiple ways to share your payment system:
* **Instagram / WhatsApp Sellers**: Every merchant gets their own dedicated link (e.g., `https://your-domain.com/pay/YOUR_ID`). Put this link in your Instagram bio or send it directly to customers in WhatsApp chats.
* **Physical Shops & Stalls**: Go to **QR Generator** in your dashboard, download your branded payment QR code, print it, and place it on your cashier desk.
* **WordPress / WooCommerce Store Owners**: Download the ready-made plugin with one click from your dashboard, upload it to your WordPress site, and your checkout is live immediately!

### How Does an Order Get Verified?
1. The customer selects your payment method (e.g., JazzCash) and transfers money to your number.
2. The customer enters their transaction ID (TRX ID) on the checkout screen and taps **Submit Claim**.
3. You receive an **instant email notification** and a new entry in your **Payment Claims** dashboard.
4. Open your banking app to see if the money arrived.
5. Click **Confirm** in your dashboard. Your customer receives a receipt email, and your online store order automatically marks itself as **Paid / Processing**!

---

## 💻 For Developers & System Architects

For developers self-hosting PakPayment or building custom storefront integrations, PakPayment provides a modern, full-stack Next.js 16 (Turbopack) architecture.

### Architectural Diagram

```
┌─────────────────────────┐          1. POST /api/v1/orders          ┌──────────────────────────┐
│   E-Commerce Backend    │ ───────────────────────────────────────> │    PakPayment Engine     │
│ (WooCommerce / Next.js) │ <─────────────────────────────────────── │ (Generates sealed session│
└─────────────────────────┘          2. Returns sessionId            └──────────────────────────┘
             │                                                                     │
             │ 3. Mounts Widget / Redirects to /pay/:appId                         │
             v                                                                     │
┌─────────────────────────┐       4. Direct Peer-to-Merchant Transfer ┌──────────────────────────┐
│        Customer         │ ────────────────────────────────────────> │  Merchant Bank / Wallet  │
│  (Banking/Wallet App)   │                                           │ (Funds Arrive Instantly) │
└─────────────────────────┘                                           └──────────────────────────┘
             │                                                                     │
             │ 5. Customer submits TRX ID proof                                    │
             v                                                                     │
┌─────────────────────────┐         6. One-Click Approval            ┌──────────────────────────┐
│    Claims Ledger &      │ ───────────────────────────────────────> │   HMAC-SHA256 Webhook    │
│   Merchant Dashboard    │                                           │  Dispatches to Store!    │
└─────────────────────────┘                                           └──────────────────────────┘
```

### Key Technical Guarantees:
1. **Server-Side Order Sealing**: Order amounts are encrypted and stored in `PaymentOrder` via the authenticated `POST /api/v1/orders` endpoint. Buyers cannot tamper with invoice amounts in client-side dev tools.
2. **HMAC-SHA256 Webhook Signatures**: All outbound webhook payloads are cryptographically signed using your secret key via the `X-PakPayment-Signature` header (`t={timestamp},v1={hash}`).
3. **Standalone Embed Engine**: Bundled in 50ms via `esbuild` into [`public/widget.js`](file:///c:/Users/anzamuneebkhan/Desktop/Office_Offline_Work/pak_payment_2026/pak_payment/public/widget.js). Can be injected into any web framework.
4. **React & Next.js SDK**: Exportable client component [`<PakPaymentCheckout />`](file:///c:/Users/anzamuneebkhan/Desktop/Office_Offline_Work/pak_payment_2026/pak_payment/src/widget/react/PakPaymentCheckout.tsx) for headless storefronts.

---

## 🗄️ Database Architecture & Multi-Tenancy

A common question is: **"Whose database is this? Does each merchant need their own database?"**

### 1. Central Platform Database (Hosted by Platform Owner)
* When you deploy PakPayment (on Vercel, Node.js VPS, or Docker), you connect **one single central MongoDB database** via `MONGODB_URI` in `.env.local` (e.g., a free or dedicated cluster on MongoDB Atlas).
* **All data across the entire platform lives in this central database**.
* Merchants who sign up on your site **never touch a database**. They just create an account. The platform handles all storage automatically as a multi-tenant Software-as-a-Service (SaaS).

### 2. Multi-Tenant Data Isolation
Every document in MongoDB is strictly partitioned by the merchant's authenticated credentials:
* **Account Creation**: Generates a unique `userId` and a public `appId` (e.g. `SsiGgDonU6p6`).
* **Session Enforcement**: Every backend API route validates the session cookie and scopes queries to `{ userId: session.user.id }`.
* **Zero Cross-Talk**: Merchant A can only see their own accounts, claims, and logs. Merchant B can only see theirs.

### 3. Overview of Collections in MongoDB
| Collection | What It Stores | Scoped By |
| :--- | :--- | :--- |
| `user` & `account` | Registered merchant profiles, emails, hashed passwords | Better-Auth Identity |
| `merchantpaymentmethods` | Bank IBANs, JazzCash accounts, EasyPaisa numbers, Crypto addresses | `userId` |
| `merchantwidgetconfigs` | Store name, brand colors, live webhook endpoint URL, signing secret | `userId`, `appId` |
| `paymentorders` | Sealed payment sessions created by your e-commerce backend | `appId`, `sessionId` |
| `paymentclaims` | Buyer transfer receipts, TRX IDs, sender names, verification status | `appId`, `userId` |
| `widgetevents` | Widget impressions, clicks, conversion analytics | `appId` |
| `webhooklogs` | Outbound HTTP dispatch logs, payload histories, response codes | `userId` |

### 4. Non-Custodial Security: Data vs Money
* **The Data**: Stored safely in your central MongoDB (receipt codes, customer email, order reference).
* **The Money**: Transferred directly peer-to-peer into the merchant's personal bank or mobile wallet. The platform database never holds or moves financial funds.

---

## 💳 Supported Payment Rails

| Rail | Channel Type | Capabilities |
| :--- | :--- | :--- |
| 🏦 **Bank Transfer** | Inter-Bank (IBAN / Raast) | Instant direct deposits across all Pakistani 1Link banks (Meezan, HBL, Alfalah, Standard Chartered, etc.) |
| 🟠 **JazzCash** | Mobile Financial Services (MFS) | Direct mobile account transfer to 03xx numbers |
| 🟢 **EasyPaisa** | Mobile Financial Services (MFS) | Telenor digital mobile wallet transfers |
| ₿ **Cryptocurrency** | Decentralized Crypto | USDT (TRC-20, ERC-20), Bitcoin (BTC), and Ethereum (ETH) |
| 🏪 **Cash on Counter** | Point of Sale (POS) | High-resolution printable QR codes for retail physical counters |

---

## 🔌 Integration Methods

### 1. Hosted Payment Portal (Zero Code)
Every merchant automatically receives a dedicated, mobile-optimized checkout URL:
```text
https://yourdomain.com/pay/YOUR_APP_ID?amount=2500&order=ORD-101
```
Send this directly to customers via WhatsApp or SMS, or paste it in your Instagram bio.

### 2. WordPress / WooCommerce Plugin (1-Click)
* Download `pakpayment-woocommerce.zip` directly from your dashboard (**Integrations** tab) or [`public/downloads/pakpayment-woocommerce.zip`](file:///c:/Users/anzamuneebkhan/Desktop/Office_Offline_Work/pak_payment_2026/pak_payment/public/downloads/pakpayment-woocommerce.zip).
* Go to **WordPress Admin > Plugins > Add New > Upload Plugin**.
* Enter your **Public App ID** in **WooCommerce > Settings > Payments > PakPayment**.
* Automatic webhook synchronization marks orders as **Processing / Paid** the second you confirm the claim!

### 3. Universal HTML & JavaScript Embed
Drop this 2-line snippet on any static website, PHP application, Webflow, or Shopify theme:
```html
<!-- Mount Container -->
<div id="pakpayment-widget" data-session="cs_live_YOUR_SESSION_ID"></div>

<!-- Universal Embed Script -->
<script src="https://yourdomain.com/widget.js?appId=YOUR_APP_ID" async></script>
```

### 4. React & Next.js Headless Stores
Import the SDK directly into your React application:
```tsx
import { PakPaymentCheckout } from '@/widget/react';

export default function CheckoutPage({ sessionId }) {
  return (
    <PakPaymentCheckout
      appId="YOUR_APP_ID"
      sessionId={sessionId}
      onSuccess={(claim) => console.log('Payment claimed:', claim)}
    />
  );
}
```

---

## 📡 REST API v1 Reference

### 1. Create a Tamper-Proof Payment Order
Create a locked checkout session with pre-defined amount and currency from your server backend:

```http
POST /api/v1/orders
Authorization: Bearer YOUR_API_SECRET_KEY
Content-Type: application/json

{
  "orderId": "ORD-5481",
  "amount": 4500,
  "currency": "PKR",
  "customerEmail": "customer@example.com",
  "customerName": "Usman Tariq",
  "redirectUrl": "https://yourstore.com/order-success"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "cs_live_948f2c31e9a2",
  "checkoutUrl": "https://yourdomain.com/pay/YOUR_APP_ID?session=cs_live_948f2c31e9a2",
  "orderId": "ORD-5481",
  "amount": 4500,
  "currency": "PKR"
}
```

---

### 2. Verify Inbound Webhook Signatures
When a payment claim is confirmed or rejected in your dashboard, PakPayment sends an HTTP `POST` request to your registered Webhook URL with an HMAC-SHA256 signature in the `X-PakPayment-Signature` header.

#### Node.js / JavaScript Example:
```javascript
const crypto = require('crypto');

function verifyPakPaymentWebhook(payloadString, signatureHeader, secretKey) {
  // Header format: t=1727280000,v1=9f86d081884c7d65...
  const parts = signatureHeader.split(',');
  const timestamp = parts[0].split('=')[1];
  const receivedSig = parts[1].split('=')[1];

  const computedSig = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}.${payloadString}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedSig), Buffer.from(receivedSig));
}
```

#### PHP Example:
```php
function verify_pakpayment_webhook($payload, $sig_header, $secret) {
    preg_match('/t=(\d+),v1=([a-f0-9]+)/', $sig_header, $matches);
    if (count($matches) < 3) return false;
    
    $timestamp = $matches[1];
    $received_sig = $matches[2];
    $computed_sig = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    
    return hash_equals($computed_sig, $received_sig);
}
```

---

## ⚙️ Environment Variables Reference

All system configuration is managed through [`.env.local`](file:///c:/Users/anzamuneebkhan/Desktop/Office_Offline_Work/pak_payment_2026/pak_payment/.env.local):

| Environment Variable | Required | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public root URL of your deployed application | `http://localhost:3000` or `https://pay.yourdomain.com` |
| `MONGODB_URI` | **Yes** | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://localhost:27017/pakpayment` |
| `BETTER_AUTH_SECRET` | **Yes** | 32+ character random string for signing auth sessions | `pak_payment_secure_secret_key_32_chars_12345` |
| `BETTER_AUTH_URL` | **Yes** | Auth base callback URL (same as `NEXT_PUBLIC_APP_URL`) | `http://localhost:3000` |
| `SMTP_HOST` | **Yes** | SMTP server address for outgoing emails | `smtp.gmail.com` |
| `SMTP_PORT` | **Yes** | SMTP port (465 for SSL, 587 for TLS) | `465` |
| `SMTP_USER` | **Yes** | SMTP username / Gmail address | `youraccount@gmail.com` |
| `SMTP_PASS` | **Yes** | SMTP password / Gmail 16-character App Password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM_EMAIL` | **Yes** | Sender email displayed on outgoing customer receipts | `youraccount@gmail.com` |
| `NEXT_PUBLIC_TOAST_DURATION`| Optional | Toast notification duration in milliseconds | `10000` (10 seconds) |

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
* **Node.js**: v18.0.0+ or v20.0.0+
* **MongoDB**: Local MongoDB community server running on port `27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.
* **Package Manager**: `npm` (project is locked to `package-lock.json`).

### 2. Setup Instructions
```bash
# 1. Clone repository
git clone https://github.com/anzamuneebkhanofficial/pakpayment.git
cd pakpayment

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# (Edit .env.local with your MongoDB URI and SMTP credentials)

# 4. Start Development Server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Production Build & Deployment
PakPayment uses Next.js 16 with Turbopack. To create an optimized production build:
```bash
npm run build
npm start
```
* The build automatically bundles [`public/widget.js`](file:///c:/Users/anzamuneebkhan/Desktop/Office_Offline_Work/pak_payment_2026/pak_payment/public/widget.js) and packages the WooCommerce plugin zip.

---

## ❓ Frequently Asked Questions (FAQ)

#### Is PakPayment legal in Pakistan?
**Yes.** PakPayment operates as a technical software layer, not an intermediary financial institution. It never takes custody of funds, holds client escrow, or pools money. All payments are direct peer-to-merchant transfers through regulated Pakistani banks and mobile wallets compliant with State Bank of Pakistan (SBP) rules.

#### What happens if a customer submits a fake TRX ID?
Every customer claim appears as **Pending** in your dashboard. You never ship an order until you verify that the funds have arrived in your banking or JazzCash app. If the transaction ID is invalid, simply click **Reject Claim**. The customer is automatically emailed a rejection notice with your feedback reason.

#### Can customers tamper with product prices?
**No.** When your store calls `POST /api/v1/orders`, the amount is locked on the server inside MongoDB. The customer's checkout interface only displays the pre-calculated locked amount.

---

## 📄 License & Credits

This project is licensed under the **MIT License** — you are completely free to use, modify, self-host, or integrate it into client projects.

<div align="center">

### Designed, Engineered & Maintained by
## **[Muhammad Anza Muneeb Khan](https://muhammadanzamuneebkhan.vercel.app/)**
*Visit portfolio at [muhammadanzamuneebkhan.vercel.app](https://muhammadanzamuneebkhan.vercel.app/)*

</div>
