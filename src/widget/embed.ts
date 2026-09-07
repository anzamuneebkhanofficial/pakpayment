/**
 * Pak Payment — Native Inline Embed Widget v3.1
 * Matches the hosted payment page UI exactly.
 * Uses merchant appearance settings (colors, title, etc.) from publishedConfig.
 * Fully compatible WhatsApp & Email direct dispatch.
 */

(function () {
  // ─── Param extraction ───────────────────────────────────────────────────────
  function getParams() {
    const scripts = document.querySelectorAll('script[src]');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = (scripts[i] as HTMLScriptElement).src;
      if (src && (src.includes('widget.js') || src.includes('pakpayment'))) {
        try {
          const url = new URL(src, window.location.href);
          const appId = url.searchParams.get('appId');
          if (appId) return { appId, origin: url.origin };
        } catch (_) {}
      }
    }
    return null;
  }

  function getInitialAmount(): string {
    try { return new URLSearchParams(window.location.search).get('amount') || ''; } catch (_) { return ''; }
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────
  function escHtml(str: string): string {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function hexToRgb(hex: string): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `${r}, ${g}, ${b}`;
  }

  function isLight(hex: string): boolean {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 155;
  }

  // Sanitize phone number to international standard format without plus or spaces
  // e.g., 03334098558 -> 923334098558, 0092333... -> 92333...
  function cleanPhoneNumber(raw: string): string {
    let clean = (raw || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0092')) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0')) {
      clean = '92' + clean.substring(1);
    } else if (clean.startsWith('92')) {
      clean = clean;
    } else if (clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  }

  // ─── Method helpers ──────────────────────────────────────────────────────────
  const PROVIDER_COLORS: Record<string,string> = {
    jazzcash:'#E91E63', jazz_cash:'#E91E63',
    easypaisa:'#4CAF50', easy_paisa:'#4CAF50',
    bank:'#1565C0', bank_transfer:'#1565C0',
    sadapay:'#00BCD4', nayapay:'#FF6F00',
    upaisa:'#9C27B0',
  };

  function providerColor(p: string): string {
    const k = (p||'').toLowerCase().replace(/[\s-]/g,'_');
    if (PROVIDER_COLORS[k]) return PROVIDER_COLORS[k];
    for (const [key, val] of Object.entries(PROVIDER_COLORS)) {
      if (k.includes(key) || key.includes(k)) return val;
    }
    return '#374151';
  }

  function formatProvider(p: string): string {
    if (!p) return 'Unknown';
    return p.replace(/[_-]/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase());
  }

  function initials(p: string): string {
    return formatProvider(p).split(' ').slice(0,2).map((w:string)=>w[0]).join('').toUpperCase();
  }

  // ─── WhatsApp message and link builder ───────────────────────────────────────
  function buildFormattedMessage(
    template: string,
    vars: { amount: string; orderId: string; method: string; ref: string; name: string; whatsapp: string; email: string }
  ): string {
    let msg = template || '';
    if (!msg || msg.trim() === 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.') {
      msg = `Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}.
• Transaction Reference (TRX ID): {{REF}}
• Sender Account Title / Name: {{NAME}}
• Customer WhatsApp: {{WHATSAPP}}
• Customer Email: {{EMAIL}}

I have attached my transfer receipt screenshot below. Please verify and confirm my order. Thank you!`;
    }

    const formattedAmount = vars.amount ? `PKR ${Number(vars.amount).toLocaleString()}` : 'Custom';

    msg = msg
      .replace(/\{\{AMOUNT\}\}/g, formattedAmount)
      .replace(/\{\{ORDER_ID\}\}/g, vars.orderId || 'Direct Payment')
      .replace(/\{\{METHOD\}\}/g, vars.method || 'Direct Transfer')
      .replace(/\{\{REF\}\}/g, vars.ref || 'N/A')
      .replace(/\{\{NAME\}\}/g, vars.name || 'N/A')
      .replace(/\{\{SENDER\}\}/g, vars.name || 'N/A')
      .replace(/\{\{WHATSAPP\}\}/g, vars.whatsapp || 'N/A')
      .replace(/\{\{CUSTOMER_WHATSAPP\}\}/g, vars.whatsapp || 'N/A')
      .replace(/\{\{EMAIL\}\}/g, vars.email || 'N/A')
      .replace(/\{\{CUSTOMER_EMAIL\}\}/g, vars.email || 'N/A');

    // Smart fallback if template missed any core detail:
    if (!msg.includes(vars.ref) && vars.ref) {
      msg += `\n• Transaction Reference: ${vars.ref}`;
    }
    if (!msg.includes(vars.name) && vars.name) {
      msg += `\n• Sender Name: ${vars.name}`;
    }
    if (!msg.includes(vars.whatsapp) && vars.whatsapp) {
      msg += `\n• Customer WhatsApp: ${vars.whatsapp}`;
    }
    if (!msg.includes(vars.email) && vars.email) {
      msg += `\n• Customer Email: ${vars.email}`;
    }

    return msg;
  }

  function buildWhatsAppDirectUrl(waNumber: string, message: string): string {
    const cleanNum = cleanPhoneNumber(waNumber);
    if (!cleanNum || cleanNum.length < 10) return '';
    // Use api.whatsapp.com/send to ensure universal cross-platform delivery
    return `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(message)}`;
  }

  // ─── Direct Product Order Helpers ───────────────────────────────────────────
  interface ProductDetails {
    name: string;
    price: string;
    description: string;
    sku: string;
    quantity: string;
    url: string;
  }

  function extractProductDetails(container: HTMLElement): ProductDetails {
    // Look in the closest product card/section container first
    const parent = container.closest('.product-card, .product, .product-single, article, section, [itemtype*="Product"], form, main, .item, .card') as HTMLElement || container.parentElement || document.body;

    // 1. Explicit data attributes on container
    let name = container.getAttribute('data-product-name') ||
               container.getAttribute('data-name') ||
               container.getAttribute('data-title') || '';

    let price = container.getAttribute('data-product-price') ||
                container.getAttribute('data-price') ||
                container.getAttribute('data-amount') || '';

    let description = container.getAttribute('data-product-desc') ||
                      container.getAttribute('data-description') ||
                      container.getAttribute('data-desc') || '';

    let sku = container.getAttribute('data-product-sku') ||
              container.getAttribute('data-sku') || '';

    let quantity = container.getAttribute('data-product-qty') ||
                   container.getAttribute('data-quantity') ||
                   container.getAttribute('data-qty') || '';

    let url = container.getAttribute('data-product-url') ||
              container.getAttribute('data-url') || window.location.href;

    // 2. Smart contextual detection for Product Name
    if (!name) {
      // Look inside parent container first for product headings (avoid site-wide header/logo)
      const parentHeading = parent.querySelector('h1:not(.site-title):not(.store-title):not(.logo), h2, h3, .product-title, .product_title, .product-name, [itemprop="name"]');
      if (parentHeading && parentHeading.textContent) {
        name = parentHeading.textContent.trim();
      } else {
        const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        if (ogTitle && !ogTitle.toLowerCase().includes('demo store')) {
          name = ogTitle.trim();
        } else {
          const docTitle = document.querySelector('h1.product_title, h1.product-title, .product-title, h1');
          if (docTitle && docTitle.textContent && !docTitle.textContent.toLowerCase().includes('demo store')) {
            name = docTitle.textContent.trim();
          } else {
            name = document.title ? document.title.split(/[-–|]/)[0].trim() : 'Product';
          }
        }
      }
    }

    // 3. Smart detection for Description
    if (!description) {
      const descEl = parent.querySelector('.product-description, .product-desc, .description, [itemprop="description"], p');
      if (descEl && descEl.textContent) {
        const txt = descEl.textContent.trim();
        description = txt.length > 140 ? txt.substring(0, 137) + '...' : txt;
      } else {
        const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
        if (ogDesc) {
          description = ogDesc.length > 140 ? ogDesc.substring(0, 137) + '...' : ogDesc.trim();
        }
      }
    }

    // 4. Smart contextual detection for Product Price
    if (!price) {
      // Search in parent first
      const priceEl = parent.querySelector('.price .amount, .product-price, .price-item--regular, .price ins, .price, .woocommerce-Price-amount');
      if (priceEl && priceEl.textContent) {
        price = priceEl.textContent.replace(/[^\d.,]/g, '').trim();
      } else {
        const ogPrice = document.querySelector('meta[property="product:price:amount"], meta[property="og:price:amount"]')?.getAttribute('content');
        if (ogPrice) {
          price = ogPrice.replace(/[^\d.,]/g, '').trim();
        } else {
          try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (let i = 0; i < scripts.length; i++) {
              const data = JSON.parse(scripts[i].textContent || '{}');
              const items = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])];
              for (const item of items) {
                if (item['@type'] === 'Product' && item.offers) {
                  const offerPrice = item.offers.price || (Array.isArray(item.offers) ? item.offers[0]?.price : '');
                  if (offerPrice) { price = String(offerPrice).replace(/[^\d.,]/g, '').trim(); break; }
                }
              }
              if (price) break;
            }
          } catch (_) {}
        }
      }
    }

    // Clean numeric price
    if (price) {
      price = price.replace(/^(PKR|Rs\.?|₨)\s*/i, '').trim();
    }

    // 5. Smart detection for SKU
    if (!sku) {
      const skuEl = parent.querySelector('.sku, [itemprop="sku"], .product-sku');
      if (skuEl && skuEl.textContent) {
        sku = skuEl.textContent.replace(/SKU:?/i, '').trim();
      }
    }

    // 6. Smart detection for Quantity
    if (!quantity) {
      const qtyInput = parent.querySelector('input[name="quantity"], input.qty, input[name="qty"]') as HTMLInputElement;
      if (qtyInput && qtyInput.value) {
        quantity = qtyInput.value;
      } else {
        quantity = '1';
      }
    }

    return { name, price, description, sku, quantity, url };
  }

  function buildProductOrderMessage(template: string, details: ProductDetails): string {
    let msg = template || '';
    if (!msg || msg.trim() === '') {
      msg = `Hello! I would like to order {{PRODUCT_NAME}} for PKR {{PRICE}}.
• Description: {{DESCRIPTION}}
• Product Link: {{URL}}
• SKU: {{SKU}}
• Quantity: {{QUANTITY}}

Please confirm availability and details. Thank you!`;
    }

    const formattedPrice = details.price ? details.price : 'As Listed';

    msg = msg
      .replace(/\{\{PRODUCT_NAME\}\}/g, details.name || 'Product')
      .replace(/\{\{PRODUCT\}\}/g, details.name || 'Product')
      .replace(/\{\{PRICE\}\}/g, formattedPrice)
      .replace(/\{\{AMOUNT\}\}/g, formattedPrice)
      .replace(/\{\{DESCRIPTION\}\}/g, details.description || '')
      .replace(/\{\{DESC\}\}/g, details.description || '')
      .replace(/\{\{URL\}\}/g, details.url || window.location.href)
      .replace(/\{\{LINK\}\}/g, details.url || window.location.href)
      .replace(/\{\{SKU\}\}/g, details.sku || '')
      .replace(/\{\{QUANTITY\}\}/g, details.quantity || '1')
      .replace(/\{\{QTY\}\}/g, details.quantity || '1');

    // Clean up empty bullet lines (e.g. if SKU or Description wasn't available)
    msg = msg
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        if (trimmed === '• SKU:' || trimmed === '• SKU: N/A' || trimmed === '• SKU: undefined') return false;
        if (trimmed === '• Description:' || trimmed === '• Description: N/A' || trimmed === '• Description: undefined') return false;
        return true;
      })
      .join('\n');

    return msg;
  }

  function renderOrderButton(container: HTMLElement, origin: string, appId: string, config: any) {
    if (container.hasAttribute('data-pp-order-init')) return;
    container.setAttribute('data-pp-order-init', 'true');

    const rawWaNumber = config?.whatsappNumber || '';
    if (!rawWaNumber) return;

    if (config?.enableWhatsAppOrderButton === false) {
      container.style.display = 'none';
      return;
    }

    const btnText = escHtml(config?.whatsAppOrderButtonText || 'Order through WhatsApp');
    const orderTemplate = config?.whatsAppOrderTemplate || '';

    const shadow = container.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; }
        .pp-order-btn {
          width: 100%;
          padding: 13px 18px;
          background: #25D366;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);
          user-select: none;
          font-family: inherit;
        }
        .pp-order-btn:hover {
          background: #20bd5a;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35);
        }
        .pp-order-btn:active {
          transform: scale(0.98);
        }
        .pp-order-icon {
          width: 19px;
          height: 19px;
          fill: currentColor;
          flex-shrink: 0;
        }
      </style>
      <button type="button" class="pp-order-btn" id="pp-order-btn">
        <svg class="pp-order-icon" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span>${btnText}</span>
      </button>
    `;

    shadow.querySelector('#pp-order-btn')?.addEventListener('click', () => {
      const details = extractProductDetails(container);
      const msg = buildProductOrderMessage(orderTemplate, details);
      const waUrl = buildWhatsAppDirectUrl(rawWaNumber, msg);
      if (waUrl) {
        window.open(waUrl, '_blank');
        fetch(`${origin}/api/public/widget/${appId}/event`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ type: 'whatsapp_order_click', product: details.name }),
          mode: 'no-cors',
        }).catch(() => {});
      }
    });
  }

  // ─── CSS (adapts to merchant colors via CSS vars) ────────────────────────────
  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      display: block; width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
    }

    .pp-root {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
      word-break: break-word;
      background: var(--pp-bg, #000000);
      color: var(--pp-text, #ffffff);
      border-radius: var(--pp-radius, 16px);
      padding: 28px 24px;
    }

    /* ── Header / Branding ── */
    .pp-header { text-align: center; margin-bottom: 22px; }
    .pp-biz-name { font-size: 20px; font-weight: 800; color: var(--pp-text, #fff); letter-spacing: -0.3px; }
    .pp-biz-sub { font-size: 12px; color: var(--pp-text-muted, #888); margin-top: 3px; }
    .pp-biz-desc { font-size: 12px; color: var(--pp-text-muted, #888); }

    /* ── Section labels ── */
    .pp-section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--pp-text-muted, #888);
      margin-bottom: 10px;
    }

    /* ── Method cards ── */
    .pp-methods { display: flex; flex-direction: column; gap: 0; margin-bottom: 16px; }

    .pp-method-card {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border: 1.5px solid var(--pp-border, #2a2a2a);
      border-bottom-width: 0;
      background: var(--pp-surface, #1a1a1a);
      cursor: pointer; user-select: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .pp-method-card:first-child { border-radius: 10px 10px 0 0; }
    .pp-method-card.is-last { border-bottom-width: 1.5px; border-radius: 0 0 10px 10px; }
    .pp-method-card.only-child { border-bottom-width: 1.5px; border-radius: 10px; }
    .pp-method-card.selected { border-color: var(--pp-accent, #CCFF00); background: var(--pp-accent-bg, rgba(204,255,0,0.07)); }
    .pp-method-card:hover:not(.selected) { background: var(--pp-surface-hover, #222); }

    .pp-radio {
      width: 17px; height: 17px; min-width: 17px; border-radius: 50%;
      border: 2px solid var(--pp-border, #555);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.15s;
    }
    .selected .pp-radio { border-color: var(--pp-accent, #CCFF00); }
    .pp-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--pp-accent, #CCFF00); display: none; }
    .selected .pp-radio-dot { display: block; }

    .pp-method-icon {
      width: 36px; height: 36px; min-width: 36px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; color: #fff;
    }
    .pp-method-name { font-size: 14px; font-weight: 600; color: var(--pp-text, #fff); }
    .pp-method-acct { font-size: 12px; color: var(--pp-text-muted, #888); margin-top: 1px; }

    /* ── Account detail box ── */
    .pp-detail {
      padding: 12px 14px; background: var(--pp-surface, #1a1a1a);
      border: 1.5px solid var(--pp-accent, #CCFF00); border-top: none;
      border-radius: 0 0 10px 10px; margin-bottom: 16px; display: none;
    }
    .pp-detail.visible { display: block; }
    .pp-detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--pp-text-muted, #666); margin-bottom: 6px; }
    .pp-acct-row {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      background: var(--pp-bg, #000000); padding: 10px 12px; border-radius: 8px;
      border: 1px solid var(--pp-border, #2a2a2a);
    }
    .pp-acct-num { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; color: var(--pp-text, #fff); word-break: break-all; }
    .pp-copy-btn {
      font-size: 12px; font-weight: 600; color: var(--pp-accent, #CCFF00);
      background: none; border: none; cursor: pointer; white-space: nowrap; padding: 0;
    }
    .pp-copy-btn:hover { text-decoration: underline; }
    .pp-notice {
      margin-top: 10px; font-size: 12px; color: var(--pp-text, #ddd);
      background: var(--pp-accent-bg, rgba(204,255,0,0.07));
      border: 1px solid var(--pp-accent, #CCFF00);
      border-radius: 7px; padding: 8px 12px; line-height: 1.5;
    }

    /* ── Form ── */
    .pp-form { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }

    .pp-field { display: flex; flex-direction: column; gap: 5px; }
    .pp-field label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: var(--pp-text-muted, #888);
    }
    .pp-field-hint { font-size: 11px; color: var(--pp-text-muted, #666); line-height: 1.4; margin-top: 2px; }
    .pp-optional { font-weight: 400; color: var(--pp-text-muted, #666); text-transform: none; letter-spacing: 0; margin-left: 3px; }

    .pp-input {
      width: 100%; padding: 11px 13px;
      background: var(--pp-surface, #1a1a1a);
      border: 1.5px solid var(--pp-border, #2a2a2a);
      border-radius: 9px; font-size: 14px;
      color: var(--pp-text, #fff); outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }
    .pp-input:focus { border-color: var(--pp-accent, #CCFF00); box-shadow: 0 0 0 3px var(--pp-accent-ring, rgba(204,255,0,0.12)); }
    .pp-input::placeholder { color: var(--pp-text-muted, #555); }

    .pp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 480px) { .pp-two-col { grid-template-columns: 1fr; } }

    .pp-amount-wrap { position: relative; }
    .pp-prefix { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: var(--pp-text-muted, #666); pointer-events: none; }
    .pp-input.indent { padding-left: 48px; }

    .pp-err-text { font-size: 11px; color: #f87171; display: none; margin-top: 2px; }

    /* ── Submit button ── */
    .pp-submit {
      width: 100%; padding: 14px;
      background: var(--pp-accent, #CCFF00); color: var(--pp-accent-text, #000);
      border: none; border-radius: 12px; font-size: 15px; font-weight: 800;
      cursor: pointer; transition: opacity 0.15s, transform 0.1s; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-top: 4px;
    }
    .pp-submit:hover { opacity: 0.88; }
    .pp-submit:active { transform: scale(0.98); }
    .pp-submit:disabled { opacity: 0.45; cursor: not-allowed; }

    .pp-submit-meta { text-align: center; margin-top: 8px; }
    .pp-submit-meta-line { font-size: 11px; color: var(--pp-text-muted, #777); margin-bottom: 3px; }
    .pp-submit-meta-line a { color: var(--pp-accent, #CCFF00); text-decoration: none; }
    .pp-submit-meta-line a:hover { text-decoration: underline; }

    .pp-global-err { font-size: 12px; color: #f87171; text-align: center; margin-top: 6px; display: none; }

    /* ── Divider ── */
    .pp-divider { border: none; border-top: 1px solid var(--pp-border, #222); margin: 18px 0; }

    /* ── Golden Success & Confirmation Card ── */
    .pp-success {
      text-align: center; padding: 24px 20px;
      border: 1.5px solid #f59e0b;
      border-radius: 16px; background: rgba(245, 158, 11, 0.06);
      word-break: break-word; overflow-wrap: break-word;
      max-width: 100%; box-sizing: border-box;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
    }
    .pp-success-icon { font-size: 36px; margin-bottom: 8px; }
    .pp-success h3 { font-size: 20px; font-weight: 800; color: #f59e0b; margin-bottom: 6px; letter-spacing: -0.2px; }
    .pp-success p { font-size: 13px; color: var(--pp-text, #fff); line-height: 1.5; }

    .pp-claim-summary {
      background: var(--pp-surface, #1a1a1a);
      border: 1px solid var(--pp-border, #2a2a2a);
      border-radius: 12px;
      padding: 12px 14px;
      margin: 16px 0;
      text-align: left;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pp-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pp-summary-label { color: var(--pp-text-muted, #777); font-size: 11px; }
    .pp-summary-val { color: var(--pp-text, #fff); font-weight: 600; font-family: monospace; }
    .pp-summary-status { color: #f59e0b; font-weight: 700; background: rgba(245, 158, 11, 0.15); padding: 2px 8px; border-radius: 6px; font-size: 11px; }

    .pp-golden-notice {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
      padding: 12px 14px;
      text-align: left;
      font-size: 12px;
      color: #fbbf24;
      line-height: 1.5;
      margin-top: 14px;
    }

    .pp-btn-open-wa {
      padding: 11px 14px;
      background: #25D366;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.15s;
    }
    .pp-btn-open-wa:hover { opacity: 0.9; }
    .pp-btn-stay {
      padding: 11px 14px;
      background: transparent;
      color: var(--pp-text-muted, #888);
      border: 1px solid var(--pp-border, #333);
      font-size: 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .pp-btn-stay:hover { color: var(--pp-text, #fff); border-color: var(--pp-text, #fff); }

    /* ── Footer ── */
    .pp-footer {
      margin-top: 18px; padding-top: 14px;
      border-top: 1px solid var(--pp-border, #222);
      display: flex; align-items: center; justify-content: space-between;
    }
    .pp-footer-left { font-size: 10px; color: var(--pp-text-muted, #555); }
    .pp-footer-right { font-size: 10px; color: var(--pp-text-muted, #555); }
    .pp-footer-right a { color: var(--pp-text-muted, #555); text-decoration: none; }
    .pp-footer-right a:hover { color: var(--pp-accent, #CCFF00); }

    .pp-state { padding: 28px; text-align: center; color: var(--pp-text-muted, #777); font-size: 14px; }
  `;

  // ─── Shared Config Fetcher ──────────────────────────────────────────────────
  let configPromise: Promise<{ config: any; methods: any[] }> | null = null;
  function getWidgetData(origin: string, appId: string): Promise<{ config: any; methods: any[] }> {
    if (!configPromise) {
      configPromise = fetch(`${origin}/api/public/widget/${appId}`)
        .then(r => { if (!r.ok) throw new Error('Widget not found or not published.'); return r.json(); })
        .catch(err => {
          configPromise = null;
          throw err;
        });
    }
    return configPromise;
  }

  // ─── Initialize Full Checkout Widget ─────────────────────────────────────────
  function initCheckoutWidget() {
    const container = document.getElementById('pakpayment-widget');
    if (!container || container.hasAttribute('data-pp-init')) return;

    const params = getParams();
    if (!params) return;
    const { appId, origin } = params;

    container.setAttribute('data-pp-init', 'true');
    const shadow = container.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    const root = document.createElement('div');
    shadow.appendChild(root);
    root.innerHTML = `<div class="pp-root"><div class="pp-state">Loading payment options…</div></div>`;

    const sessionId = container.getAttribute('data-session') || new URLSearchParams(window.location.search).get('session') || '';

    if (sessionId) {
      fetch(`${origin}/api/public/session/${sessionId}`)
        .then(r => { if (!r.ok) throw new Error('Payment session expired or invalid.'); return r.json(); })
        .then(({ config, methods, order }) => {
          renderWidget(root, origin, appId, config, methods, shadow, order);
          fetch(`${origin}/api/public/widget/${appId}/event`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ type: 'view' }), mode: 'no-cors',
          }).catch(() => {});
        })
        .catch((err: Error) => {
          root.innerHTML = `<div class="pp-root"><div class="pp-state">⚠️ ${escHtml(err.message)}</div></div>`;
        });
      return;
    }

    getWidgetData(origin, appId)
      .then(({ config, methods }) => {
        renderWidget(root, origin, appId, config, methods, shadow);
        fetch(`${origin}/api/public/widget/${appId}/event`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ type: 'view' }), mode: 'no-cors',
        }).catch(() => {});
      })
      .catch((err: Error) => {
        root.innerHTML = `<div class="pp-root"><div class="pp-state">⚠️ ${escHtml(err.message)}</div></div>`;
      });
  }

  // ─── Initialize Direct Product Order Buttons ─────────────────────────────────
  function initOrderButtons() {
    const containers = document.querySelectorAll<HTMLElement>(
      '#pakpayment-order-button, [data-pakpayment-order], .pakpayment-order-button, .pakpayment-order-btn'
    );
    if (containers.length === 0) return;

    const params = getParams();
    if (!params) return;
    const { appId, origin } = params;

    getWidgetData(origin, appId)
      .then(({ config }) => {
        containers.forEach(el => {
          renderOrderButton(el, origin, appId, config);
        });
      })
      .catch(() => {});
  }

  function initAll() {
    initCheckoutWidget();
    initOrderButtons();
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  function renderWidget(
    root: HTMLElement, origin: string, appId: string,
    config: any, methods: any[], shadow: ShadowRoot,
    lockedOrder?: any
  ) {
    if (!methods || methods.length === 0) {
      root.innerHTML = `<div class="pp-root"><div class="pp-state">No payment methods configured yet.</div></div>`;
      return;
    }

    // ── Resolve colors from publishedConfig ──
    const bg       = (config?.backgroundColor || '#000000').trim();
    const accent   = (config?.primaryColor    || '#CCFF00').trim();
    const textCol  = (config?.textColor       || '#ffffff').trim();
    const radius   = (config?.borderRadius    || '16px').trim();
    const accentText = isLight(accent) ? '#000' : '#fff';
    const accentRgb  = hexToRgb(accent);
    const bgIsLight  = isLight(bg);
    const surfaceCol   = bgIsLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
    const surfaceHover = bgIsLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)';
    const borderCol    = bgIsLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
    const mutedCol     = bgIsLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)';

    const cssVarEl = document.createElement('style');
    cssVarEl.textContent = `:host {
      --pp-bg: ${bg};
      --pp-accent: ${accent};
      --pp-accent-text: ${accentText};
      --pp-accent-ring: rgba(${accentRgb}, 0.15);
      --pp-accent-bg: rgba(${accentRgb}, 0.07);
      --pp-text: ${textCol};
      --pp-text-muted: ${mutedCol};
      --pp-surface: ${surfaceCol};
      --pp-surface-hover: ${surfaceHover};
      --pp-border: ${borderCol};
      --pp-radius: ${radius};
    }`;
    shadow.insertBefore(cssVarEl, shadow.firstChild);

    // ── Config values ──
    const bizName       = config?.businessName      || '';
    const widgetTitle   = config?.widgetTitle       || 'Select Payment Method';
    const subtitle      = config?.widgetSubtitle    || '';
    const notice        = config?.instructionNotice || '';
    const rawWaNumber   = config?.whatsappNumber    || '';
    const waTemplate    = config?.whatsappTemplate  || '';
    const merchantEmail = config?.fallbackEmail     || '';

    const isLocked = Boolean(lockedOrder);
    const preAmount = lockedOrder?.amount ? String(lockedOrder.amount) : getInitialAmount();
    const preOrder = lockedOrder?.orderId || '';
    let selectedIdx = -1;

    // ── Method cards HTML ──
    const cardsHTML = methods.map((m: any, i: number) => {
      const provider     = m.provider || m.methodName || 'Unknown';
      const displayName  = formatProvider(provider);
      const color        = providerColor(provider);
      const init         = initials(provider);
      const isLast       = i === methods.length - 1;
      const onlyChild    = methods.length === 1;
      const cls          = onlyChild ? 'only-child' : isLast ? 'is-last' : '';
      return `
        <div class="pp-method-card ${cls}" data-index="${i}" role="radio" aria-checked="false" tabindex="0">
          <div class="pp-radio"><div class="pp-radio-dot"></div></div>
          <div class="pp-method-icon" style="background:${color}">${escHtml(init)}</div>
          <div style="flex:1">
            <div class="pp-method-name">${escHtml(displayName)}</div>
            <div class="pp-method-acct">${escHtml(m.accountName || '')}</div>
          </div>
        </div>
        <div class="pp-detail" data-detail="${i}">
          <div class="pp-detail-label">Transfer Account / IBAN</div>
          <div class="pp-acct-row">
            <span class="pp-acct-num">${escHtml(m.accountNumber || '')}</span>
            <button class="pp-copy-btn" data-copy="${escHtml(m.accountNumber || '')}">&#x2398; Copy</button>
          </div>
          ${notice ? `<div class="pp-notice">${escHtml(notice)}</div>` : ''}
        </div>
      `;
    }).join('');

    // ── Main HTML ──
    root.innerHTML = `
      <div class="pp-root">

        ${bizName ? `
        <div class="pp-header">
          <div class="pp-biz-name">${escHtml(bizName)}</div>
          <div class="pp-biz-sub">${escHtml(widgetTitle)}</div>
          ${subtitle ? `<div class="pp-biz-desc">${escHtml(subtitle)}</div>` : ''}
        </div>` : `
        <div style="margin-bottom:16px;">
          <div class="pp-section-label">1. ${escHtml(widgetTitle)}</div>
        </div>`}

        ${isLocked ? `
        <div style="margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#10b981;">
          <span>🛡️ Server-Verified Order Session</span>
          <span style="font-family:monospace;opacity:0.8;">${escHtml(preOrder)}</span>
        </div>` : ''}

        <div class="pp-section-label" style="margin-bottom:8px;">1. Transfer to Merchant Account</div>
        <div class="pp-methods" id="pp-methods">${cardsHTML}</div>

        <hr class="pp-divider" />

        <div class="pp-form" id="pp-form">

          <div class="pp-section-label">2. Transaction Reference / TRX ID</div>

          <div class="pp-field">
            <input id="pp-ref" class="pp-input" type="text" placeholder="e.g. TID-987654321 from your receipt" />
            <div class="pp-err-text" id="pp-ref-err">Please enter your TRX / Transaction ID.</div>
          </div>

          <div class="pp-field">
            <label>Sender Account Title / Name</label>
            <input id="pp-name" class="pp-input" type="text" placeholder="e.g. Ali Khan" value="${escHtml(lockedOrder?.customerName || '')}" />
            <div class="pp-field-hint">Must match the account title on your JazzCash, EasyPaisa, or Bank app.</div>
            <div class="pp-err-text" id="pp-name-err">Please enter the sender's account name.</div>
          </div>

          <div class="pp-field">
            <label>Amount ${isLocked ? '<span style="color:#10b981;font-size:10px;text-transform:none;letter-spacing:0;font-weight:700;">(🛡️ Locked by Merchant)</span>' : '<span class="pp-optional">(optional)</span>'}</label>
            <div class="pp-amount-wrap">
              <span class="pp-prefix">PKR</span>
              <input id="pp-amount" class="pp-input indent" type="number" placeholder="0.00" value="${escHtml(preAmount)}" min="1" ${isLocked ? 'readonly disabled style="opacity:0.85;background:rgba(16,185,129,0.06);border-color:#10b981;"' : ''} />
            </div>
          </div>

          <div class="pp-field">
            <label>Order / Reference ${isLocked ? '<span style="color:#10b981;font-size:10px;text-transform:none;letter-spacing:0;font-weight:700;">(🛡️ Locked)</span>' : '<span class="pp-optional">(optional)</span>'}</label>
            <input id="pp-order" class="pp-input" type="text" placeholder="e.g. Order #1029" value="${escHtml(preOrder)}" ${isLocked ? 'readonly disabled style="opacity:0.85;"' : ''} />
          </div>

          <div class="pp-two-col">
            <div class="pp-field">
              <label>Your WhatsApp Number</label>
              <input id="pp-wa" class="pp-input" type="tel" placeholder="e.g. 03334098558" />
              <div class="pp-field-hint">For direct order updates from merchant.</div>
              <div class="pp-err-text" id="pp-wa-err">Please enter your WhatsApp number.</div>
            </div>
            <div class="pp-field">
              <label>Your Email Address</label>
              <input id="pp-email" class="pp-input" type="email" placeholder="e.g. you@gmail.com" />
              <div class="pp-field-hint">For receipt & confirmation emails.</div>
              <div class="pp-err-text" id="pp-email-err">Please enter a valid email address.</div>
            </div>
          </div>

          <button class="pp-submit" id="pp-btn" disabled>
            ↑ Select a payment method first
          </button>
          <div class="pp-global-err" id="pp-global-err"></div>

          <div class="pp-submit-meta" id="pp-meta" style="display:none">
            <div class="pp-submit-meta-line" id="pp-wa-meta"></div>
            ${merchantEmail ? `<div class="pp-submit-meta-line">✉ <a href="mailto:${escHtml(merchantEmail)}" id="pp-email-alt">Send Confirmation via Email (${escHtml(merchantEmail)})</a></div>` : ''}
          </div>

        </div>

        <div class="pp-footer">
          <span class="pp-footer-left">Zero Custody Architecture</span>
          <span class="pp-footer-right">Powered by <a href="${origin}" target="_blank" rel="noopener">Pak Payment</a></span>
        </div>

      </div>
    `;

    // ─── Wire method selection ───────────────────────────────────────────────
    root.querySelectorAll('.pp-method-card').forEach(card => {
      const select = () => {
        const idx = parseInt((card as HTMLElement).dataset.index || '-1');
        if (idx < 0) return;

        root.querySelectorAll('.pp-method-card').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        root.querySelectorAll('.pp-detail').forEach(d => (d as HTMLElement).classList.remove('visible'));

        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        root.querySelector(`.pp-detail[data-detail="${idx}"]`)?.classList.add('visible');

        selectedIdx = idx;
        const provider    = methods[idx].provider || methods[idx].methodName || 'unknown';
        const displayName = formatProvider(provider);

        const btn = root.querySelector('#pp-btn') as HTMLButtonElement;
        btn.disabled = false;
        btn.innerHTML = `&#9646; I've Paid &mdash; Confirm via WhatsApp`;

        if (rawWaNumber) {
          const metaDiv = root.querySelector('#pp-meta') as HTMLElement;
          const metaLine = root.querySelector('#pp-wa-meta') as HTMLElement;
          metaDiv.style.display = 'block';
          metaLine.textContent = `Direct WhatsApp chat will open with ${rawWaNumber}`;
        }
      };

      card.addEventListener('click', select);
      card.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') { e.preventDefault(); select(); }
      });
    });

    // ─── Copy buttons ────────────────────────────────────────────────────────
    root.querySelectorAll('.pp-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const text = (btn as HTMLElement).dataset.copy || '';
        navigator.clipboard?.writeText(text).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = '⎘ Copy'; }, 1800);
        }).catch(() => {});
      });
    });

    // ─── Submit ──────────────────────────────────────────────────────────────
    root.querySelector('#pp-btn')?.addEventListener('click', async () => {
      if (selectedIdx < 0) return;

      const get  = (id: string) => ((root.querySelector(id) as HTMLInputElement)?.value || '').trim();
      const show = (id: string, v: boolean) => { const el = root.querySelector(id) as HTMLElement; if (el) el.style.display = v ? 'block' : 'none'; };

      const ref    = get('#pp-ref');
      const name   = get('#pp-name');
      const wa     = get('#pp-wa');
      const email  = get('#pp-email');
      const amount = get('#pp-amount');
      const order  = get('#pp-order');

      let ok = true;
      show('#pp-ref-err',   !ref);   if (!ref)   ok = false;
      show('#pp-name-err',  !name);  if (!name)  ok = false;
      show('#pp-wa-err',    !wa);    if (!wa)    ok = false;
      show('#pp-email-err', !email); if (!email) ok = false;
      if (!ok) return;

      const btn      = root.querySelector('#pp-btn') as HTMLButtonElement;
      const globalErr= root.querySelector('#pp-global-err') as HTMLElement;
      btn.disabled = true;
      btn.innerHTML = 'Submitting…';
      globalErr.style.display = 'none';

      const method      = methods[selectedIdx];
      const provider    = method.provider || method.methodName || 'unknown';
      const displayName = formatProvider(provider);

      // Build structured message and direct WhatsApp URL
      const formattedMessage = buildFormattedMessage(waTemplate, {
        amount,
        orderId: order || 'Direct Payment',
        method: displayName,
        ref,
        name,
        whatsapp: wa,
        email,
      });

      const waDirectUrl = rawWaNumber ? buildWhatsAppDirectUrl(rawWaNumber, formattedMessage) : '';

      // ── Open WhatsApp immediately in new tab on user click (avoids browser popup blocker) ──
      if (waDirectUrl) {
        window.open(waDirectUrl, '_blank');
      }

      try {
        const res = await fetch(`${origin}/api/public/widget/${appId}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: lockedOrder?.sessionId || undefined,
            methodUsed: provider,
            reference: ref,
            senderName: name,
            customerWhatsApp: wa,
            customerEmail: email,
            contactChannel: 'whatsapp',
            amount: isLocked ? parseFloat(preAmount) : (amount ? parseFloat(amount) : null),
            orderId: isLocked ? preOrder : (order || undefined),
            currency: 'PKR',
          }),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          const msg = Array.isArray(d?.error) ? d.error[0]?.message : (d?.error || 'Submission failed. Please try again.');
          globalErr.textContent = msg;
          globalErr.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = `&#9646; I've Paid &mdash; Confirm via WhatsApp`;
          return;
        }

        // ── Render Golden Confirmation Card on Current Tab (NO Timer, NO Redirect, Tab Stays Open) ──
        root.innerHTML = `
          <div class="pp-root">
            <div class="pp-success" style="position: relative;">
              <button class="pp-close-btn" id="pp-close-btn" title="Reset and new payment" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 22px; color: #f59e0b; cursor: pointer; padding: 4px; line-height: 1;">&times;</button>
              
              <div class="pp-success-icon">⏳</div>
              <h3>Payment Request Submitted!</h3>
              <p style="font-size: 13px; color: var(--pp-text, #fff); margin-top: 4px;">
                Thank you, <strong>${escHtml(name)}</strong>.<br/>
                Your payment reference has been recorded and submitted to the merchant dashboard.
              </p>

              <div class="pp-claim-summary">
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Order Reference:</span>
                  <span class="pp-summary-val">${escHtml(order || 'Direct Payment')}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Amount:</span>
                  <span class="pp-summary-val" style="color:#f59e0b;">PKR ${amount ? Number(amount).toLocaleString() : 'Custom'}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Method:</span>
                  <span class="pp-summary-val">${escHtml(displayName)}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Reference (TRX ID):</span>
                  <span class="pp-summary-val">${escHtml(ref)}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Status:</span>
                  <span class="pp-summary-status">Pending Merchant Approval</span>
                </div>
              </div>

              <div class="pp-golden-notice">
                ✨ <strong>Verification in Progress:</strong> WhatsApp chat opened in a new tab. Send your payment screenshot to the merchant. Once approved from the dashboard, you will receive confirmation on WhatsApp ${email ? 'and email' : ''}.
              </div>

              ${waDirectUrl ? `
                <div style="margin-top: 14px;">
                  <a class="pp-btn-open-wa" href="${escHtml(waDirectUrl)}" target="_blank" rel="noopener noreferrer" style="width: 100%; box-sizing: border-box; text-decoration: none;">
                    💬 Open WhatsApp Chat Again →
                  </a>
                </div>
              ` : ''}

              <div style="margin-top: 10px;">
                <button type="button" class="pp-btn-stay" id="pp-btn-reset" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; cursor: pointer;">
                  ↺ Make Another Payment (Reset Form)
                </button>
              </div>
            </div>

            <div class="pp-footer">
              <span class="pp-footer-left">Zero Custody Architecture</span>
              <span class="pp-footer-right">Powered by <a href="${origin}" target="_blank" rel="noopener">Pak Payment</a></span>
            </div>
          </div>
        `;

        const resetForm = () => renderWidget(root, origin, appId, config, methods, shadow);
        root.querySelector('#pp-close-btn')?.addEventListener('click', resetForm);
        root.querySelector('#pp-btn-reset')?.addEventListener('click', resetForm);

        // Fire analytics beacon
        fetch(`${origin}/api/public/widget/${appId}/event`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ type: 'confirmation_sent', method: provider }),
          mode: 'no-cors',
        }).catch(() => {});

      } catch (_) {
        globalErr.textContent = 'Network error. Please check your connection and try again.';
        globalErr.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `&#9646; I've Paid &mdash; Confirm via WhatsApp`;
      }
    });
  }

  // ─── Boot ────────────────────────────────────────────────────────────────────
  function boot() {
    initAll();
    // Watch for dynamically added containers in SPAs like React/Next.js
    const observer = new MutationObserver(() => {
      const checkoutEl = document.getElementById('pakpayment-widget');
      const orderBtns = document.querySelectorAll(
        '#pakpayment-order-button:not([data-pp-order-init]), [data-pakpayment-order]:not([data-pp-order-init]), .pakpayment-order-button:not([data-pp-order-init]), .pakpayment-order-btn:not([data-pp-order-init])'
      );
      if ((checkoutEl && !checkoutEl.hasAttribute('data-pp-init')) || orderBtns.length > 0) {
        initAll();
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  // Expose global SDK object for manual/programmatic integration
  (window as any).PakPayment = {
    init: initAll,
    initCheckout: initCheckoutWidget,
    initOrderButtons: initOrderButtons,
  };
  (window as any).pakPayment = (window as any).PakPayment;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
