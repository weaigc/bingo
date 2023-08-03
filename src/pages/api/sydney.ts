import { NextApiRequest, NextApiResponse } from 'next'
import { WebSocket, debug } from '@/lib/isomorphic';
import { BingWebBot } from '@/lib/bots/bing';
import { websocketUtils } from '@/lib/bots/bing/utils';
import { WatchDog, createHeaders } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const conversationContext = req.body
  const headers = createHeaders(req.cookies)
  debug(headers)
  res.setHeader('Content-Type', 'text/stream; charset=UTF-8')

  const ws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub', {
    headers: {
      ...headers,
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    }
  })

  const watchDog = new WatchDog()
  ws.onmessage = (event) => {
    watchDog.watch(() => {
      ws.send(websocketUtils.packMessage({ type: 6 }))
    })
    res.write(event.data)
    if (String(event.data).lastIndexOf('{"type":3,"invocationId":"0"}') > 0) {
      ws.close()
    }
  }

  ws.onclose = () => {
    watchDog.reset()
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
