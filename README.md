---
title: bingo
emoji: 📉
colorFrom: red
colorTo: red
sdk: docker
pinned: true
license: mit
---

<div align="center">

# Bingo 

Bingo，一个让你呼吸顺畅 New Bing。

高度还原 New Bing 网页版的主要操作，国内可用，兼容绝大多数微软 Bing AI 的功能，可自行部署使用。

[![MIT License](https://img.shields.io/badge/license-MIT-97c50f)](https://github.com/weaigc/bingo/blob/main/license)


</div>

## 演示站点

https://bing.github1s.tk

[![img](./docs/images/demo.png)](https://bing.github1s.tk)

## 功能和特点

- 完全基于 Next.js 重写，高度还原 New Bing Web 版 UI，使用体验和 Bing AI 基本一致。
- 支持 Docker 构建，方便快捷地部署和访问。

## RoadMap

 - [x] 支持 wss 转发
 - [x] 支持一键部署
 - [x] 优化移动端展示
 - [ ] 适配深色模式
 - [ ] 支持画图
 - [ ] 支持内置提示词
 - [ ] 支持语音输入
 - [ ] 支持图片输入
 - [ ] 支持离线访问

## 一键部署
你也可以一键部署自己的 New Bing AI 到 🤗 HuggingFace 上

[![Deploy to HuggingFace](https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E9%83%A8%E7%BD%B2-%F0%9F%A4%97-fff)](https://huggingface.co/login?next=%2Fspaces%2Fhf4all%2Fbingo%3Fduplicate%3Dtrue%26visibility%3Dpublic)

## 环境和依赖

- Node.js >= 18
- Bing AI 的 Cookie (前往 https://www.bing.com/ ，登录，然后[找到 bing.com 域名下的一个名叫 _U 的 Cookie 的值](#如何获取-cookie))

## 安装和使用

* 使用 Node 启动

```bash
git clone https://github.com/weaigc/bingo.git
npm i # 推荐使用 pnpm i
npm run build
npm run start
```

* 使用 Docker 启动
```bash
git clone https://github.com/weaigc/bingo.git
docker build . -t bingo
docker run --rm -it -e BING_COOKIE=xxxx -p 7860:7860 bingo # BING_COOKIE 为 bing.com 域名下的一个名叫 _U 的 Cookie 的值
```

## 如何获取 Cookie
![Coookie](./docs/images/bing-cookie.png)

## 鸣谢
 - 感谢 [EdgeGPT](https://github.com/acheong08/EdgeGPT) 提供的代理 API 的方法。
 - 感谢 [Vercel AI](https://github.com/vercel-labs/ai-chatbot) 提供的基础脚手架和 [ChatHub](https://github.com/chathub-dev/chathub) [go-proxy-bingai](https://github.com/adams549659584/go-proxy-bingai) 提供的部分代码。

## License

MIT © [LICENSE](https://github.com/weaigc/bingo/blob/main/LICENSE).


