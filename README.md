# Tampermonkey Scripts

## GPT 支付链接生成器

在 ChatGPT 页面生成 Plus、Pro 和 Business 支付链接。Business 支持选择国家或地区、自动匹配货币、填写工作空间信息和促销码，并请求托管支付链接；当前地区列表包含肯尼亚（USD）。

本次变更：Business 国家选择保留肯尼亚，使用国家代码 `KE` 和支付接口要求的货币代码 `USD`；接口返回字段级校验错误时，界面会展示具体原因。

### 安装

[点击安装或更新脚本](https://raw.githubusercontent.com/ryfineZ/tampermonkey-scripts/main/gpt-payment-link-generator.user.js)

脚本安装后可在 Tampermonkey 管理面板中使用“检查用户脚本更新”。发布修改时必须提升脚本头部的 `@version`。

### 验证

```bash
node --test tests/gpt-payment-link-generator.test.js
node --check gpt-payment-link-generator.user.js
```

### 说明

脚本调用 ChatGPT 页面使用的支付接口。套餐、地区、促销资格和支付结果均由服务端校验；接口发生变化时，脚本可能需要同步更新。
