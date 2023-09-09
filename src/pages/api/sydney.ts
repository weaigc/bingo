import { NextApiRequest, NextApiResponse } from 'next'
import { WebSocket, debug } from '@/lib/isomorphic'
import { BingWebBot } from '@/lib/bots/bing'
import { websocketUtils } from '@/lib/bots/bing/utils'
import { WatchDog, createHeaders } from '@/lib/utils'

export const config = {
  api: {
    responseLimit: false,
  },
}

const { WS_ENDPOINT = 'sydney.bing.com' } = process.env

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const conversationContext = req.body
  const headers = createHeaders(req.cookies)
  const id = headers['x-forwarded-for']
  headers['x-forwarded-for'] = conversationContext?.userIpAddress || headers['x-forwarded-for']

  debug(id, conversationContext, headers)
  res.setHeader('Content-Type', 'text/stream; charset=UTF-8')

  const ws = new WebSocket(`wss://${WS_ENDPOINT}/sydney/ChatHub`, {
    headers: {
      ...headers,
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32',
      pragma: 'no-cache',
    }
  })

  const closeDog = new WatchDog()
  const timeoutDog = new WatchDog()
  ws.onmessage = (event) => {
    timeoutDog.watch(() => {
      debug(id, 'timeout')
      ws.send(websocketUtils.packMessage({ type: 6 }))
    }, 3000)
    closeDog.watch(() => {
      debug(id, 'timeout close')
      ws.close()
    }, 20000)
    res.write(event.data)
    if (/\{"type":([367])\b/.test(String(event.data))) {
      const type = parseInt(RegExp.$1, 10)
      debug(id, 'connection type', type)
      if (type === 3) {
        ws.close()
      } else {
        ws.send(websocketUtils.packMessage({ type }))
      }
    }
  }

  ws.onclose = () => {
    timeoutDog.reset()
    closeDog.reset()
    debug(id, 'ws close')
    res.end()
  }

  await new Promise((resolve) => ws.onopen = resolve)
  ws.send(websocketUtils.packMessage({ protocol: 'json', version: 1 }))
  ws.send(websocketUtils.packMessage({ type: 6 }))
  ws.send(websocketUtils.packMessage(BingWebBot.buildChatRequest(conversationContext!)))
  req.socket.once('close', () => {
    debug(id, 'connection close')
    ws.close()
    if (!res.closed) {
      res.end()
    }
  })
}
