<div align="center">

# Bingo 

Bingo，一个让你呼吸顺畅 New Bing。

高度还原 New Bing 网页版的主要操作，国内可用，兼容绝大多数微软 Bing AI 的功能，可自行部署使用。

[![MIT License](https://img.shields.io/badge/license-MIT-97c50f)](https://github.com/weaigc/bingo/blob/main/license)

</div>


## 功能和特点

- 高度还原 New Bing Web 版 UI，使用上和 Bing AI 基本一致。
- 支持搭建在 Vercel 上和 Docker 构建，方便快捷地部署和访问。

## RoadMap

 - [x] 支持 wss 转发
 - [ ] 优化移动端展示
 - [ ] 支持画图
 - [ ] 支持一键部署
 - [ ] 支持内置提示词
 - [ ] 支持语音输入
 - [ ] 增加桌面客户端

## 一键部署
你也可以一键部署自己的 New Bing AI 到 Vercel 上 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=New+Bing+AI&project-name=bingo&repository-name=bingo&repository-url=https%3A%2F%2Fgithub.com%2Fweaigc%2Fbingo&from=templates&skippable-integrations=1&env=BING_COOKIE%2CBING_UA&teamCreateStatus=hidden)


## 环境和依赖

- Node.js >= 18
- Bing AI 的 Cookie (可在 https://chatgpt.com/ 注册获取)

## 安装和使用

1. 克隆本项目到本地：

```bash
git clone https://github.com/weaigc/bingo.git
npm i # 推荐使用 pnpm i
npm run build
npm run start
```

## 鸣谢
 - 感谢 [EdgeGPT](https://github.com/acheong08/EdgeGPT) 提供的代理 API 的方法。
 - 感谢 [Vercel AI](https://github.com/vercel-labs/ai-chatbot) 提供的基础脚手架。

## License

Apache 2.0 © [LICENSE](https://github.com/weaigc/bingo/blob/main/LICENSE).


