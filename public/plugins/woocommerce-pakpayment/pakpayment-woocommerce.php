<?php
/**
 * Plugin Name: PakPayment Gateway for WooCommerce
 * Plugin URI: https://pakpayment.vercel.app
 * Description: Enterprise direct Pakistani payment gateway for WooCommerce. Seamlessly syncs Bank Accounts (Raast/IBAN), JazzCash, EasyPaisa, and Crypto from your PakPayment Dashboard with 0% transaction fees.
 * Version: 2.2.0
 * Author: PakPayment Open Source
 * Author URI: https://pakpayment.vercel.app
 * Text Domain: pakpayment-woocommerce
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 9.2
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ─── 1. Declare WooCommerce HPOS & Block Compatibility ────────────────────────
add_action('before_woocommerce_init', 'pakpayment_declare_hpos_compatibility');
function pakpayment_declare_hpos_compatibility() {
    if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
    }
}

// ─── 2. Initialize Gateway Class ──────────────────────────────────────────────
add_action('plugins_loaded', 'pakpayment_init_gateway_class', 11);

function pakpayment_init_gateway_class() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_PakPayment extends WC_Payment_Gateway {

        // Explicit property declarations for PHP 8.2+ compatibility
        public $checkout_mode;
        public $app_id;
        public $secret_key;
        public $webhook_secret;
        public $api_endpoint;
        public $order_status_confirmed;
        public $bank_name;
        public $bank_title;
        public $bank_iban;
        public $jazzcash_title;
        public $jazzcash_number;
        public $easypaisa_title;
        public $easypaisa_number;
        public $whatsapp_number;
        public $custom_instructions;

        public function __construct() {
            $this->id                 = 'pakpayment';
            $this->icon               = apply_filters('woocommerce_pakpayment_icon', '');
            $this->has_fields         = true;
            $this->method_title       = __('PakPayment (Bank, JazzCash, EasyPaisa)', 'pakpayment-woocommerce');
            $this->method_description = __('Accepts zero-fee direct Pakistani Bank Transfers (Raast / IBAN), JazzCash, EasyPaisa, and Crypto directly synced from your PakPayment dashboard.', 'pakpayment-woocommerce');

            // Load settings
            $this->init_form_fields();
            $this->init_settings();

            // Core Settings
            $this->title                  = $this->get_option('title', __('Direct Bank Transfer / JazzCash / EasyPaisa (PakPayment)', 'pakpayment-woocommerce'));
            $this->description            = $this->get_option('description', __('Pay directly to our Bank account, JazzCash, or EasyPaisa. Zero processing fees. Instant verification.', 'pakpayment-woocommerce'));
            $this->checkout_mode         = $this->get_option('checkout_mode', 'hosted');
            $this->app_id                 = trim($this->get_option('app_id', ''));
            $this->secret_key             = trim($this->get_option('secret_key', ''));
            $this->webhook_secret         = trim($this->get_option('webhook_secret', ''));
            $this->api_endpoint           = rtrim($this->get_option('api_endpoint', 'https://pakpayment.vercel.app'), '/');
            $this->order_status_confirmed = $this->get_option('order_status_confirmed', 'processing');

            // Manual fallback accounts (if offline or custom)
            $this->bank_name             = $this->get_option('bank_name', '');
            $this->bank_title            = $this->get_option('bank_title', '');
            $this->bank_iban             = $this->get_option('bank_iban', '');
            $this->jazzcash_title        = $this->get_option('jazzcash_title', '');
            $this->jazzcash_number       = $this->get_option('jazzcash_number', '');
            $this->easypaisa_title       = $this->get_option('easypaisa_title', '');
            $this->easypaisa_number      = $this->get_option('easypaisa_number', '');
            $this->whatsapp_number       = $this->get_option('whatsapp_number', '');
            $this->custom_instructions   = $this->get_option('custom_instructions', '');

            // Hooks
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_api_pakpayment_webhook', array($this, 'handle_webhook'));
            add_action('woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page'));
            add_action('woocommerce_email_before_order_table', array($this, 'email_instructions'), 10, 3);
        }

        /**
         * Gateway form fields in WooCommerce Settings
         */
        public function init_form_fields() {
            $webhook_url = add_query_arg('wc-api', 'pakpayment_webhook', home_url('/'));

            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'pakpayment-woocommerce'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable PakPayment Gateway', 'pakpayment-woocommerce'),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __('Title at Checkout', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Payment method name shown to customers during checkout.', 'pakpayment-woocommerce'),
                    'default'     => __('Direct Bank Transfer / JazzCash / EasyPaisa (PakPayment)', 'pakpayment-woocommerce'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description at Checkout', 'pakpayment-woocommerce'),
                    'type'        => 'textarea',
                    'description' => __('Brief summary displayed under the payment method title.', 'pakpayment-woocommerce'),
                    'default'     => __('Pay directly to our Bank account, JazzCash, or EasyPaisa. Zero processing fees. Instant verification.', 'pakpayment-woocommerce'),
                ),
                'checkout_mode' => array(
                    'title'       => __('Checkout Flow Mode', 'pakpayment-woocommerce'),
                    'type'        => 'select',
                    'description' => __('Choose how customers complete and verify payments.', 'pakpayment-woocommerce'),
                    'default'     => 'hosted',
                    'options'     => array(
                        'hosted' => __('Hosted Portal Redirect (Recommended - redirects to your beautiful PakPayment Portal with QR & receipt upload)', 'pakpayment-woocommerce'),
                        'direct' => __('Direct On-Page Instructions (displays synced accounts on checkout & thank you page)', 'pakpayment-woocommerce'),
                        'api'    => __('Server-Locked REST API Session (creates locked session with webhook auto-sync)', 'pakpayment-woocommerce'),
                    ),
                ),
                'portal_section' => array(
                    'title'       => __('PakPayment Dashboard Connection', 'pakpayment-woocommerce'),
                    'type'        => 'title',
                    'description' => __('Enter your Public App ID to automatically sync accounts, colors, and branding configured in your PakPayment dashboard.', 'pakpayment-woocommerce'),
                ),
                'app_id' => array(
                    'title'       => __('Public App ID', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Your Public App ID from your PakPayment Dashboard (e.g. pp_app_...).', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'api_endpoint' => array(
                    'title'       => __('PakPayment Portal / Host URL', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('URL of your PakPayment app (e.g. https://your-deployment.vercel.app or http://localhost:3000 for local test).', 'pakpayment-woocommerce'),
                    'default'     => 'https://pakpayment.vercel.app',
                ),
                'secret_key' => array(
                    'title'       => __('API Secret Key (Optional)', 'pakpayment-woocommerce'),
                    'type'        => 'password',
                    'description' => __('From Dashboard -> API Keys (e.g. pp_sk_live_...). Needed for Server-Locked REST API mode.', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'webhook_secret' => array(
                    'title'       => __('Webhook Signing Secret (Optional)', 'pakpayment-woocommerce'),
                    'type'        => 'password',
                    'description' => __('From Dashboard -> Webhooks (e.g. pp_whsec_...). Used to auto-verify incoming order confirmations.', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'order_status_confirmed' => array(
                    'title'       => __('Status when Verified', 'pakpayment-woocommerce'),
                    'type'        => 'select',
                    'description' => __('Order status in WooCommerce once payment is approved in your PakPayment dashboard.', 'pakpayment-woocommerce'),
                    'default'     => 'processing',
                    'options'     => array(
                        'processing' => __('Processing', 'pakpayment-woocommerce'),
                        'completed'  => __('Completed', 'pakpayment-woocommerce'),
                    ),
                ),
                'accounts_section' => array(
                    'title'       => __('Manual / Fallback Accounts (Optional)', 'pakpayment-woocommerce'),
                    'type'        => 'title',
                    'description' => __('Optional backup accounts. If left empty, the plugin automatically fetches active accounts from your Dashboard using your Public App ID.', 'pakpayment-woocommerce'),
                ),
                'bank_name' => array(
                    'title'       => __('Bank Name', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('e.g. Meezan Bank, HBL, Faysal Bank, Raast ID', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'bank_title' => array(
                    'title'       => __('Bank Account Title', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Account holder name', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'bank_iban' => array(
                    'title'       => __('Bank IBAN / Account Number', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Full IBAN or Account Number', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'jazzcash_number' => array(
                    'title'       => __('JazzCash Mobile Number', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('e.g. 03001234567', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'jazzcash_title' => array(
                    'title'       => __('JazzCash Account Title', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Account holder name', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'easypaisa_number' => array(
                    'title'       => __('EasyPaisa Mobile Number', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('e.g. 03451234567', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'easypaisa_title' => array(
                    'title'       => __('EasyPaisa Account Title', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Account holder name', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'whatsapp_number' => array(
                    'title'       => __('Merchant WhatsApp (For Receipt Dispatch)', 'pakpayment-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Include country code without plus (e.g. 923001234567). Enables 1-click WhatsApp payment proof button on thank-you page.', 'pakpayment-woocommerce'),
                    'default'     => '',
                ),
                'webhook_notice' => array(
                    'title'       => __('Webhook Notification URL', 'pakpayment-woocommerce'),
                    'type'        => 'title',
                    'description' => sprintf(
                        __('Copy this URL into your PakPayment Dashboard under <strong>Webhooks</strong>: <br/><br/><code>%s</code>', 'pakpayment-woocommerce'),
                        esc_url($webhook_url)
                    ),
                ),
            );
        }

        /**
         * Fetch active payment methods synced from PakPayment Dashboard
         */
        public function get_synced_methods() {
            if (empty($this->app_id)) {
                return array();
            }

            $transient_key = 'pakpayment_methods_' . substr(md5($this->app_id . $this->api_endpoint), 0, 12);
            $cached = get_transient($transient_key);
            if (is_array($cached)) {
                return $cached;
            }

            $url = rtrim($this->api_endpoint, '/') . '/api/public/widget/' . rawurlencode($this->app_id);
            $response = wp_remote_get($url, array('timeout' => 4));

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $body = json_decode(wp_remote_retrieve_body($response), true);
                if (!empty($body['methods']) && is_array($body['methods'])) {
                    set_transient($transient_key, $body['methods'], 3600); // cache for 1 hour
                    return $body['methods'];
                }
            }

            return array();
        }

        /**
         * Render Admin Settings Header with Connection Status
         */
        public function admin_options() {
            $methods = $this->get_synced_methods();
            $has_app_id = !empty($this->app_id);

            ?>
            <div style="background: #09090b; color: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #27272a; max-width: 900px; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 38px; height: 38px; border-radius: 10px; background: #ccff00; color: #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px;">⚡</div>
                        <div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800;">PakPayment Gateway for WooCommerce</h2>
                            <p style="margin: 3px 0 0; color: #a1a1aa; font-size: 12px;">WordPress 7.x & WooCommerce 9.x Compatible • 0% Transaction Fees</p>
                        </div>
                    </div>
                    <?php if ($has_app_id && !empty($methods)): ?>
                        <span style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                            ✓ Connected &amp; Synced (<?php echo count($methods); ?> Methods Active)
                        </span>
                    <?php elseif ($has_app_id): ?>
                        <span style="background: rgba(234,179,8,0.15); color: #facc15; border: 1px solid rgba(234,179,8,0.3); padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                            App ID Configured (Hosted Redirect Ready)
                        </span>
                    <?php else: ?>
                        <span style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                            App ID Not Configured
                        </span>
                    <?php endif; ?>
                </div>

                <?php if (!empty($methods)): ?>
                    <div style="font-size: 12px; color: #d4d4d8;">
                        <strong style="color: #ccff00;">Live Synced Payment Accounts:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            <?php foreach ($methods as $m): ?>
                                <div style="background: #18181b; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 6px;">
                                    <span style="color: #ffffff; font-weight: bold;"><?php echo esc_html(ucwords(str_replace('_', ' ', $m['provider']))); ?></span>: 
                                    <span style="color: #a1a1aa;"><?php echo esc_html($m['accountName']); ?> (<?php echo esc_html($m['accountNumber']); ?>)</span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
            <?php

            parent::admin_options();
        }

        /**
         * Render Beautiful On-Page Checkout UI (payment_fields)
         */
        public function payment_fields() {
            if (!empty($this->description)) {
                echo '<p style="margin-bottom: 12px; font-size: 13px; color: #4b5563; line-height: 1.5;">' . wp_kses_post($this->description) . '</p>';
            }

            // Gather accounts from Dashboard Sync OR Manual Fallback
            $synced_methods = $this->get_synced_methods();
            $has_synced = !empty($synced_methods);
            $has_manual = !empty($this->bank_iban) || !empty($this->jazzcash_number) || !empty($this->easypaisa_number);

            ?>
            <div id="pakpayment-checkout-card" style="background: #09090b !important; border: 1px solid #27272a !important; border-radius: 14px !important; padding: 18px !important; color: #f4f4f5 !important; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif !important; box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; margin-top: 10px !important; box-sizing: border-box !important;">
                
                <!-- Card Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 9px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #ccff00; color: #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; box-shadow: 0 0 14px rgba(204,255,0,0.3);">
                            ⚡
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 13px; color: #ffffff;">PakPayment Direct Gateway</div>
                            <div style="font-size: 10px; color: #a1a1aa;">Bank Transfer • JazzCash • EasyPaisa • Raast</div>
                        </div>
                    </div>
                    <span style="background: rgba(204,255,0,0.1); color: #ccff00; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(204,255,0,0.25);">
                        0% Gateway Fee
                    </span>
                </div>

                <!-- Method Badges -->
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                    <span style="background: #18181b; border: 1px solid #3f3f46; color: #e4e4e7; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 500;">
                        🏦 Bank / Raast
                    </span>
                    <span style="background: rgba(233,30,99,0.12); border: 1px solid rgba(233,30,99,0.35); color: #f472b6; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600;">
                        📱 JazzCash
                    </span>
                    <span style="background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.35); color: #4ade80; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600;">
                        📱 EasyPaisa
                    </span>
                </div>

                <!-- Display Synced or Manual Accounts -->
                <?php if ($has_synced): ?>
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 12px; margin-bottom: 12px; font-size: 12px; line-height: 1.6;">
                        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; margin-bottom: 8px; letter-spacing: 0.05em;">
                            Available Payment Accounts:
                        </div>
                        <?php foreach ($synced_methods as $idx => $method): ?>
                            <?php 
                                $prov = strtolower($method['provider'] ?? '');
                                $badge_color = '#93c5fd';
                                $icon = '🏦';
                                if (strpos($prov, 'jazz') !== false) { $badge_color = '#f472b6'; $icon = '📱'; }
                                elseif (strpos($prov, 'easy') !== false) { $badge_color = '#4ade80'; $icon = '📱'; }
                                elseif (strpos($prov, 'crypto') !== false) { $badge_color = '#facc15'; $icon = '💎'; }
                            ?>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; <?php echo ($idx < count($synced_methods) - 1) ? 'border-bottom: 1px dashed #27272a;' : ''; ?>">
                                <div>
                                    <span style="color: <?php echo esc_attr($badge_color); ?>; font-weight: 700;"><?php echo $icon . ' ' . esc_html(ucwords(str_replace('_', ' ', $method['provider']))); ?>:</span>
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ccff00; font-weight: 700; font-size: 12px; margin-left: 4px;"><?php echo esc_html($method['accountNumber']); ?></code>
                                    <span style="color: #a1a1aa; font-size: 11px; margin-left: 4px;">(<?php echo esc_html($method['accountName']); ?>)</span>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($method['accountNumber']); ?>'); this.innerText='✓'; setTimeout(()=>this.innerText='Copy',1500);" style="background: #27272a; border: 1px solid #3f3f46; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer;">
                                    Copy
                                </button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php elseif ($has_manual): ?>
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 12px; margin-bottom: 12px; font-size: 12px; line-height: 1.6;">
                        <?php if (!empty($this->bank_iban)): ?>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                                <div>
                                    <span style="color: #93c5fd; font-weight: 700;">🏦 <?php echo esc_html($this->bank_name ?: 'Bank Transfer'); ?>:</span>
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ccff00; font-weight: 700;"><?php echo esc_html($this->bank_iban); ?></code>
                                    <span style="color: #a1a1aa; font-size: 11px;">(<?php echo esc_html($this->bank_title); ?>)</span>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($this->bank_iban); ?>'); this.innerText='✓'; setTimeout(()=>this.innerText='Copy',1500);" style="background: #27272a; border: 1px solid #3f3f46; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer;">Copy</button>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($this->jazzcash_number)): ?>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                                <div>
                                    <span style="color: #f472b6; font-weight: 700;">📱 JazzCash:</span>
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ffffff; font-weight: 700;"><?php echo esc_html($this->jazzcash_number); ?></code>
                                    <span style="color: #a1a1aa; font-size: 11px;">(<?php echo esc_html($this->jazzcash_title); ?>)</span>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($this->jazzcash_number); ?>'); this.innerText='✓'; setTimeout(()=>this.innerText='Copy',1500);" style="background: #27272a; border: 1px solid #3f3f46; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer;">Copy</button>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($this->easypaisa_number)): ?>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <span style="color: #4ade80; font-weight: 700;">📱 EasyPaisa:</span>
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ffffff; font-weight: 700;"><?php echo esc_html($this->easypaisa_number); ?></code>
                                    <span style="color: #a1a1aa; font-size: 11px;">(<?php echo esc_html($this->easypaisa_title); ?>)</span>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($this->easypaisa_number); ?>'); this.innerText='✓'; setTimeout(()=>this.innerText='Copy',1500);" style="background: #27272a; border: 1px solid #3f3f46; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer;">Copy</button>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <!-- Step-by-Step Guidance -->
                <div style="background: rgba(39,39,42,0.6); border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #d4d4d8; line-height: 1.5;">
                    <?php if (!empty($this->app_id) && $this->checkout_mode === 'hosted'): ?>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #ccff00; font-size: 15px;">👉</span>
                            <span><strong>Next Step:</strong> Click <strong>Place order</strong> below to go to our secure <strong>PakPayment Portal</strong> to complete payment and submit your receipt.</span>
                        </div>
                    <?php else: ?>
                        👉 Transfer the exact order total to any method above. You can optionally enter your TRX ID below.
                    <?php endif; ?>
                </div>

                <?php if ($this->checkout_mode === 'direct' || empty($this->app_id)): ?>
                <!-- Optional TRX ID / Sender Name Input Fields (Only for Direct Mode) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 700; color: #a1a1aa; margin-bottom: 4px; text-transform: uppercase;">
                            TRX / Ref ID (Optional)
                        </label>
                        <input type="text" name="pakpayment_trx_id" placeholder="e.g. 0123456789" style="width: 100% !important; background: #18181b !important; border: 1px solid #3f3f46 !important; color: #ffffff !important; padding: 7px 10px !important; border-radius: 6px !important; font-size: 12px !important;" />
                    </div>
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 700; color: #a1a1aa; margin-bottom: 4px; text-transform: uppercase;">
                            Paid Via / Sender # (Optional)
                        </label>
                        <input type="text" name="pakpayment_sender_info" placeholder="e.g. JazzCash / 0300..." style="width: 100% !important; background: #18181b !important; border: 1px solid #3f3f46 !important; color: #ffffff !important; padding: 7px 10px !important; border-radius: 6px !important; font-size: 12px !important;" />
                    </div>
                </div>
                <?php endif; ?>

            </div>
            <?php
        }

        /**
         * Process Payment & Direct Customer (Zero Failure Guarantee)
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);

            if (!$order) {
                wc_add_notice(__('Order not found.', 'pakpayment-woocommerce'), 'error');
                return array('result' => 'fail');
            }

            // Capture any customer inputs from checkout
            if (!empty($_POST['pakpayment_trx_id'])) {
                $trx = sanitize_text_field($_POST['pakpayment_trx_id']);
                $order->update_meta_data('_pakpayment_trx_id', $trx);
                $order->add_order_note(sprintf(__('Customer entered TRX ID at checkout: %s', 'pakpayment-woocommerce'), $trx));
            }

            if (!empty($_POST['pakpayment_sender_info'])) {
                $sender = sanitize_text_field($_POST['pakpayment_sender_info']);
                $order->update_meta_data('_pakpayment_sender_info', $sender);
                $order->add_order_note(sprintf(__('Customer sender details: %s', 'pakpayment-woocommerce'), $sender));
            }

            $customer_name  = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name());
            $customer_email = $order->get_billing_email();
            $customer_phone = $order->get_billing_phone();
            $order_number   = $order->get_order_number();
            $order_total    = (float)$order->get_total();
            $currency       = $order->get_currency();

            // Set order to On-Hold awaiting verification
            $order->update_status('on-hold', __('Awaiting customer direct payment verification via PakPayment.', 'pakpayment-woocommerce'));
            $order->save();

            // Clear the cart
            WC()->cart->empty_cart();

            $target_redirect = '';

            // 1. If REST API Mode selected AND Secret Key configured
            if ($this->checkout_mode === 'api' && !empty($this->secret_key)) {
                $items = array();
                foreach ($order->get_items() as $item_id => $item) {
                    $items[] = array(
                        'name'     => $item->get_name(),
                        'quantity' => (int)$item->get_quantity(),
                        'price'    => (float)$order->get_item_total($item, false, false),
                    );
                }

                $payload = array(
                    'orderId'        => (string)$order_number,
                    'amount'         => $order_total,
                    'currency'       => $currency,
                    'customerName'   => $customer_name,
                    'customerEmail'  => $customer_email,
                    'customerPhone'  => $customer_phone,
                    'items'          => $items,
                    'redirectUrl'    => $this->get_return_url($order),
                    'metadata'       => array(
                        'wc_order_id'   => $order_id,
                        'wc_order_key'  => $order->get_order_key(),
                        'store_url'     => home_url(),
                    ),
                );

                $api_url = $this->api_endpoint . '/api/v1/orders';
                $response = wp_remote_post($api_url, array(
                    'headers' => array(
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . $this->secret_key,
                    ),
                    'body'    => wp_json_encode($payload),
                    'timeout' => 15,
                ));

                if (!is_wp_error($response)) {
                    $status_code = wp_remote_retrieve_response_code($response);
                    $response_body = wp_remote_retrieve_body($response);
                    $data = json_decode($response_body, true);

                    if ($status_code === 201 && !empty($data['checkoutUrl'])) {
                        $order->update_meta_data('_pakpayment_session_id', sanitize_text_field($data['sessionId']));
                        $order->save();
                        $target_redirect = $data['checkoutUrl'];
                    }
                }
            }

            // 2. Hosted Portal Redirect (Default / Graceful Fallback)
            if (empty($target_redirect) && !empty($this->app_id)) {
                $portal_base = rtrim($this->api_endpoint, '/');
                $target_args = array(
                    'orderId'       => $order_number,
                    'amount'        => $order_total,
                    'currency'      => $currency,
                    'customerName'  => $customer_name,
                    'customerEmail' => $customer_email,
                    'customerPhone' => $customer_phone,
                    'redirectUrl'   => $this->get_return_url($order),
                );

                if (!empty($this->whatsapp_number)) {
                    $target_args['merchantWa'] = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
                }
                if (!empty($this->easypaisa_number)) {
                    $target_args['ep'] = $this->easypaisa_number;
                    $target_args['ep_title'] = $this->easypaisa_title;
                }
                if (!empty($this->jazzcash_number)) {
                    $target_args['jc'] = $this->jazzcash_number;
                    $target_args['jc_title'] = $this->jazzcash_title;
                }
                if (!empty($this->bank_iban)) {
                    $target_args['bank'] = $this->bank_iban;
                    $target_args['bank_name'] = $this->bank_name;
                    $target_args['bank_title'] = $this->bank_title;
                }

                $target_redirect = add_query_arg($target_args, $portal_base . '/pay/' . $this->app_id);
            }

            // 3. Direct Mode / Fallback to Thank You page
            if (empty($target_redirect)) {
                $target_redirect = $this->get_return_url($order);
            }

            return array(
                'result'   => 'success',
                'redirect' => $target_redirect,
            );
        }

        /**
         * Render Payment Instructions on Order Received (Thank You) Page
         */
        public function thankyou_page($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) return;

            $synced_methods = $this->get_synced_methods();
            $has_synced = !empty($synced_methods);
            $has_manual = !empty($this->bank_iban) || !empty($this->jazzcash_number) || !empty($this->easypaisa_number);

            $portal_url = '';
            if (!empty($this->app_id)) {
                $portal_url = add_query_arg(array(
                    'orderId' => $order->get_order_number(),
                    'amount'  => $order->get_total(),
                ), rtrim($this->api_endpoint, '/') . '/pay/' . $this->app_id);
            }

            $wa_url = '';
            if (!empty($this->whatsapp_number)) {
                $clean_wa = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
                $msg = sprintf("Hello! I have placed Order #%s for PKR %s. Here is my payment proof:", $order->get_order_number(), number_format($order->get_total()));
                $wa_url = 'https://wa.me/' . $clean_wa . '?text=' . rawurlencode($msg);
            }

            ?>
            <div style="background: #09090b; border: 1px solid #27272a; border-radius: 14px; padding: 20px; color: #f4f4f5; margin: 24px 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 14px; margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #ffffff;">⚡ Complete Your Direct Payment</h3>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #a1a1aa;">Order #<?php echo esc_html($order->get_order_number()); ?> • Total: <strong>PKR <?php echo esc_html(number_format($order->get_total())); ?></strong></p>
                    </div>
                    <span style="background: rgba(204,255,0,0.1); color: #ccff00; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(204,255,0,0.25);">
                        Awaiting Verification
                    </span>
                </div>

                <?php if ($has_synced || $has_manual): ?>
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                        <div style="font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; margin-bottom: 8px;">
                            Payment Accounts to Transfer:
                        </div>
                        <?php if ($has_synced): ?>
                            <?php foreach ($synced_methods as $m): ?>
                                <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                                    <strong><?php echo esc_html(ucwords(str_replace('_', ' ', $m['provider']))); ?>:</strong> 
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ccff00; font-weight: bold;"><?php echo esc_html($m['accountNumber']); ?></code>
                                    <span style="color: #a1a1aa;">(<?php echo esc_html($m['accountName']); ?>)</span>
                                </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <?php if (!empty($this->bank_iban)): ?>
                                <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                                    <strong style="color: #93c5fd;">🏦 Bank:</strong> <?php echo esc_html($this->bank_name); ?> | 
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ccff00; font-weight: bold;"><?php echo esc_html($this->bank_iban); ?></code> (<?php echo esc_html($this->bank_title); ?>)
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($this->jazzcash_number)): ?>
                                <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                                    <strong style="color: #f472b6;">📱 JazzCash:</strong> 
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ffffff; font-weight: bold;"><?php echo esc_html($this->jazzcash_number); ?></code> (<?php echo esc_html($this->jazzcash_title); ?>)
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($this->easypaisa_number)): ?>
                                <div>
                                    <strong style="color: #4ade80;">📱 EasyPaisa:</strong> 
                                    <code style="background: #09090b; padding: 2px 6px; border-radius: 4px; color: #ffffff; font-weight: bold;"><?php echo esc_html($this->easypaisa_number); ?></code> (<?php echo esc_html($this->easypaisa_title); ?>)
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px;">
                    <?php if (!empty($portal_url)): ?>
                        <a href="<?php echo esc_url($portal_url); ?>" target="_blank" style="background: #ccff00; color: #000000; font-weight: 800; font-size: 13px; padding: 10px 18px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(204,255,0,0.25);">
                            👉 Open PakPayment Portal to Submit Receipt
                        </a>
                    <?php endif; ?>

                    <?php if (!empty($wa_url)): ?>
                        <a href="<?php echo esc_url($wa_url); ?>" target="_blank" style="background: #22c55e; color: #ffffff; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                            💬 Send Receipt via WhatsApp
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            <?php
        }

        /**
         * Add payment instructions to customer emails
         */
        public function email_instructions($order, $sent_to_admin, $plain_text = false) {
            if (!$order || $order->get_payment_method() !== $this->id) return;
            if ($order->get_status() !== 'on-hold') return;

            $synced_methods = $this->get_synced_methods();

            if ($plain_text) {
                echo "\n----------------------------------------\n";
                echo "PakPayment Direct Payment Details:\n";
                if (!empty($synced_methods)) {
                    foreach ($synced_methods as $m) {
                        echo ucwords(str_replace('_', ' ', $m['provider'])) . ": " . $m['accountNumber'] . " (" . $m['accountName'] . ")\n";
                    }
                } else {
                    if (!empty($this->bank_iban)) {
                        echo "Bank: " . $this->bank_name . " | IBAN: " . $this->bank_iban . " (" . $this->bank_title . ")\n";
                    }
                    if (!empty($this->jazzcash_number)) {
                        echo "JazzCash: " . $this->jazzcash_number . " (" . $this->jazzcash_title . ")\n";
                    }
                    if (!empty($this->easypaisa_number)) {
                        echo "EasyPaisa: " . $this->easypaisa_number . " (" . $this->easypaisa_title . ")\n";
                    }
                }
                echo "----------------------------------------\n\n";
            } else {
                ?>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px;">PakPayment Direct Payment Instructions:</h3>
                    <?php if (!empty($synced_methods)): ?>
                        <?php foreach ($synced_methods as $m): ?>
                            <p style="margin: 4px 0; font-size: 13px;"><strong><?php echo esc_html(ucwords(str_replace('_', ' ', $m['provider']))); ?>:</strong> <code><?php echo esc_html($m['accountNumber']); ?></code> (<?php echo esc_html($m['accountName']); ?>)</p>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <?php if (!empty($this->bank_iban)): ?>
                            <p style="margin: 4px 0; font-size: 13px;"><strong>Bank:</strong> <?php echo esc_html($this->bank_name); ?> | <strong>IBAN:</strong> <code><?php echo esc_html($this->bank_iban); ?></code></p>
                        <?php endif; ?>
                        <?php if (!empty($this->jazzcash_number)): ?>
                            <p style="margin: 4px 0; font-size: 13px;"><strong>JazzCash:</strong> <code><?php echo esc_html($this->jazzcash_number); ?></code> (<?php echo esc_html($this->jazzcash_title); ?>)</p>
                        <?php endif; ?>
                        <?php if (!empty($this->easypaisa_number)): ?>
                            <p style="margin: 4px 0; font-size: 13px;"><strong>EasyPaisa:</strong> <code><?php echo esc_html($this->easypaisa_number); ?></code> (<?php echo esc_html($this->easypaisa_title); ?>)</p>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
                <?php
            }
        }

        /**
         * Handle incoming Webhook from PakPayment
         * Listens at: ?wc-api=pakpayment_webhook
         */
        public function handle_webhook() {
            $raw_payload = file_get_contents('php://input');
            $signature_header = isset($_SERVER['HTTP_X_PAKPAYMENT_SIGNATURE']) ? sanitize_text_field($_SERVER['HTTP_X_PAKPAYMENT_SIGNATURE']) : '';

            if (empty($raw_payload)) {
                status_header(400);
                wp_send_json_error(array('message' => 'Empty webhook payload'));
                exit;
            }

            // Verify HMAC signature if webhook secret is configured
            if (!empty($this->webhook_secret) && !empty($signature_header)) {
                preg_match('/t=([0-9]+),v1=([a-f0-9]+)/', $signature_header, $matches);
                if (count($matches) === 3) {
                    $timestamp = $matches[1];
                    $expected_sig = $matches[2];

                    $signed_string = $timestamp . '.' . $raw_payload;
                    $computed_sig = hash_hmac('sha256', $signed_string, $this->webhook_secret);

                    if (!hash_equals($expected_sig, $computed_sig)) {
                        status_header(401);
                        wp_send_json_error(array('message' => 'Invalid webhook signature'));
                        exit;
                    }
                }
            }

            $event = json_decode($raw_payload, true);
            if (!$event || empty($event['event'])) {
                status_header(400);
                wp_send_json_error(array('message' => 'Invalid JSON'));
                exit;
            }

            $event_type = $event['event'];
            $data       = isset($event['data']) ? $event['data'] : array();

            // Handle ping event
            if ($event_type === 'ping') {
                status_header(200);
                wp_send_json_success(array('message' => 'PakPayment webhook pong received!'));
                exit;
            }

            $order_id = isset($data['orderId']) ? $data['orderId'] : '';
            if (empty($order_id)) {
                status_header(400);
                wp_send_json_error(array('message' => 'Missing orderId'));
                exit;
            }

            $order = wc_get_order($order_id);
            if (!$order) {
                $order_id_num = wc_get_order_id_by_order_key($order_id);
                if ($order_id_num) {
                    $order = wc_get_order($order_id_num);
                }
            }

            if (!$order) {
                status_header(404);
                wp_send_json_error(array('message' => 'Order not found in WooCommerce'));
                exit;
            }

            // Process Payment Confirmation
            if ($event_type === 'payment.confirmed') {
                $method    = isset($data['method']) ? $data['method'] : 'Direct Transfer';
                $reference = isset($data['reference']) ? $data['reference'] : 'N/A';
                $amount    = isset($data['amount']) ? $data['amount'] : $order->get_total();

                $note = sprintf(
                    __('✅ PakPayment Verified! Payment received via %s. Reference / TRX ID: %s. Amount: PKR %s.', 'pakpayment-woocommerce'),
                    esc_html($method),
                    esc_html($reference),
                    esc_html(number_format($amount))
                );

                $order->add_order_note($note);
                $order->payment_complete($reference);

                $target_status = $this->order_status_confirmed === 'completed' ? 'completed' : 'processing';
                $order->update_status($target_status, __('Order confirmed via PakPayment webhook.', 'pakpayment-woocommerce'));
                $order->save();

                status_header(200);
                wp_send_json_success(array('message' => 'Order updated to ' . $target_status));
                exit;
            }

            // Process Payment Rejection
            if ($event_type === 'payment.rejected') {
                $reason = isset($data['merchantNotes']) ? $data['merchantNotes'] : 'Claim could not be verified in bank statement';
                $note = sprintf(
                    __('❌ PakPayment Rejected by merchant. Reason: %s', 'pakpayment-woocommerce'),
                    esc_html($reason)
                );
                $order->add_order_note($note);
                $order->update_status('failed', __('Payment claim was rejected by merchant.', 'pakpayment-woocommerce'));
                $order->save();

                status_header(200);
                wp_send_json_success(array('message' => 'Order marked as failed'));
                exit;
            }

            status_header(200);
            wp_send_json_success(array('message' => 'Event acknowledged'));
            exit;
        }
    }
}

// Register Gateway in WooCommerce
add_filter('woocommerce_payment_gateways', 'pakpayment_add_gateway_class');
function pakpayment_add_gateway_class($gateways) {
    if (class_exists('WC_Gateway_PakPayment')) {
        $gateways[] = 'WC_Gateway_PakPayment';
    }
    return $gateways;
}

// Fallback admin notice if WooCommerce is inactive
add_action('admin_notices', 'pakpayment_woocommerce_fallback_notice');
function pakpayment_woocommerce_fallback_notice() {
    if (!class_exists('WooCommerce')) {
        echo '<div class="notice notice-error"><p>' . wp_kses_post(__('<strong>PakPayment Gateway:</strong> WooCommerce is not active. Please activate WooCommerce to accept payments.', 'pakpayment-woocommerce')) . '</p></div>';
    }
}
