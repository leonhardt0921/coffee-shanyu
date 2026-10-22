---
name: coffee-env-setup
description: 为山隅咖啡 React TypeScript Demo 配置本地环境、安装锁定依赖和测试浏览器，并验证基础页面。用于首次启动或环境恢复。
---

读取项目 package.json、锁文件和 docs/FEATURE-SPEC.md，确认项目根目录。只在该目录工作。

1. 实际记录开始时间、Node/npm/OS 版本、源码版本、依赖是否已存在。优先使用兼容的已安装 Node，不覆盖系统级环境。
2. 有锁文件执行 npm ci；首次无锁可 npm install 生成锁文件。安装失败保留原始输出并定位，不随意升级业务依赖。遇用户 npm 缓存权限问题，可为本次运行指定项目 artifacts 下独立缓存，避免修改既有缓存的所有权。安装 Playwright 的 Chromium 和 WebKit（npm exec playwright install chromium webkit）；记录缓存命中或下载，不伪称全新机器。
3. 执行类型检查，启动开发服务，只绑定127.0.0.1；端口冲突时另选端口，不终止他人进程。确认实际 HTTP 响应与页面。
4. 用项目 E2E 基础测试验证首页、加购、小计和导航。还没有基础测试时，报告并协调提供，不把命令启动成功当作页面验收通过。
5. 保存 artifacts/<run-id>/environment.md 和原始日志、基础版截图，包含实际地址、PID、时间、命令、结果、未解决项。交给开发角色。

不实现优惠功能、不伪造日志、不发布公网。不满足环境验收则明确阻塞，不虚报后续成功。
