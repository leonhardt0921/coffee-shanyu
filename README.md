# 山隅咖啡 · 杯型实验基线
React + TypeScript + Vite，本地Mock/图片/浏览器存储。已有精致首页、6款商品、购物袋、四页导航和满39减10开业券。辅助页展示，无后台/支付/真实订单。**杯型选择、改配合并和旧数据迁移尚未实现。**
业务源代码基于已完成优惠券的1a40cb16d3b57791ed482645451ad095b7ea630e。不要使用旧“无优惠券基础包”。

## 开始
先读docs/FEATURE-SPEC.md、ACCEPTANCE.md、E2E-PLAN.md和EXPERIMENT.md。npm run check:contract核验冻结输入，不安装依赖、不代表功能通过。
使用package.json engines兼容Node，.nvmrc建议22.15.0。在项目根目录：
```sh
npm run check:contract
npm ci
npm run setup:browsers
npm run typecheck
npm run test:unit
npm run test:e2e
npm run dev
```
现有tests仅旧购物袋/券回归；新增杯型测试留待本次执行。npm缓存在.workbuddy-cache/npm（npm config get cache核对），浏览器在.workbuddy-cache/browsers，均不复用共享缓存。

## 未安装依赖时的编辑器提示
本基线刻意不含node_modules。此时tsconfig.json可能显示两条TS2688：找不到node及vite/client类型定义；React等导入也可能报缺少模块。这是依赖未安装，不是配置语法错误。环境阶段执行npm ci后运行npm run typecheck验证；若编辑器仍保留旧提示，重启TypeScript服务或重新打开项目。不要删除types、关闭strict或补造类型声明来隐藏问题。

## 完整验证与本地交付
npm run verify依次类型检查、单测、开发E2E、build、生产E2E。
npm run serve:dist运行当前dist，仅监听127.0.0.1，默认4173；开发默认5173。E2E自动管理所属服务，端口冲突通过E2E_PORT选择空闲端口；每轮设置新的E2E_REPORT_DIR留存证据（按所在shell语法设置）。
默认手机Chromium/WebKit和桌面Chromium；模拟视口不是实体手机。报告在artifacts；主流程需保留成功视频/trace，失败留图/视频/trace。检查真实命令退出码。
本基线不含依赖、构建产物、历史日志或技能；旧Codex结果不属于本次WorkBuddy实验。
