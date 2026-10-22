# 山隅咖啡

原创咖啡品牌概念 Demo。React + TypeScript + Vite；本地 Mock、静态资源及浏览器存储，无业务 API、后台、支付或公网发布。

首页与购物袋可操作，菜单、订单和个人页为展示内容。订单、门店、会员均标明示例；图片为 AI 原创概念图。适配手机及桌面浏览器。浏览器模拟测试不等同于真实手机验收。

## 本地启动

使用符合 package.json engines 的 Node（本次使用22.15.0）。已有锁文件执行 `npm ci`，然后 `npm run dev`。本机预览地址由终端实际输出确定，默认 http://127.0.0.1:5173 。若用户 npm 缓存权限异常，可用 `npm ci --cache ./artifacts/npm-cache`，不需要更改系统权限。

## 验证

`npm exec playwright install chromium webkit` 安装测试浏览器。`npm run typecheck` 做类型检查。`npm run test:e2e -- tests/e2e/baseline.spec.ts` 验证基础页面。功能完成后依次执行 `npm run test:unit`、`npm run test:e2e`、`npm run build`、`npm run test:e2e:prod`。完整验证可用 `npm run verify`。

E2E 默认用390px Chromium、390px WebKit与桌面 Chromium；报告保存在 artifacts/e2e-development 与 artifacts/e2e-production，失败保留截图、录像与trace。E2E_PORT 可修改测试端口，E2E_REPORT_DIR 可隔离不同运行的证据。测试默认自行启停自己的服务，不复用未知服务。

## 本地成品

`npm run build` 后运行 `npm run serve:dist`，在 http://127.0.0.1:4173 浏览本次 dist。它是本地静态交付验证，不是公网发布。关闭所属终端进程即可停止；不终止其他项目的服务。

## 四角色复验

参考 docs/WORKBUDDY-RUNBOOK.md。基础包不含开业券实现、不含 node_modules、dist 或执行证据；使用环境、开发、测试修复、本地交付四个项目 Skill 实际执行。基础包未实现优惠功能时，新增功能的测试命令尚无对应单元用例，由测试角色独立补齐。

需求与预期见 docs/FEATURE-SPEC.md；设计边界见 docs/DESIGN.md；完整 E2E 范围见 docs/E2E-PLAN.md。不得用 Codex 报告冒充 WorkBuddy 执行结果。
