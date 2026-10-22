# 山隅咖啡

React + TypeScript + Vite 咖啡店演示项目。包含首页、六款商品、本地购物袋、开业优惠券，以及菜单、订单、个人中心展示页，支持手机和桌面浏览器。

所有商品、会员和订单内容均为本地示例数据，图片为原创概念素材。购物袋和优惠券状态保存在当前浏览器，不涉及后台接口、支付或真实下单。

## 本地运行

使用 package.json 中 engines 支持的 Node.js 版本，.nvmrc 提供版本参考。

```sh
npm ci
npm run dev
```

开发服务仅监听本机，默认地址为 http://127.0.0.1:5173，以终端实际输出为准。

## 构建与本地预览

```sh
npm run build
npm run serve:dist
```

构建产物位于 dist，本地静态预览默认地址为 http://127.0.0.1:4173。

npm run typecheck 可单独检查 TypeScript 类型。安装依赖前，编辑器可能提示缺少 React、Node 或 Vite 类型，安装完成后即可检查。
