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
  const headers = createHeaders(req.cookies, Boolean(req.cookies['BING_HEADER1']))
  const id = headers['x-forwarded-for']
  // headers['x-forwarded-for'] = conversationContext?.userIpAddress || headers['x-forwarded-for']

  debug(id, conversationContext, headers)
  res.setHeader('Content-Type', 'text/stream; charset=UTF-8')
  const uri = new URL(`wss://${req.headers['x-ws-endpoint'] || WS_ENDPOINT}/sydney/ChatHub`)
  if ('encryptedconversationsignature' in conversationContext) {
    uri.searchParams.set('sec_access_token', conversationContext['encryptedconversationsignature'])
  }
  debug(id, 'wss url', uri.toString())
  const ws = new WebSocket(uri.toString(), {
    headers,
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
