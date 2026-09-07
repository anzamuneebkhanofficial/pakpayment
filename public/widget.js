"use strict";(()=>{(function(){function _(){let t=document.querySelectorAll("script[src]");for(let e=t.length-1;e>=0;e--){let r=t[e].src;if(r&&(r.includes("widget.js")||r.includes("pakpayment")))try{let n=new URL(r,window.location.href),p=n.searchParams.get("appId");if(p)return{appId:p,origin:n.origin}}catch{}}return null}function ae(){try{return new URLSearchParams(window.location.search).get("amount")||""}catch{return""}}function o(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pe(t){let e=t.replace("#",""),r=parseInt(e.slice(0,2),16),n=parseInt(e.slice(2,4),16),p=parseInt(e.slice(4,6),16);return`${r}, ${n}, ${p}`}function j(t){let e=t.replace("#",""),r=parseInt(e.slice(0,2),16),n=parseInt(e.slice(2,4),16),p=parseInt(e.slice(4,6),16);return(r*299+n*587+p*114)/1e3>155}function oe(t){let e=(t||"").replace(/[^0-9]/g,"");return e.startsWith("0092")?e=e.substring(2):e.startsWith("0")?e="92"+e.substring(1):e.startsWith("92")?e=e:e.length===10&&(e="92"+e),e}let D={jazzcash:"#E91E63",jazz_cash:"#E91E63",easypaisa:"#4CAF50",easy_paisa:"#4CAF50",bank:"#1565C0",bank_transfer:"#1565C0",sadapay:"#00BCD4",nayapay:"#FF6F00",upaisa:"#9C27B0"};function ie(t){let e=(t||"").toLowerCase().replace(/[\s-]/g,"_");if(D[e])return D[e];for(let[r,n]of Object.entries(D))if(e.includes(r)||r.includes(e))return n;return"#374151"}function L(t){return t?t.replace(/[_-]/g," ").replace(/\b\w/g,e=>e.toUpperCase()):"Unknown"}function se(t){return L(t).split(" ").slice(0,2).map(e=>e[0]).join("").toUpperCase()}function ce(t,e){let r=t||"";(!r||r.trim()==="Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.")&&(r=`Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}.
\u2022 Transaction Reference (TRX ID): {{REF}}
\u2022 Sender Account Title / Name: {{NAME}}
\u2022 Customer WhatsApp: {{WHATSAPP}}
\u2022 Customer Email: {{EMAIL}}

I have attached my transfer receipt screenshot below. Please verify and confirm my order. Thank you!`);let n=e.amount?`PKR ${Number(e.amount).toLocaleString()}`:"Custom";return r=r.replace(/\{\{AMOUNT\}\}/g,n).replace(/\{\{ORDER_ID\}\}/g,e.orderId||"Direct Payment").replace(/\{\{METHOD\}\}/g,e.method||"Direct Transfer").replace(/\{\{REF\}\}/g,e.ref||"N/A").replace(/\{\{NAME\}\}/g,e.name||"N/A").replace(/\{\{SENDER\}\}/g,e.name||"N/A").replace(/\{\{WHATSAPP\}\}/g,e.whatsapp||"N/A").replace(/\{\{CUSTOMER_WHATSAPP\}\}/g,e.whatsapp||"N/A").replace(/\{\{EMAIL\}\}/g,e.email||"N/A").replace(/\{\{CUSTOMER_EMAIL\}\}/g,e.email||"N/A"),!r.includes(e.ref)&&e.ref&&(r+=`
\u2022 Transaction Reference: ${e.ref}`),!r.includes(e.name)&&e.name&&(r+=`
\u2022 Sender Name: ${e.name}`),!r.includes(e.whatsapp)&&e.whatsapp&&(r+=`
\u2022 Customer WhatsApp: ${e.whatsapp}`),!r.includes(e.email)&&e.email&&(r+=`
\u2022 Customer Email: ${e.email}`),r}function B(t,e){let r=oe(t);return!r||r.length<10?"":`https://api.whatsapp.com/send?phone=${r}&text=${encodeURIComponent(e)}`}function de(t){let e=t.closest('.product-card, .product, .product-single, article, section, [itemtype*="Product"], form, main, .item, .card')||t.parentElement||document.body,r=t.getAttribute("data-product-name")||t.getAttribute("data-name")||t.getAttribute("data-title")||"",n=t.getAttribute("data-product-price")||t.getAttribute("data-price")||t.getAttribute("data-amount")||"",p=t.getAttribute("data-product-desc")||t.getAttribute("data-description")||t.getAttribute("data-desc")||"",c=t.getAttribute("data-product-sku")||t.getAttribute("data-sku")||"",d=t.getAttribute("data-product-qty")||t.getAttribute("data-quantity")||t.getAttribute("data-qty")||"",g=t.getAttribute("data-product-url")||t.getAttribute("data-url")||window.location.href;if(!r){let a=e.querySelector('h1:not(.site-title):not(.store-title):not(.logo), h2, h3, .product-title, .product_title, .product-name, [itemprop="name"]');if(a&&a.textContent)r=a.textContent.trim();else{let i=document.querySelector('meta[property="og:title"]')?.getAttribute("content");if(i&&!i.toLowerCase().includes("demo store"))r=i.trim();else{let u=document.querySelector("h1.product_title, h1.product-title, .product-title, h1");u&&u.textContent&&!u.textContent.toLowerCase().includes("demo store")?r=u.textContent.trim():r=document.title?document.title.split(/[-–|]/)[0].trim():"Product"}}}if(!p){let a=e.querySelector('.product-description, .product-desc, .description, [itemprop="description"], p');if(a&&a.textContent){let i=a.textContent.trim();p=i.length>140?i.substring(0,137)+"...":i}else{let i=document.querySelector('meta[property="og:description"]')?.getAttribute("content");i&&(p=i.length>140?i.substring(0,137)+"...":i.trim())}}if(!n){let a=e.querySelector(".price .amount, .product-price, .price-item--regular, .price ins, .price, .woocommerce-Price-amount");if(a&&a.textContent)n=a.textContent.replace(/[^\d.,]/g,"").trim();else{let i=document.querySelector('meta[property="product:price:amount"], meta[property="og:price:amount"]')?.getAttribute("content");if(i)n=i.replace(/[^\d.,]/g,"").trim();else try{let u=document.querySelectorAll('script[type="application/ld+json"]');for(let P=0;P<u.length;P++){let x=JSON.parse(u[P].textContent||"{}"),C=Array.isArray(x)?x:[x,...x["@graph"]||[]];for(let y of C)if(y["@type"]==="Product"&&y.offers){let I=y.offers.price||(Array.isArray(y.offers)?y.offers[0]?.price:"");if(I){n=String(I).replace(/[^\d.,]/g,"").trim();break}}if(n)break}}catch{}}}if(n&&(n=n.replace(/^(PKR|Rs\.?|₨)\s*/i,"").trim()),!c){let a=e.querySelector('.sku, [itemprop="sku"], .product-sku');a&&a.textContent&&(c=a.textContent.replace(/SKU:?/i,"").trim())}if(!d){let a=e.querySelector('input[name="quantity"], input.qty, input[name="qty"]');a&&a.value?d=a.value:d="1"}return{name:r,price:n,description:p,sku:c,quantity:d,url:g}}function le(t,e){let r=t||"";(!r||r.trim()==="")&&(r=`Hello! I would like to order {{PRODUCT_NAME}} for PKR {{PRICE}}.
\u2022 Description: {{DESCRIPTION}}
\u2022 Product Link: {{URL}}
\u2022 SKU: {{SKU}}
\u2022 Quantity: {{QUANTITY}}

Please confirm availability and details. Thank you!`);let n=e.price?e.price:"As Listed";return r=r.replace(/\{\{PRODUCT_NAME\}\}/g,e.name||"Product").replace(/\{\{PRODUCT\}\}/g,e.name||"Product").replace(/\{\{PRICE\}\}/g,n).replace(/\{\{AMOUNT\}\}/g,n).replace(/\{\{DESCRIPTION\}\}/g,e.description||"").replace(/\{\{DESC\}\}/g,e.description||"").replace(/\{\{URL\}\}/g,e.url||window.location.href).replace(/\{\{LINK\}\}/g,e.url||window.location.href).replace(/\{\{SKU\}\}/g,e.sku||"").replace(/\{\{QUANTITY\}\}/g,e.quantity||"1").replace(/\{\{QTY\}\}/g,e.quantity||"1"),r=r.split(`
`).filter(p=>{let c=p.trim();return!(c==="\u2022 SKU:"||c==="\u2022 SKU: N/A"||c==="\u2022 SKU: undefined"||c==="\u2022 Description:"||c==="\u2022 Description: N/A"||c==="\u2022 Description: undefined")}).join(`
`),r}function ue(t,e,r,n){if(t.hasAttribute("data-pp-order-init"))return;t.setAttribute("data-pp-order-init","true");let p=n?.whatsappNumber||"";if(!p)return;if(n?.enableWhatsAppOrderButton===!1){t.style.display="none";return}let c=o(n?.whatsAppOrderButtonText||"Order through WhatsApp"),d=n?.whatsAppOrderTemplate||"",g=t.attachShadow({mode:"open"});g.innerHTML=`
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
        <span>${c}</span>
      </button>
    `,g.querySelector("#pp-order-btn")?.addEventListener("click",()=>{let a=de(t),i=le(d,a),u=B(p,i);u&&(window.open(u,"_blank"),fetch(`${e}/api/public/widget/${r}/event`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"whatsapp_order_click",product:a.name}),mode:"no-cors"}).catch(()=>{}))})}let me=`
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

    /* \u2500\u2500 Header / Branding \u2500\u2500 */
    .pp-header { text-align: center; margin-bottom: 22px; }
    .pp-biz-name { font-size: 20px; font-weight: 800; color: var(--pp-text, #fff); letter-spacing: -0.3px; }
    .pp-biz-sub { font-size: 12px; color: var(--pp-text-muted, #888); margin-top: 3px; }
    .pp-biz-desc { font-size: 12px; color: var(--pp-text-muted, #888); }

    /* \u2500\u2500 Section labels \u2500\u2500 */
    .pp-section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--pp-text-muted, #888);
      margin-bottom: 10px;
    }

    /* \u2500\u2500 Method cards \u2500\u2500 */
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

    /* \u2500\u2500 Account detail box \u2500\u2500 */
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

    /* \u2500\u2500 Form \u2500\u2500 */
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

    /* \u2500\u2500 Submit button \u2500\u2500 */
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

    /* \u2500\u2500 Divider \u2500\u2500 */
    .pp-divider { border: none; border-top: 1px solid var(--pp-border, #222); margin: 18px 0; }

    /* \u2500\u2500 Golden Success & Confirmation Card \u2500\u2500 */
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

    /* \u2500\u2500 Footer \u2500\u2500 */
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
  `,M=null;function K(t,e){return M||(M=fetch(`${t}/api/public/widget/${e}`).then(r=>{if(!r.ok)throw new Error("Widget not found or not published.");return r.json()}).catch(r=>{throw M=null,r})),M}function Y(){let t=document.getElementById("pakpayment-widget");if(!t||t.hasAttribute("data-pp-init"))return;let e=_();if(!e)return;let{appId:r,origin:n}=e;t.setAttribute("data-pp-init","true");let p=t.attachShadow({mode:"open"}),c=document.createElement("style");c.textContent=me,p.appendChild(c);let d=document.createElement("div");p.appendChild(d),d.innerHTML='<div class="pp-root"><div class="pp-state">Loading payment options\u2026</div></div>';let g=t.getAttribute("data-session")||new URLSearchParams(window.location.search).get("session")||"";if(g){fetch(`${n}/api/public/session/${g}`).then(a=>{if(!a.ok)throw new Error("Payment session expired or invalid.");return a.json()}).then(({config:a,methods:i,order:u})=>{q(d,n,r,a,i,p,u),fetch(`${n}/api/public/widget/${r}/event`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"view"}),mode:"no-cors"}).catch(()=>{})}).catch(a=>{d.innerHTML=`<div class="pp-root"><div class="pp-state">\u26A0\uFE0F ${o(a.message)}</div></div>`});return}K(n,r).then(({config:a,methods:i})=>{q(d,n,r,a,i,p),fetch(`${n}/api/public/widget/${r}/event`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"view"}),mode:"no-cors"}).catch(()=>{})}).catch(a=>{d.innerHTML=`<div class="pp-root"><div class="pp-state">\u26A0\uFE0F ${o(a.message)}</div></div>`})}function J(){let t=document.querySelectorAll("#pakpayment-order-button, [data-pakpayment-order], .pakpayment-order-button, .pakpayment-order-btn");if(t.length===0)return;let e=_();if(!e)return;let{appId:r,origin:n}=e;K(n,r).then(({config:p})=>{t.forEach(c=>{ue(c,n,r,p)})}).catch(()=>{})}function O(){Y(),J()}function q(t,e,r,n,p,c,d){if(!p||p.length===0){t.innerHTML='<div class="pp-root"><div class="pp-state">No payment methods configured yet.</div></div>';return}let g=(n?.backgroundColor||"#000000").trim(),a=(n?.primaryColor||"#CCFF00").trim(),i=(n?.textColor||"#ffffff").trim(),u=(n?.borderRadius||"16px").trim(),P=j(a)?"#000":"#fff",x=pe(a),C=j(g),y=C?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)",I=C?"rgba(0,0,0,0.07)":"rgba(255,255,255,0.08)",fe=C?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.1)",be=C?"rgba(0,0,0,0.45)":"rgba(255,255,255,0.45)",V=document.createElement("style");V.textContent=`:host {
      --pp-bg: ${g};
      --pp-accent: ${a};
      --pp-accent-text: ${P};
      --pp-accent-ring: rgba(${x}, 0.15);
      --pp-accent-bg: rgba(${x}, 0.07);
      --pp-text: ${i};
      --pp-text-muted: ${be};
      --pp-surface: ${y};
      --pp-surface-hover: ${I};
      --pp-border: ${fe};
      --pp-radius: ${u};
    }`,c.insertBefore(V,c.firstChild);let X=n?.businessName||"",Z=n?.widgetTitle||"Select Payment Method",G=n?.widgetSubtitle||"",ee=n?.instructionNotice||"",N=n?.whatsappNumber||"",ge=n?.whatsappTemplate||"",H=n?.fallbackEmail||"",v=!!d,te=d?.amount?String(d.amount):ae(),F=d?.orderId||"",U=-1,he=p.map((s,f)=>{let l=s.provider||s.methodName||"Unknown",b=L(l),w=ie(l),h=se(l),m=f===p.length-1;return`
        <div class="pp-method-card ${p.length===1?"only-child":m?"is-last":""}" data-index="${f}" role="radio" aria-checked="false" tabindex="0">
          <div class="pp-radio"><div class="pp-radio-dot"></div></div>
          <div class="pp-method-icon" style="background:${w}">${o(h)}</div>
          <div style="flex:1">
            <div class="pp-method-name">${o(b)}</div>
            <div class="pp-method-acct">${o(s.accountName||"")}</div>
          </div>
        </div>
        <div class="pp-detail" data-detail="${f}">
          <div class="pp-detail-label">Transfer Account / IBAN</div>
          <div class="pp-acct-row">
            <span class="pp-acct-num">${o(s.accountNumber||"")}</span>
            <button class="pp-copy-btn" data-copy="${o(s.accountNumber||"")}">&#x2398; Copy</button>
          </div>
          ${ee?`<div class="pp-notice">${o(ee)}</div>`:""}
        </div>
      `}).join("");t.innerHTML=`
      <div class="pp-root">

        ${X?`
        <div class="pp-header">
          <div class="pp-biz-name">${o(X)}</div>
          <div class="pp-biz-sub">${o(Z)}</div>
          ${G?`<div class="pp-biz-desc">${o(G)}</div>`:""}
        </div>`:`
        <div style="margin-bottom:16px;">
          <div class="pp-section-label">1. ${o(Z)}</div>
        </div>`}

        ${v?`
        <div style="margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#10b981;">
          <span>\u{1F6E1}\uFE0F Server-Verified Order Session</span>
          <span style="font-family:monospace;opacity:0.8;">${o(F)}</span>
        </div>`:""}

        <div class="pp-section-label" style="margin-bottom:8px;">1. Transfer to Merchant Account</div>
        <div class="pp-methods" id="pp-methods">${he}</div>

        <hr class="pp-divider" />

        <div class="pp-form" id="pp-form">

          <div class="pp-section-label">2. Transaction Reference / TRX ID</div>

          <div class="pp-field">
            <input id="pp-ref" class="pp-input" type="text" placeholder="e.g. TID-987654321 from your receipt" />
            <div class="pp-err-text" id="pp-ref-err">Please enter your TRX / Transaction ID.</div>
          </div>

          <div class="pp-field">
            <label>Sender Account Title / Name</label>
            <input id="pp-name" class="pp-input" type="text" placeholder="e.g. Ali Khan" value="${o(d?.customerName||"")}" />
            <div class="pp-field-hint">Must match the account title on your JazzCash, EasyPaisa, or Bank app.</div>
            <div class="pp-err-text" id="pp-name-err">Please enter the sender's account name.</div>
          </div>

          <div class="pp-field">
            <label>Amount ${v?'<span style="color:#10b981;font-size:10px;text-transform:none;letter-spacing:0;font-weight:700;">(\u{1F6E1}\uFE0F Locked by Merchant)</span>':'<span class="pp-optional">(optional)</span>'}</label>
            <div class="pp-amount-wrap">
              <span class="pp-prefix">PKR</span>
              <input id="pp-amount" class="pp-input indent" type="number" placeholder="0.00" value="${o(te)}" min="1" ${v?'readonly disabled style="opacity:0.85;background:rgba(16,185,129,0.06);border-color:#10b981;"':""} />
            </div>
          </div>

          <div class="pp-field">
            <label>Order / Reference ${v?'<span style="color:#10b981;font-size:10px;text-transform:none;letter-spacing:0;font-weight:700;">(\u{1F6E1}\uFE0F Locked)</span>':'<span class="pp-optional">(optional)</span>'}</label>
            <input id="pp-order" class="pp-input" type="text" placeholder="e.g. Order #1029" value="${o(F)}" ${v?'readonly disabled style="opacity:0.85;"':""} />
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
            \u2191 Select a payment method first
          </button>
          <div class="pp-global-err" id="pp-global-err"></div>

          <div class="pp-submit-meta" id="pp-meta" style="display:none">
            <div class="pp-submit-meta-line" id="pp-wa-meta"></div>
            ${H?`<div class="pp-submit-meta-line">\u2709 <a href="mailto:${o(H)}" id="pp-email-alt">Send Confirmation via Email (${o(H)})</a></div>`:""}
          </div>

        </div>

        <div class="pp-footer">
          <span class="pp-footer-left">Zero Custody Architecture</span>
          <span class="pp-footer-right">Powered by <a href="${e}" target="_blank" rel="noopener">Pak Payment</a></span>
        </div>

      </div>
    `,t.querySelectorAll(".pp-method-card").forEach(s=>{let f=()=>{let l=parseInt(s.dataset.index||"-1");if(l<0)return;t.querySelectorAll(".pp-method-card").forEach(m=>{m.classList.remove("selected"),m.setAttribute("aria-checked","false")}),t.querySelectorAll(".pp-detail").forEach(m=>m.classList.remove("visible")),s.classList.add("selected"),s.setAttribute("aria-checked","true"),t.querySelector(`.pp-detail[data-detail="${l}"]`)?.classList.add("visible"),U=l;let b=p[l].provider||p[l].methodName||"unknown",w=L(b),h=t.querySelector("#pp-btn");if(h.disabled=!1,h.innerHTML="&#9646; I've Paid &mdash; Confirm via WhatsApp",N){let m=t.querySelector("#pp-meta"),A=t.querySelector("#pp-wa-meta");m.style.display="block",A.textContent=`Direct WhatsApp chat will open with ${N}`}};s.addEventListener("click",f),s.addEventListener("keydown",l=>{let b=l;(b.key==="Enter"||b.key===" ")&&(l.preventDefault(),f())})}),t.querySelectorAll(".pp-copy-btn").forEach(s=>{s.addEventListener("click",f=>{f.stopPropagation();let l=s.dataset.copy||"";navigator.clipboard?.writeText(l).then(()=>{s.textContent="Copied!",setTimeout(()=>{s.textContent="\u2398 Copy"},1800)}).catch(()=>{})})}),t.querySelector("#pp-btn")?.addEventListener("click",async()=>{if(U<0)return;let s=k=>(t.querySelector(k)?.value||"").trim(),f=(k,R)=>{let E=t.querySelector(k);E&&(E.style.display=R?"block":"none")},l=s("#pp-ref"),b=s("#pp-name"),w=s("#pp-wa"),h=s("#pp-email"),m=s("#pp-amount"),A=s("#pp-order"),S=!0;if(f("#pp-ref-err",!l),l||(S=!1),f("#pp-name-err",!b),b||(S=!1),f("#pp-wa-err",!w),w||(S=!1),f("#pp-email-err",!h),h||(S=!1),!S)return;let T=t.querySelector("#pp-btn"),$=t.querySelector("#pp-global-err");T.disabled=!0,T.innerHTML="Submitting\u2026",$.style.display="none";let re=p[U],W=re.provider||re.methodName||"unknown",ne=L(W),xe=ce(ge,{amount:m,orderId:A||"Direct Payment",method:ne,ref:l,name:b,whatsapp:w,email:h}),z=N?B(N,xe):"";z&&window.open(z,"_blank");try{let k=await fetch(`${e}/api/public/widget/${r}/claim`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:d?.sessionId||void 0,methodUsed:W,reference:l,senderName:b,customerWhatsApp:w,customerEmail:h,contactChannel:"whatsapp",amount:v?parseFloat(te):m?parseFloat(m):null,orderId:v?F:A||void 0,currency:"PKR"})});if(!k.ok){let E=await k.json().catch(()=>({})),ye=Array.isArray(E?.error)?E.error[0]?.message:E?.error||"Submission failed. Please try again.";$.textContent=ye,$.style.display="block",T.disabled=!1,T.innerHTML="&#9646; I've Paid &mdash; Confirm via WhatsApp";return}t.innerHTML=`
          <div class="pp-root">
            <div class="pp-success" style="position: relative;">
              <button class="pp-close-btn" id="pp-close-btn" title="Reset and new payment" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 22px; color: #f59e0b; cursor: pointer; padding: 4px; line-height: 1;">&times;</button>
              
              <div class="pp-success-icon">\u23F3</div>
              <h3>Payment Request Submitted!</h3>
              <p style="font-size: 13px; color: var(--pp-text, #fff); margin-top: 4px;">
                Thank you, <strong>${o(b)}</strong>.<br/>
                Your payment reference has been recorded and submitted to the merchant dashboard.
              </p>

              <div class="pp-claim-summary">
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Order Reference:</span>
                  <span class="pp-summary-val">${o(A||"Direct Payment")}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Amount:</span>
                  <span class="pp-summary-val" style="color:#f59e0b;">PKR ${m?Number(m).toLocaleString():"Custom"}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Method:</span>
                  <span class="pp-summary-val">${o(ne)}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Reference (TRX ID):</span>
                  <span class="pp-summary-val">${o(l)}</span>
                </div>
                <div class="pp-summary-row">
                  <span class="pp-summary-label">Status:</span>
                  <span class="pp-summary-status">Pending Merchant Approval</span>
                </div>
              </div>

              <div class="pp-golden-notice">
                \u2728 <strong>Verification in Progress:</strong> WhatsApp chat opened in a new tab. Send your payment screenshot to the merchant. Once approved from the dashboard, you will receive confirmation on WhatsApp ${h?"and email":""}.
              </div>

              ${z?`
                <div style="margin-top: 14px;">
                  <a class="pp-btn-open-wa" href="${o(z)}" target="_blank" rel="noopener noreferrer" style="width: 100%; box-sizing: border-box; text-decoration: none;">
                    \u{1F4AC} Open WhatsApp Chat Again \u2192
                  </a>
                </div>
              `:""}

              <div style="margin-top: 10px;">
                <button type="button" class="pp-btn-stay" id="pp-btn-reset" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; cursor: pointer;">
                  \u21BA Make Another Payment (Reset Form)
                </button>
              </div>
            </div>

            <div class="pp-footer">
              <span class="pp-footer-left">Zero Custody Architecture</span>
              <span class="pp-footer-right">Powered by <a href="${e}" target="_blank" rel="noopener">Pak Payment</a></span>
            </div>
          </div>
        `;let R=()=>q(t,e,r,n,p,c);t.querySelector("#pp-close-btn")?.addEventListener("click",R),t.querySelector("#pp-btn-reset")?.addEventListener("click",R),fetch(`${e}/api/public/widget/${r}/event`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"confirmation_sent",method:W}),mode:"no-cors"}).catch(()=>{})}catch{$.textContent="Network error. Please check your connection and try again.",$.style.display="block",T.disabled=!1,T.innerHTML="&#9646; I've Paid &mdash; Confirm via WhatsApp"}})}function Q(){O();let t=new MutationObserver(()=>{let e=document.getElementById("pakpayment-widget"),r=document.querySelectorAll("#pakpayment-order-button:not([data-pp-order-init]), [data-pakpayment-order]:not([data-pp-order-init]), .pakpayment-order-button:not([data-pp-order-init]), .pakpayment-order-btn:not([data-pp-order-init])");(e&&!e.hasAttribute("data-pp-init")||r.length>0)&&O()});document.body?t.observe(document.body,{childList:!0,subtree:!0}):document.addEventListener("DOMContentLoaded",()=>{t.observe(document.body,{childList:!0,subtree:!0})})}window.PakPayment={init:O,initCheckout:Y,initOrderButtons:J},window.pakPayment=window.PakPayment,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Q):Q()})();})();
