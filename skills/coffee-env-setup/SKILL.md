---
name: coffee-env-setup
description: 为山隅咖啡杯型实验安装锁定依赖及项目独立测试浏览器，验证已有页面与优惠券并交接。用于首次启动、环境还原后的复验，不提前实现新功能。
metadata:
  version: "2.0.0"
---

# 环境配置与基线交接

先定位用户指定的项目根目录（含package.json和experiment-contract.json）。技能安装目录不是项目目录。只在这个项目中执行。

读取docs/FEATURE-SPEC.md、docs/ACCEPTANCE.md、docs/EXPERIMENT.md、package.json及锁文件。当前基线已经有优惠券，待开发的是杯型选择/改配合并/旧数据迁移。不要把旧“开业券”当新增需求。

1. 建立本次run-id，记录真实工具/模型、开始时间、OS、Node/npm、项目目录、源码版本/文件哈希及node_modules、dist、项目缓存是否存在。检查共同60分钟预算及前轮状态。记录安装与功能耗时。
2. 运行npm run check:contract。冻结文档校验不符则报告，不能更新哈希掩盖改动。使用符合engines的已有Node；缺少时报告兼容版本安装方案，不覆盖系统环境。
3. 锁文件存在时npm ci；锁文件缺失视为基线不完整，不擅自改用最新版依赖。核对npm config get cache应在项目.workbuddy-cache/npm。npm run setup:browsers安装Chromium和WebKit至项目.workbuddy-cache/browsers；记录实际下载/缓存命中，不宣称全新电脑。不要直接用全局npx安装浏览器或改全局缓存权限。
4. 类型检查、现有单测和完整旧E2E：npm run typecheck、npm run test:unit、npm run test:e2e。E2E自行启停服务；指定本轮唯一E2E_REPORT_DIR。确认首页、购物袋、券、导航及页面截图；单纯服务启动/HTTP200不代表基线验收。
5. 保存artifacts/<run-id>/environment/中的environment.md、真实原始日志、命令退出码、截图和E2E路径；记录时间、版本/哈希、实际地址/所属PID、已停止/保留的服务、未解决问题。日志重定向不能吞退出码（管道记录时使用pipefail或等价方式）。
6. 基线全部通过才交开发；报告“基线验证通过，新杯型未开发”。失败保留原证据并修复环境问题；若须更改业务源码，应报告基线缺陷并与两组一致处理，不能偷做新功能。浏览器缺失/安装失败不是功能通过。

不删除共享缓存、不sudo、不终止他人进程、不公网发布。历史Codex日志不能作为本次证据。只在本轮真实运行后写结果；超过预算或连续3轮无进展时列出阻塞及复现命令。交付报告路径给下一阶段，不假定已自动创建其他Agent。
