=== PakPayment Gateway for WooCommerce ===
Contributors: pakpayment
Tags: woocommerce, payment gateway, pakistan, jazzcash, easypaisa, bank transfer, raast, hpos
Requires at least: 5.6
Tested up to: 7.1
Stable tag: 2.2.0
Requires PHP: 7.4
License: MIT
License URI: https://opensource.org/licenses/MIT

Enterprise direct Pakistani payment gateway for WooCommerce. Seamlessly syncs Bank Accounts (Raast/IBAN), JazzCash, EasyPaisa, and Crypto directly from your PakPayment Dashboard with 0% transaction fees.

== Description ==

PakPayment Gateway enables WooCommerce store owners in Pakistan to receive direct bank and mobile wallet payments without intermediary gateway fees.

Features:
* Full WordPress 7.x & WooCommerce 9.x Compatibility
* High-Performance Order Storage (HPOS) & Custom Order Tables certified
* Automatic live sync of active payment accounts (Bank, JazzCash, EasyPaisa, Crypto) from your PakPayment Dashboard
* Branded, dark-mode checkout card with 1-click clipboard copy buttons
* Optional on-checkout Transaction Reference (TRX ID) input
* Instant customer redirection to Hosted Payment Portal for QR code scan & receipt upload
* 1-Click WhatsApp payment receipt dispatch button
* Automatic Webhook order status confirmation

== Installation ==

1. Upload `pakpayment-woocommerce.zip` via WordPress Admin: **Plugins > Add New Plugin > Upload Plugin**.
2. Click **Install Now**, then click **Activate Plugin**.
3. Go to **WooCommerce > Settings > Payments > PakPayment**.
4. Enter your **Public App ID** (e.g. `pp_app_...`).
5. Choose your Checkout Mode (**Hosted Portal Redirect** recommended).
6. Save changes. Your live store is now ready to receive direct zero-fee payments!

== Changelog ==

= 2.2.0 =
* Full HPOS (High-Performance Order Storage) and WooCommerce 9.x / WordPress 7.x compatibility.
* Added automatic live synchronization of payment methods from PakPayment Dashboard via Public App ID.
* Added 1-click clipboard copy buttons for account numbers and IBAN directly on the checkout page.
* Guaranteed zero-error order processing with graceful fallback to Hosted Portal.
* Added 1-click WhatsApp payment proof button and Order Received summary card.
