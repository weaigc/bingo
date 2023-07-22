import { NextApiRequest, NextApiResponse } from 'next'
import { WebSocket } from '@/lib/isomorphic';
import { BingWebBot } from '@/lib/bots/bing';
import { websocketUtils } from '@/lib/bots/bing/utils';
import { RND_IP, parseCookie } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const conversationContext = req.body
  const {
    BING_COOKIE = process.env.BING_COOKIE!,
    UA = process.env.BING_UA
  } = req.cookies

  const ua = decodeURIComponent(UA || '') || req.headers['user-agent']

  if (!BING_COOKIE) {
    return res.end('{"erro": "no cookie"}')
  }

  const parsedCookie = parseCookie(BING_COOKIE)
  if (!parsedCookie) {
    return res.end('{"erro": "invalid cookie"}')
  }

  res.setHeader('Content-Type', 'text/stream; charset=UTF-8')

  const ws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub', {
    headers: {
      'x-forwarded-for': RND_IP,
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'User-Agent': ua,
      pragma: 'no-cache',
      cookie: `_U=${parsedCookie}` || '',
    }
  })

  ws.onmessage = (event) => {
    if (Math.ceil(Date.now() / 1000) % 6 === 0) {
      ws.send(websocketUtils.packMessage({ type: 6 }))
    }
    res.write(event.data)
    if (String(event.data).lastIndexOf('{"type":3,"invocationId":"0"}') > 0) {
      ws.close()
    }
  }

  ws.onclose = () => {
    res.end()
  }

  await new Promise((resolve) => ws.onopen = resolve)
  ws.send(websocketUtils.packMessage({ protocol: 'json', version: 1 }))
  ws.send(websocketUtils.packMessage({ type: 6 }))
  ws.send(websocketUtils.packMessage(BingWebBot.buildChatRequest(conversationContext!)))
  req.socket.once('close', () => {
    ws.close()
  })
}
