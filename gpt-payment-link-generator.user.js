// ==UserScript==
// @name         GPT 支付链接生成器
// @namespace    http://tampermonkey.net/
// @version      1.5.2
// @description  在 ChatGPT 页面生成 Plus、Pro、Business 各地区订阅支付链接（短链/长链）
// @author       https://github.com/fangyuan99
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @updateURL    https://raw.githubusercontent.com/ryfineZ/tampermonkey-scripts/main/gpt-payment-link-generator.user.js
// @downloadURL  https://raw.githubusercontent.com/ryfineZ/tampermonkey-scripts/main/gpt-payment-link-generator.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── 配置：所有套餐 ──────────────────────────────────────────────
  const PLANS = [
    {
      id: 'plus_ph',
      label: 'GPT Plus',
      tag: '菲律宾区',
      badge: '5x',
      plan_name: 'chatgptplusplan',
      country: 'PH',
      currency: 'PHP',
      hasLong: true,
    },
    {
      id: 'plus_vn',
      label: 'GPT Plus',
      tag: '越南区',
      badge: 'Plus',
      plan_name: 'chatgptplusplan',
      country: 'VN',
      currency: 'VND',
      hasLong: true,
    },
    {
      id: 'plus_jp',
      label: 'GPT Plus',
      tag: '日本区',
      badge: '特惠',
      plan_name: 'chatgptplusplan',
      country: 'JP',
      currency: 'JPY',
      billing_country: 'US',
      billing_currency: 'USD',
      hasLong: true,
      forceHosted: true,
      promo_campaign: 'plus-1-month-free',
    },
    {
      id: 'pro_eg',
      label: 'GPT Pro',
      tag: '埃及区',
      badge: '5x',
      plan_name: 'chatgptprolite',
      country: 'EG',
      currency: 'EGP',
      hasLong: false,
    },
    {
      id: 'pro_ph',
      label: 'GPT Pro',
      tag: '菲律宾区',
      badge: '20x',
      plan_name: 'chatgptpro',
      country: 'PH',
      currency: 'PHP',
      hasLong: true,
    },
    {
      id: 'pro_vn',
      label: 'GPT Pro',
      tag: '越南区',
      badge: '20x',
      plan_name: 'chatgptpro',
      country: 'VN',
      currency: 'VND',
      hasLong: true,
    },
    {
      id: 'business',
      type: 'business',
      label: 'GPT Business',
      tag: '自选地区',
      badge: '团队',
      plan_name: 'chatgptteamplan',
      hasLong: true,
      forceHosted: true,
    },
  ];

  const COUNTRIES = [
    { code: 'US', name: '美国', flag: '🇺🇸', currency: 'USD' },
    { code: 'CA', name: '加拿大', flag: '🇨🇦', currency: 'CAD' },
    { code: 'MX', name: '墨西哥', flag: '🇲🇽', currency: 'MXN' },
    { code: 'BR', name: '巴西', flag: '🇧🇷', currency: 'BRL' },
    { code: 'AR', name: '阿根廷', flag: '🇦🇷', currency: 'ARS' },
    { code: 'CL', name: '智利', flag: '🇨🇱', currency: 'CLP' },
    { code: 'CO', name: '哥伦比亚', flag: '🇨🇴', currency: 'COP' },
    { code: 'PE', name: '秘鲁', flag: '🇵🇪', currency: 'PEN' },
    { code: 'GB', name: '英国', flag: '🇬🇧', currency: 'GBP' },
    { code: 'DE', name: '德国', flag: '🇩🇪', currency: 'EUR' },
    { code: 'FR', name: '法国', flag: '🇫🇷', currency: 'EUR' },
    { code: 'IT', name: '意大利', flag: '🇮🇹', currency: 'EUR' },
    { code: 'ES', name: '西班牙', flag: '🇪🇸', currency: 'EUR' },
    { code: 'NL', name: '荷兰', flag: '🇳🇱', currency: 'EUR' },
    { code: 'CH', name: '瑞士', flag: '🇨🇭', currency: 'CHF' },
    { code: 'SE', name: '瑞典', flag: '🇸🇪', currency: 'SEK' },
    { code: 'NO', name: '挪威', flag: '🇳🇴', currency: 'NOK' },
    { code: 'DK', name: '丹麦', flag: '🇩🇰', currency: 'DKK' },
    { code: 'PL', name: '波兰', flag: '🇵🇱', currency: 'PLN' },
    { code: 'TR', name: '土耳其', flag: '🇹🇷', currency: 'TRY' },
    { code: 'JP', name: '日本', flag: '🇯🇵', currency: 'JPY' },
    { code: 'KR', name: '韩国', flag: '🇰🇷', currency: 'KRW' },
    { code: 'SG', name: '新加坡', flag: '🇸🇬', currency: 'SGD' },
    { code: 'MY', name: '马来西亚', flag: '🇲🇾', currency: 'MYR' },
    { code: 'ID', name: '印度尼西亚', flag: '🇮🇩', currency: 'IDR' },
    { code: 'PH', name: '菲律宾', flag: '🇵🇭', currency: 'PHP' },
    { code: 'TH', name: '泰国', flag: '🇹🇭', currency: 'THB' },
    { code: 'VN', name: '越南', flag: '🇻🇳', currency: 'VND' },
    { code: 'IN', name: '印度', flag: '🇮🇳', currency: 'INR' },
    { code: 'PK', name: '巴基斯坦', flag: '🇵🇰', currency: 'PKR' },
    { code: 'BD', name: '孟加拉国', flag: '🇧🇩', currency: 'BDT' },
    { code: 'AE', name: '阿联酋', flag: '🇦🇪', currency: 'AED' },
    { code: 'SA', name: '沙特阿拉伯', flag: '🇸🇦', currency: 'SAR' },
    { code: 'IL', name: '以色列', flag: '🇮🇱', currency: 'ILS' },
    { code: 'AU', name: '澳大利亚', flag: '🇦🇺', currency: 'AUD' },
    { code: 'NZ', name: '新西兰', flag: '🇳🇿', currency: 'NZD' },
    { code: 'ZA', name: '南非', flag: '🇿🇦', currency: 'ZAR' },
    { code: 'NG', name: '尼日利亚', flag: '🇳🇬', currency: 'NGN' },
    { code: 'EG', name: '埃及', flag: '🇪🇬', currency: 'EGP' },
    { code: 'KE', name: '肯尼亚', flag: '🇰🇪', currency: 'KES' },
  ];

  const PANEL_ID = '__gpt_checkout_panel__';
  const BTN_ID   = '__gpt_checkout_btn__';

  // ─── 工具：解析 Token ────────────────────────────────────────────
  function parseToken(raw) {
    if (!raw) return null;
    const s = raw.trim();
    try {
      const obj = JSON.parse(s);
      if (obj.accessToken) return obj.accessToken;
    } catch (_) {}
    const kv = s.match(/["']?accessToken["']?\s*:\s*["']?([A-Za-z0-9\-_\.]+)/);
    if (kv) return kv[1];
    if (/^eyJ/i.test(s)) return s;
    return null;
  }

  async function getToken(userRaw) {
    const manual = parseToken(userRaw);
    if (manual) return manual;
    const res = await fetch('/api/auth/session');
    const session = await readJsonResponse(res);
    if (!res.ok) throw new Error(getErrorMessage(session, '登录状态读取失败'));
    if (!session.accessToken) throw new Error('未检测到登录状态，请先登录 ChatGPT');
    return session.accessToken;
  }

  // __CHECKOUT_LOGIC_START__
  function validateBusinessForm(formData) {
    const workspaceName = String(formData.workspaceName || '').trim();
    if (!workspaceName) throw new Error('请填写工作空间名称');

    const seatQuantity = Number(formData.seatQuantity);
    if (!Number.isInteger(seatQuantity)) throw new Error('席位数量必须是整数');
    if (seatQuantity < 2 || seatQuantity > 999) {
      throw new Error('席位数量必须在 2 到 999 之间');
    }

    const priceInterval = formData.priceInterval || 'month';
    if (!['month', 'year'].includes(priceInterval)) throw new Error('请选择有效的结算周期');
    if (!/^[A-Z]{2}$/.test(formData.country || '')) throw new Error('请选择国家或地区');
    if (!/^[A-Z]{3}$/.test(formData.currency || '')) throw new Error('地区货币无效');

    return { workspaceName, seatQuantity, priceInterval };
  }

  function buildCheckoutBody(plan, mode, formData = {}) {
    const isHosted = plan.forceHosted || mode === 'long';
    if (plan.type === 'business') {
      const business = validateBusinessForm(formData);
      const promoCode = String(formData.promoCode || '').trim();
      const cancelUrl = formData.cancelUrl || (promoCode
        ? `https://chatgpt.com/?promoCode=${encodeURIComponent(promoCode)}`
        : 'https://chatgpt.com/');
      const body = {
        plan_name: plan.plan_name,
        team_plan_data: {
          workspace_name: business.workspaceName,
          price_interval: business.priceInterval,
          seat_quantity: business.seatQuantity,
        },
        billing_details: {
          country: formData.country,
          currency: formData.currency,
        },
        cancel_url: cancelUrl,
      };
      if (promoCode) body.promo_code = promoCode;
      body.checkout_ui_mode = 'hosted';
      return body;
    }

    const billingCountry = plan.billing_country || plan.country;
    const billingCurrency = plan.billing_currency || plan.currency;
    const body = {
      entry_point: 'all_plans_pricing_modal',
      plan_name: plan.plan_name,
      billing_details: { country: billingCountry, currency: billingCurrency },
      checkout_ui_mode: isHosted ? 'hosted' : 'custom',
    };
    if (plan.promo_campaign) body.promo_campaign = plan.promo_campaign;
    return body;
  }

  function getHostedCheckoutUrl(data) {
    if (typeof data?.url === 'string' && /^https?:\/\//i.test(data.url)) return data.url;
    const responseMode = data?.checkout_ui_mode ? `，响应模式：${data.checkout_ui_mode}` : '';
    throw new Error(`接口没有返回托管支付地址${responseMode}`);
  }
  // __CHECKOUT_LOGIC_END__

  async function readJsonResponse(res) {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (_) {
      return { raw: text };
    }
  }

  function getErrorMessage(data, fallback = '请求失败') {
    if (!data) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.raw === 'string') return data.raw.slice(0, 500);
    return fallback;
  }

  async function generateLink(plan, mode, userToken, formData = {}) {
    const isHosted = plan.forceHosted || mode === 'long';
    const body = buildCheckoutBody(plan, mode, formData);
    const token = await getToken(userToken);
    const res = await fetch('https://chatgpt.com/backend-api/payments/checkout', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) throw new Error(getErrorMessage(data, `支付接口请求失败（${res.status}）`));
    if (isHosted) {
      const url = getHostedCheckoutUrl(data);
      return { url, mode: 'long', autoOpen: false };
    } else {
      if (!data.checkout_session_id) throw new Error(getErrorMessage(data, '接口未返回支付会话编号'));
      return {
        url: 'https://chatgpt.com/checkout/openai_llc/' + data.checkout_session_id,
        mode: 'short',
        autoOpen: true,
      };
    }
  }

  // ─── SVG 图标：双层 sparkle，Claude 标志性 ──────────────────────
  const ICON_SPARKLE = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L13.8 9.2C14.05 10.05 14.7 10.7 15.55 10.95L21.75 12.75L15.55 14.55C14.7 14.8 14.05 15.45 13.8 16.3L12 22.5L10.2 16.3C9.95 15.45 9.3 14.8 8.45 14.55L2.25 12.75L8.45 10.95C9.3 10.7 9.95 10.05 10.2 9.2L12 3Z"
            stroke="currentColor" stroke-linejoin="round" fill="none"/>
      <path d="M19 3L19.6 5.1C19.7 5.4 19.9 5.6 20.2 5.7L22.5 6.3L20.2 7C19.9 7.1 19.7 7.3 19.6 7.6L19 9.75L18.4 7.6C18.3 7.3 18.1 7.1 17.8 7L15.5 6.3L17.8 5.7C18.1 5.6 18.3 5.4 18.4 5.1L19 3Z"
            stroke="currentColor" stroke-linejoin="round" fill="none"/>
    </svg>
  `;

  // ─── 样式（Claude.ai 美学）─────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');

    /* ─── 浮动按钮：纯 SVG，无背景 ─── */
    #${BTN_ID} {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 999998;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b6354;
      transition: color 0.22s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1);
      opacity: 0.7;
    }
    #${BTN_ID}:hover {
      color: #c96442;
      opacity: 1;
      transform: rotate(-12deg) scale(1.12);
    }
    #${BTN_ID} svg {
      width: 26px;
      height: 26px;
      stroke-width: 1.6;
      transition: filter 0.22s ease;
    }
    #${BTN_ID}:hover svg {
      filter: drop-shadow(0 2px 8px rgba(201,100,66,0.30));
    }
    #${BTN_ID}.is-open {
      color: #c96442;
      opacity: 1;
    }

    /* ─── 面板 ─── */
    #${PANEL_ID} {
      --gpt-control-bg: rgba(255,255,255,0.6);
      --gpt-control-bg-focus: #fff;
      --gpt-control-border: rgba(0,0,0,0.08);
      --gpt-control-text: #2c2419;
      --gpt-control-muted: #8a7f6a;
      --gpt-focus-border: rgba(201,100,66,0.40);
      --gpt-focus-ring: rgba(201,100,66,0.08);
      position: fixed;
      bottom: 76px;
      right: 28px;
      z-index: 999997;
      width: 380px;
      max-height: 84vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: #faf9f5;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 18px;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 8px 24px rgba(0,0,0,0.06),
        0 24px 60px rgba(60,40,20,0.10);
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 14px;
      color: #2c2419;
      letter-spacing: -0.005em;
      transform: translateY(8px) scale(0.985);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(.34,1.2,.64,1), opacity 0.22s ease;
    }
    #${PANEL_ID}.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }
    #${PANEL_ID}::-webkit-scrollbar { width: 6px; }
    #${PANEL_ID}::-webkit-scrollbar-track { background: transparent; }
    #${PANEL_ID}::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.10);
      border-radius: 3px;
    }

    /* ─── 头部 ─── */
    .gpt-panel-header {
      padding: 22px 24px 14px;
      display: flex;
      align-items: baseline;
      gap: 9px;
    }
    .gpt-panel-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 19px;
      font-weight: 500;
      color: #2c2419;
      letter-spacing: -0.018em;
      line-height: 1;
    }
    .gpt-panel-subtitle {
      font-size: 12px;
      color: #8a7f6a;
      font-weight: 400;
      letter-spacing: 0;
    }

    .gpt-panel-body { padding: 0 24px 24px; }

    /* ─── 区段标签 ─── */
    .gpt-section-label {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #a89c85;
      margin: 18px 0 9px;
    }
    .gpt-section-label .gpt-label-extra {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      color: #c4b8a0;
      margin-left: 5px;
    }

    /* ─── 链接类型 Tabs ─── */
    .gpt-mode-tabs {
      display: flex;
      gap: 0;
      background: rgba(0,0,0,0.035);
      padding: 3px;
      border-radius: 10px;
    }
    .gpt-mode-tab {
      flex: 1;
      padding: 8px 0;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: #8a7f6a;
      font-size: 13px;
      font-weight: 450;
      cursor: pointer;
      text-align: center;
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
      font-family: inherit;
      letter-spacing: -0.005em;
    }
    .gpt-mode-tab.active {
      background: #faf9f5;
      color: #2c2419;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04);
    }
    .gpt-mode-tab:hover:not(.active) { color: #2c2419; }
    .gpt-mode-tab:focus-visible,
    .gpt-plan-item:focus-visible,
    .gpt-generate-btn:focus-visible,
    .gpt-result-btn:focus-visible {
      outline: 2px solid rgba(201,100,66,0.55);
      outline-offset: 2px;
    }
    .gpt-mode-tab:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }

    /* ─── 套餐列表 ─── */
    .gpt-plan-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .gpt-plan-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 13px;
      border-radius: 11px;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: background 0.16s ease, border-color 0.16s ease, opacity 0.16s ease;
      user-select: none;
      color: inherit;
      font-family: inherit;
      text-align: left;
    }
    .gpt-plan-item:hover:not(.disabled) {
      background: rgba(201,100,66,0.04);
    }
    .gpt-plan-item.active {
      background: rgba(201,100,66,0.06);
      border-color: rgba(201,100,66,0.20);
    }
    .gpt-plan-item.disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .gpt-plan-radio {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 1.5px solid #d4cab8;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.18s ease, background 0.18s ease;
      background: #faf9f5;
    }
    .gpt-plan-item:hover:not(.disabled) .gpt-plan-radio {
      border-color: #b8aa8e;
    }
    .gpt-plan-item.active .gpt-plan-radio {
      border-color: #c96442;
      background: #c96442;
    }
    .gpt-plan-radio-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #faf9f5;
      transform: scale(0);
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1);
    }
    .gpt-plan-item.active .gpt-plan-radio-dot { transform: scale(1); }
    .gpt-plan-info { flex: 1; min-width: 0; }
    .gpt-plan-name {
      font-size: 13.5px;
      font-weight: 500;
      color: #2c2419;
      letter-spacing: -0.005em;
      line-height: 1.3;
    }
    .gpt-plan-name .gpt-plan-region {
      color: #a89c85;
      font-weight: 400;
      margin-left: 6px;
    }
    .gpt-plan-meta {
      font-size: 11px;
      color: #b8ac95;
      margin-top: 2px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      letter-spacing: -0.01em;
    }
    .gpt-plan-badge {
      font-size: 10.5px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 100px;
      background: rgba(201,100,66,0.10);
      color: #c96442;
      letter-spacing: 0.01em;
      flex-shrink: 0;
    }

    /* ─── Business 参数 ─── */
    .gpt-business-fields[hidden] { display: none !important; }
    .gpt-field-group { margin-top: 10px; }
    .gpt-field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .gpt-field-label {
      display: block;
      margin-bottom: 6px;
      color: var(--gpt-control-muted);
      font-size: 11.5px;
      font-weight: 500;
    }
    .gpt-field-input,
    .gpt-field-select {
      width: 100%;
      min-height: 38px;
      box-sizing: border-box;
      padding: 8px 11px;
      border: 1px solid var(--gpt-control-border);
      border-radius: 9px;
      outline: none;
      background: var(--gpt-control-bg);
      color: var(--gpt-control-text);
      font: 12.5px/1.35 inherit;
      transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }
    .gpt-field-input:focus,
    .gpt-field-select:focus {
      border-color: var(--gpt-focus-border);
      background: var(--gpt-control-bg-focus);
      box-shadow: 0 0 0 3px var(--gpt-focus-ring);
    }
    .gpt-field-input[readonly] {
      color: var(--gpt-control-muted);
      cursor: default;
    }
    .gpt-field-input::placeholder { color: #b8ac95; }

    /* ─── Token 输入 ─── */
    .gpt-token-input {
      width: 100%;
      box-sizing: border-box;
      padding: 11px 13px;
      border: 1px solid var(--gpt-control-border);
      border-radius: 10px;
      font-size: 12.5px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      color: var(--gpt-control-text);
      background: var(--gpt-control-bg);
      resize: none;
      height: 62px;
      transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
      outline: none;
      letter-spacing: -0.01em;
      line-height: 1.5;
    }
    .gpt-token-input::placeholder { color: #b8ac95; }
    .gpt-token-input:focus {
      border-color: var(--gpt-focus-border);
      background: var(--gpt-control-bg-focus);
      box-shadow: 0 0 0 3px var(--gpt-focus-ring);
    }
    .gpt-token-hint {
      font-size: 11.5px;
      color: #8a7f6a;
      margin-top: 8px;
      line-height: 1.6;
    }
    .gpt-token-hint a {
      color: #c96442;
      text-decoration: none;
      border-bottom: 1px solid rgba(201,100,66,0.30);
      padding-bottom: 1px;
      transition: border-color 0.15s;
    }
    .gpt-token-hint a:hover { border-bottom-color: #c96442; }

    /* ─── 长链提示横幅 ─── */
    .gpt-info-banner {
      background: rgba(201,100,66,0.05);
      border: 1px solid rgba(201,100,66,0.15);
      border-radius: 10px;
      padding: 10px 13px;
      font-size: 12px;
      color: #8a4a2e;
      line-height: 1.55;
      margin-top: 12px;
      display: flex;
      gap: 9px;
      align-items: flex-start;
    }
    .gpt-info-banner-icon {
      flex-shrink: 0;
      color: #c96442;
      margin-top: 1px;
    }
    .gpt-info-banner-icon svg { width: 14px; height: 14px; display: block; }

    /* ─── 生成按钮 ─── */
    .gpt-generate-btn {
      width: 100%;
      padding: 12px 0;
      margin-top: 18px;
      border-radius: 11px;
      border: none;
      background: #2c2419;
      color: #faf9f5;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
      letter-spacing: -0.005em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .gpt-generate-btn:hover {
      background: #1a140b;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(44,36,25,0.20);
    }
    .gpt-generate-btn:active { transform: translateY(0); }
    .gpt-generate-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* ─── 结果 ─── */
    .gpt-result {
      margin-top: 14px;
      border-radius: 11px;
      overflow: hidden;
      animation: gptFadeIn 0.25s ease;
    }
    @keyframes gptFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .gpt-result-success {
      background: rgba(34,139,90,0.05);
      border: 1px solid rgba(34,139,90,0.18);
    }
    .gpt-result-error {
      background: rgba(200,55,55,0.04);
      border: 1px solid rgba(200,55,55,0.18);
    }
    .gpt-result-header {
      padding: 10px 13px 6px;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    .gpt-result-success .gpt-result-header { color: #1f8556; }
    .gpt-result-error .gpt-result-header { color: #c83737; }
    .gpt-result-url {
      padding: 2px 13px 10px;
      font-size: 11.5px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      color: #4a4030;
      word-break: break-all;
      line-height: 1.55;
      letter-spacing: -0.01em;
    }
    .gpt-result-actions {
      display: flex;
      gap: 6px;
      padding: 0 13px 11px;
    }
    .gpt-result-btn {
      flex: 1;
      padding: 7px 0;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.08);
      background: rgba(255,255,255,0.6);
      color: #2c2419;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
      text-align: center;
      letter-spacing: -0.005em;
    }
    .gpt-result-btn:hover {
      background: #fff;
      border-color: rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }
    .gpt-spinner {
      width: 13px; height: 13px;
      border: 1.8px solid rgba(250,249,245,0.3);
      border-top-color: #faf9f5;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── 暗色模式 ─── */
    @media (prefers-color-scheme: dark) {
      #${BTN_ID} { color: #b8ac95; }
      #${BTN_ID}:hover { color: #e8a07d; }
      #${BTN_ID}.is-open { color: #e8a07d; }

      #${PANEL_ID} {
        --gpt-control-bg: rgba(0,0,0,0.18);
        --gpt-control-bg-focus: rgba(0,0,0,0.25);
        --gpt-control-border: rgba(255,255,255,0.08);
        --gpt-control-text: #e8e1d2;
        --gpt-control-muted: #8a7f6a;
        --gpt-focus-border: rgba(232,160,125,0.4);
        --gpt-focus-ring: rgba(232,160,125,0.10);
        background: #1f1c17;
        border-color: rgba(255,255,255,0.08);
        color: #e8e1d2;
        box-shadow:
          0 1px 2px rgba(0,0,0,0.3),
          0 12px 32px rgba(0,0,0,0.4),
          0 24px 60px rgba(0,0,0,0.5);
      }
      .gpt-panel-title { color: #f0e8d6; }
      .gpt-panel-subtitle { color: #8a7f6a; }
      .gpt-section-label { color: #6b6354; }
      .gpt-section-label .gpt-label-extra { color: #4d463a; }

      .gpt-mode-tabs { background: rgba(255,255,255,0.04); }
      .gpt-mode-tab { color: #8a7f6a; }
      .gpt-mode-tab.active {
        background: #2c2620;
        color: #f0e8d6;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.06);
      }

      .gpt-plan-item:hover:not(.disabled) { background: rgba(232,160,125,0.06); }
      .gpt-plan-item.active {
        background: rgba(232,160,125,0.09);
        border-color: rgba(232,160,125,0.25);
      }
      .gpt-plan-radio { background: #1f1c17; border-color: #4d463a; }
      .gpt-plan-item.active .gpt-plan-radio {
        background: #e8a07d;
        border-color: #e8a07d;
      }
      .gpt-plan-item.active .gpt-plan-radio-dot { background: #1f1c17; }
      .gpt-plan-name { color: #f0e8d6; }
      .gpt-plan-name .gpt-plan-region { color: #8a7f6a; }
      .gpt-plan-meta { color: #6b6354; }
      .gpt-plan-badge {
        background: rgba(232,160,125,0.13);
        color: #e8a07d;
      }

      .gpt-token-input {
        background: var(--gpt-control-bg);
        border-color: var(--gpt-control-border);
        color: var(--gpt-control-text);
      }
      .gpt-token-input::placeholder { color: #6b6354; }
      .gpt-token-input:focus {
        border-color: var(--gpt-focus-border);
        background: var(--gpt-control-bg-focus);
        box-shadow: 0 0 0 3px var(--gpt-focus-ring);
      }
      .gpt-token-hint { color: #8a7f6a; }
      .gpt-token-hint a { color: #e8a07d; border-bottom-color: rgba(232,160,125,0.3); }

      .gpt-info-banner {
        background: rgba(232,160,125,0.06);
        border-color: rgba(232,160,125,0.18);
        color: #d4a98c;
      }
      .gpt-info-banner-icon { color: #e8a07d; }

      .gpt-generate-btn {
        background: #f0e8d6;
        color: #1f1c17;
      }
      .gpt-generate-btn:hover {
        background: #fff;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      }
      .gpt-spinner {
        border-color: rgba(31,28,23,0.25);
        border-top-color: #1f1c17;
      }

      .gpt-result-success {
        background: rgba(64,180,120,0.07);
        border-color: rgba(64,180,120,0.22);
      }
      .gpt-result-success .gpt-result-header { color: #5dc88f; }
      .gpt-result-error {
        background: rgba(220,80,80,0.07);
        border-color: rgba(220,80,80,0.22);
      }
      .gpt-result-error .gpt-result-header { color: #e57373; }
      .gpt-result-url { color: #c4b8a0; }
      .gpt-result-btn {
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
        color: #e8e1d2;
      }
      .gpt-result-btn:hover {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.18);
      }
    }

    @media (max-width: 460px) {
      #${BTN_ID} { right: 16px; bottom: 16px; }
      #${PANEL_ID} {
        right: 16px;
        bottom: 64px;
        width: calc(100vw - 32px);
        max-height: calc(100vh - 88px);
      }
      .gpt-panel-header { padding: 18px 18px 12px; }
      .gpt-panel-body { padding: 0 18px 18px; }
      .gpt-field-row { grid-template-columns: 1fr; gap: 0; }
    }
  `;

  // ─── 注入 UI ────────────────────────────────────────────────────
  function inject() {
    if (document.getElementById(BTN_ID)) return;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.title = 'GPT 支付链接生成器';
    btn.setAttribute('aria-label', '打开支付链接生成器');
    btn.setAttribute('aria-controls', PANEL_ID);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = ICON_SPARKLE;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '支付链接生成器');
    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);

    bindEvents(btn, panel);
  }

  function buildPanelHTML() {
    const planItems = PLANS.map(p => `
      <button type="button" class="gpt-plan-item" data-plan="${p.id}" aria-pressed="false">
        <div class="gpt-plan-radio"><div class="gpt-plan-radio-dot"></div></div>
        <div class="gpt-plan-info">
          <div class="gpt-plan-name">${p.label}<span class="gpt-plan-region">${p.tag}</span></div>
          <div class="gpt-plan-meta">${p.plan_name}</div>
        </div>
        <span class="gpt-plan-badge">${p.badge}</span>
      </button>
    `).join('');
    const countryOptions = COUNTRIES.map(country => `
      <option value="${country.code}" data-currency="${country.currency}">
        ${country.flag} ${country.name}
      </option>
    `).join('');

    return `
      <div class="gpt-panel-header">
        <div class="gpt-panel-title">支付链接</div>
      </div>
      <div class="gpt-panel-body">

        <div class="gpt-section-label">链接类型</div>
        <div class="gpt-mode-tabs">
          <button class="gpt-mode-tab active" data-mode="short">短链 · 自用</button>
          <button class="gpt-mode-tab" data-mode="long">长链 · 可转发</button>
        </div>

        <div class="gpt-section-label">套餐选择</div>
        <div class="gpt-plan-list">${planItems}</div>

        <div class="gpt-business-fields" id="__gpt_business_fields__" hidden>
          <div class="gpt-section-label">Business 信息</div>
          <div class="gpt-field-group">
            <label class="gpt-field-label" for="__gpt_workspace__">工作空间名称</label>
            <input class="gpt-field-input" id="__gpt_workspace__" type="text" value="MyTeam" maxlength="80" autocomplete="off">
          </div>
          <div class="gpt-field-row">
            <div class="gpt-field-group">
              <label class="gpt-field-label" for="__gpt_seats__">席位数量</label>
              <input class="gpt-field-input" id="__gpt_seats__" type="number" value="5" min="2" max="999" step="1" inputmode="numeric">
            </div>
            <div class="gpt-field-group">
              <label class="gpt-field-label" for="__gpt_interval__">结算周期</label>
              <select class="gpt-field-select" id="__gpt_interval__">
                <option value="month">按月</option>
                <option value="year">按年</option>
              </select>
            </div>
          </div>
          <div class="gpt-field-row">
            <div class="gpt-field-group">
              <label class="gpt-field-label" for="__gpt_country__">国家或地区</label>
              <select class="gpt-field-select" id="__gpt_country__">${countryOptions}</select>
            </div>
            <div class="gpt-field-group">
              <label class="gpt-field-label" for="__gpt_currency__">货币</label>
              <input class="gpt-field-input" id="__gpt_currency__" type="text" value="PHP" readonly aria-readonly="true">
            </div>
          </div>
          <div class="gpt-field-group">
            <label class="gpt-field-label" for="__gpt_promo__">促销码（选填）</label>
            <input class="gpt-field-input" id="__gpt_promo__" type="text" placeholder="输入促销码" maxlength="120" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div class="gpt-section-label">
          Access Token<span class="gpt-label-extra">选填</span>
        </div>
        <textarea
          class="gpt-token-input"
          id="__gpt_token__"
          placeholder="支持完整 JSON / 键值对 / 纯 Token 三种格式&#10;不填则自动获取当前账号"
          spellcheck="false"
        ></textarea>
        <div class="gpt-token-hint">
          不填则使用当前登录账号。也可在
          <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener">chatgpt.com/api/auth/session</a>
          获取，请勿使用来源不明的 Token。
        </div>

        <div class="gpt-info-banner" id="__gpt_long_hint__" style="display:none">
          <span class="gpt-info-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </span>
          <span>长链会打开独立支付页，可复制后转发；最终可用性由支付页校验。</span>
        </div>

        <button class="gpt-generate-btn" id="__gpt_gen__">
          <span>生成支付链接</span>
        </button>
        <div id="__gpt_result__"></div>
      </div>
    `;
  }

  function bindEvents(btn, panel) {
    let isOpen = false;
    let selectedMode = 'short';
    let personalMode = 'short';
    let selectedPlan = PLANS[0].id;

    const shortModeTab = panel.querySelector('[data-mode="short"]');
    const businessFields = panel.querySelector('#__gpt_business_fields__');
    const countrySelect = panel.querySelector('#__gpt_country__');
    const currencyInput = panel.querySelector('#__gpt_currency__');

    countrySelect.value = 'PH';
    updateCurrency();

    function togglePanel(force) {
      isOpen = typeof force === 'boolean' ? force : !isOpen;
      panel.classList.toggle('open', isOpen);
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    }

    btn.addEventListener('click', togglePanel);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) togglePanel(false);
    });
    countrySelect.addEventListener('change', updateCurrency);

    panel.addEventListener('click', e => {
      const modeTab = e.target.closest('.gpt-mode-tab');
      if (modeTab && !modeTab.disabled) {
        personalMode = modeTab.dataset.mode;
        setMode(personalMode);
        const plan = PLANS.find(p => p.id === selectedPlan);
        if (selectedMode === 'long' && plan && !plan.hasLong) {
          const first = PLANS.find(p => p.hasLong && p.type !== 'business');
          if (first) selectPlan(first.id);
        }
        return;
      }

      const planItem = e.target.closest('.gpt-plan-item');
      if (planItem && !planItem.classList.contains('disabled')) {
        selectPlan(planItem.dataset.plan);
        return;
      }

      if (e.target.id === '__gpt_copy__') {
        const url = panel.querySelector('#__gpt_url_text__')?.textContent;
        if (url) {
          navigator.clipboard.writeText(url).then(() => {
            e.target.textContent = '已复制';
            setTimeout(() => { e.target.textContent = '复制链接'; }, 1800);
          }).catch(() => {
            e.target.textContent = '复制失败';
            setTimeout(() => { e.target.textContent = '复制链接'; }, 1800);
          });
        }
        return;
      }

      if (e.target.id === '__gpt_open__') {
        const url = panel.querySelector('#__gpt_url_text__')?.textContent;
        if (url) window.open(url, '_blank');
        return;
      }
    });

    function updateCurrency() {
      const country = COUNTRIES.find(item => item.code === countrySelect.value);
      currencyInput.value = country ? country.currency : '';
    }

    function setMode(mode) {
      selectedMode = mode;
      panel.querySelectorAll('.gpt-mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
        tab.setAttribute('aria-selected', String(tab.dataset.mode === mode));
      });
      panel.querySelector('#__gpt_long_hint__').style.display = mode === 'long' ? 'flex' : 'none';
      updatePlanDisabled();
    }

    function selectPlan(id) {
      const previousPlan = PLANS.find(p => p.id === selectedPlan);
      const nextPlan = PLANS.find(p => p.id === id);
      if (!nextPlan) return;

      if (nextPlan.type === 'business') {
        if (previousPlan?.type !== 'business') personalMode = selectedMode;
        selectedPlan = id;
        shortModeTab.disabled = true;
        setMode('long');
      } else {
        selectedPlan = id;
        shortModeTab.disabled = false;
        if (previousPlan?.type === 'business') {
          if (personalMode === 'long' && !nextPlan.hasLong) personalMode = 'short';
          setMode(personalMode);
        }
      }

      panel.querySelectorAll('.gpt-plan-item').forEach(el => {
        const active = el.dataset.plan === id;
        el.classList.toggle('active', active);
        el.setAttribute('aria-pressed', String(active));
      });
      businessFields.hidden = nextPlan.type !== 'business';
      updatePlanDisabled();
    }

    function updatePlanDisabled() {
      const selected = PLANS.find(p => p.id === selectedPlan);
      panel.querySelectorAll('.gpt-plan-item').forEach(el => {
        const plan = PLANS.find(p => p.id === el.dataset.plan);
        const disabled = selected?.type !== 'business' && selectedMode === 'long' && plan && !plan.hasLong;
        el.classList.toggle('disabled', disabled);
        el.disabled = Boolean(disabled);
      });
    }

    setMode(selectedMode);
    selectPlan(selectedPlan);

    const genBtn = panel.querySelector('#__gpt_gen__');
    genBtn.addEventListener('click', async () => {
      const plan = PLANS.find(p => p.id === selectedPlan);
      if (!plan) return;
      if (selectedMode === 'long' && !plan.hasLong) {
        showResult(null, '该套餐暂无长链支持');
        return;
      }
      const tokenRaw = panel.querySelector('#__gpt_token__').value;
      const formData = plan.type === 'business' ? {
        workspaceName: panel.querySelector('#__gpt_workspace__').value,
        seatQuantity: panel.querySelector('#__gpt_seats__').value,
        priceInterval: panel.querySelector('#__gpt_interval__').value,
        country: countrySelect.value,
        currency: currencyInput.value,
        promoCode: panel.querySelector('#__gpt_promo__').value,
      } : {};
      genBtn.disabled = true;
      genBtn.innerHTML = '<span class="gpt-spinner"></span><span>生成中</span>';
      try {
        const result = await generateLink(plan, selectedMode, tokenRaw, formData);
        showResult(result.url, null, result.mode || selectedMode);
        if (result.autoOpen) {
          setTimeout(() => { window.location.href = result.url; }, 500);
        }
      } catch (err) {
        showResult(null, err.message || String(err));
      } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<span>生成支付链接</span>';
      }
    });

    function showResult(url, errMsg, mode) {
      const resultEl = panel.querySelector('#__gpt_result__');
      if (errMsg) {
        resultEl.innerHTML = `
          <div class="gpt-result gpt-result-error">
            <div class="gpt-result-header">生成失败</div>
            <div class="gpt-result-url">${escHtml(errMsg)}</div>
          </div>`;
      } else {
        resultEl.innerHTML = `
          <div class="gpt-result gpt-result-success">
            <div class="gpt-result-header">链接已生成${mode === 'short' ? ' · 即将跳转' : ''}</div>
            <div class="gpt-result-url" id="__gpt_url_text__">${escHtml(url)}</div>
            <div class="gpt-result-actions">
              <button class="gpt-result-btn" id="__gpt_copy__">复制链接</button>
              <button class="gpt-result-btn" id="__gpt_open__">打开链接</button>
            </div>
          </div>`;
      }
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── 轮询注入防覆盖 ─────────────────────────────────────────────
  function ensureInjected() { inject(); }

  if (document.body) {
    ensureInjected();
  } else {
    document.addEventListener('DOMContentLoaded', ensureInjected);
  }

  setInterval(() => {
    if (!document.getElementById(BTN_ID)) ensureInjected();
  }, 1000);

  const observer = new MutationObserver(() => {
    if (!document.getElementById(BTN_ID)) ensureInjected();
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }

})();
