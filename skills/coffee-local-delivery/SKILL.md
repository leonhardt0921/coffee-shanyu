---
name: coffee-local-delivery
description: 将山隅咖啡已验收源码构建成静态产物，在本地独立运行并执行生产 E2E，整理可复现交付证据。
---

以前置测试报告通过为条件，核对源码版本和测试时间。

1. 执行 npm run build 并保存实际输出。失败则修复或交回，不复用旧 dist 假装成功。
2. 关闭本次任务拥有的开发服务；运行 npm run serve:dist，仅监听127.0.0.1。确认响应来自 dist，记录端口和进程。
3. 执行 npm run test:e2e:prod，使用全新上下文验证真实构建产物，包括领券完整链路、刷新、导航和无第三方请求；保存 HTML/JSON 报告、截图和视频。
4. 整理 dist、源码提交号、锁文件、SHA256、启动说明和实际验证记录。基础版源码包不含 node_modules/dist/artifacts/优惠实现；完成版单独交付。
5. 保存 artifacts/<run-id>/delivery.md，准确区分本地静态交付与公网部署。清理本角色不再需要的服务，仅保留明确作为预览交付的服务。

不得上传、公网发布、接入支付或业务 API，不删除用户已有文件。WorkBuddy 的报告必须由 WorkBuddy 运行产生。
