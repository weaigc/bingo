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

 * 站点一：https://bing.github1s.tk （推荐）
 * 站点二：https://effulgent-bubblegum-e2f5df.netlify.app （此站点部署到 Netlify 上）


[![img](./docs/images/demo.png)](https://bing.github1s.tk)

## 功能和特点

- 完全基于 Next.js 重写，高度还原 New Bing Web 版 UI，使用体验和 Bing AI 基本一致。
- 支持 Docker 构建，方便快捷地部署和访问。
- Cookie 可全局配置，全局共享。
- 支持持续语音对话

## RoadMap

 - [x] 支持 wss 转发
 - [x] 支持一键部署
 - [x] 优化移动端展示
 - [x] 支持画图
 - [x] 支持语音输入(支持语音指令，目前仅支持 PC 版 Edge 及 Chrome 浏览器)
 - [x] 支持语音输出(需要手动开启)
 - [ ] 适配深色模式
 - [ ] 支持内置提示词
 - [ ] 支持图片输入
 - [ ] 支持离线访问
 - [ ] 国际化翻译

## 一键部署
你也可以一键部署自己的 New Bing AI 到 🤗 HuggingFace 、 Netlify 等平台上

### 部署到 Huggingface
[![Deploy to HuggingFace](https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E9%83%A8%E7%BD%B2-%F0%9F%A4%97-fff)](https://huggingface.co/login?next=%2Fspaces%2Fhf4all%2Fbingo%3Fduplicate%3Dtrue%26visibility%3Dpublic)

> Huggingface 不支持绑定自己的域名，不过我们可以使用曲线救国的方式来达到这个目的
1. 方式一，借助 Github Pages 及 iframe [如何绑定域名](https://github.com/weaigc/bingo/issues/4)
2. 方式二，Cloudflare Workers 

### 部署到 Netlify
[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/weaigc/bingo)

### 部署到 Vercel
如果你是 Vercel 付费用户，可以点以下链接一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=bingo&demo-description=bingo&demo-url=https%3A%2F%2Fbing.github1s.tk%2F&project-name=bingo&repository-name=bingo&repository-url=https%3A%2F%2Fgithub.com%2Fweaigc%2Fbingo&from=templates&skippable-integrations=1&env=BING_COOKIE%2CBING_UA%2CBING_IP&envDescription=%E5%A6%82%E6%9E%9C%E4%B8%8D%E7%9F%A5%E9%81%93%E6%80%8E%E4%B9%88%E9%85%8D%E7%BD%AE%E8%AF%B7%E7%82%B9%E5%8F%B3%E4%BE%A7Learn+More&envLink=https%3A%2F%2Fgithub.com%2Fweaigc%2Fbingo%2Fblob%2Fmain%2F.env.example)

### 部署到 Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/weaigc/bingo)


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


