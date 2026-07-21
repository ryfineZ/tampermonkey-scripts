'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, '..', 'gpt-payment-link-generator.user.js');
const source = fs.readFileSync(scriptPath, 'utf8');

function loadCheckoutLogic() {
  const match = source.match(
    /\/\/ __CHECKOUT_LOGIC_START__([\s\S]*?)\/\/ __CHECKOUT_LOGIC_END__/
  );
  if (!match) return null;

  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${match[1]}\nglobalThis.checkoutLogic = {
      buildCheckoutBody,
      validateBusinessForm,
      getHostedCheckoutUrl: typeof getHostedCheckoutUrl === 'function' ? getHostedCheckoutUrl : null,
    };`,
    context
  );
  return context.checkoutLogic;
}

const businessPlan = {
  id: 'business',
  type: 'business',
  plan_name: 'chatgptteamplan',
  forceHosted: true,
};

test('Business 长链请求包含地区、团队信息和促销码', () => {
  const logic = loadCheckoutLogic();
  assert.ok(logic, '缺少可测试的 Checkout 请求构造逻辑');

  const body = logic.buildCheckoutBody(businessPlan, 'long', {
    workspaceName: 'Example Team',
    priceInterval: 'month',
    seatQuantity: 5,
    country: 'PH',
    currency: 'PHP',
    promoCode: 'PROMO-CODE',
  });

  assert.deepEqual(JSON.parse(JSON.stringify(body)), {
    plan_name: 'chatgptteamplan',
    team_plan_data: {
      workspace_name: 'Example Team',
      price_interval: 'month',
      seat_quantity: 5,
    },
    billing_details: { country: 'PH', currency: 'PHP' },
    cancel_url: 'https://chatgpt.com/?promoCode=PROMO-CODE',
    promo_code: 'PROMO-CODE',
    checkout_ui_mode: 'hosted',
  });
});

test('Business 空促销码不会进入请求', () => {
  const logic = loadCheckoutLogic();
  assert.ok(logic, '缺少可测试的 Checkout 请求构造逻辑');

  const body = logic.buildCheckoutBody(businessPlan, 'long', {
    workspaceName: 'Example Team',
    priceInterval: 'year',
    seatQuantity: 2,
    country: 'US',
    currency: 'USD',
    promoCode: '   ',
  });

  assert.equal(Object.hasOwn(body, 'promo_code'), false);
  assert.equal(body.team_plan_data.price_interval, 'year');
});

test('Business 校验拒绝空名称和无效席位数量', () => {
  const logic = loadCheckoutLogic();
  assert.ok(logic, '缺少可测试的 Checkout 请求构造逻辑');

  assert.throws(
    () => logic.validateBusinessForm({ workspaceName: ' ', seatQuantity: 5 }),
    /工作空间名称/
  );
  assert.throws(
    () => logic.validateBusinessForm({ workspaceName: 'Team', seatQuantity: 1 }),
    /2 到 999/
  );
  assert.throws(
    () => logic.validateBusinessForm({ workspaceName: 'Team', seatQuantity: 2.5 }),
    /整数/
  );
});

test('Plus 短链保持 custom 模式和内置活动字段', () => {
  const logic = loadCheckoutLogic();
  assert.ok(logic, '缺少可测试的 Checkout 请求构造逻辑');

  const body = logic.buildCheckoutBody({
    plan_name: 'chatgptplusplan',
    country: 'US',
    currency: 'USD',
    promo_campaign: 'plus-1-month-free',
  }, 'short', {});

  assert.deepEqual(JSON.parse(JSON.stringify(body)), {
    entry_point: 'all_plans_pricing_modal',
    plan_name: 'chatgptplusplan',
    billing_details: { country: 'US', currency: 'USD' },
    checkout_ui_mode: 'custom',
    promo_campaign: 'plus-1-month-free',
  });
});

test('hosted 响应没有 URL 时不能使用 ChatGPT 短链代替', () => {
  const logic = loadCheckoutLogic();
  assert.ok(logic?.getHostedCheckoutUrl, '缺少 hosted 长链响应校验');

  assert.throws(
    () => logic.getHostedCheckoutUrl({
      checkout_ui_mode: 'hosted',
      checkout_session_id: 'cs_test_example',
    }),
    /没有返回托管支付地址/
  );
  assert.equal(
    logic.getHostedCheckoutUrl({ url: 'https://pay.openai.com/c/pay/example' }),
    'https://pay.openai.com/c/pay/example'
  );
});

test('套餐配置保留越南 Plus、越南 Pro 并新增 Business', () => {
  assert.match(source, /id:\s*'plus_vn'/);
  assert.match(source, /id:\s*'pro_vn'/);
  assert.match(source, /id:\s*'business'/);
});

test('Business 国家配置包含肯尼亚及其货币', () => {
  assert.match(
    source,
    /code:\s*'KE',\s*name:\s*'肯尼亚',\s*flag:\s*'🇰🇪',\s*currency:\s*'KES'/
  );
});
