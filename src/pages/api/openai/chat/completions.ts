import { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert'
import NextCors from 'nextjs-cors';
import { BingWebBot } from '@/lib/bots/bing'
import { BingConversationStyle } from '@/lib/bots/bing/types'

export const config = {
  api: {
    responseLimit: false,
  },
}

export type Role = 'user' | 'assistant'
export type Action = 'next' | 'variant';

export interface APIMessage {
  role: Role
  content: string
}

export interface APIRequest {
  model: string
  action: Action
  messages: APIMessage[]
  stream?: boolean
}

export interface APIResponse {
  choices: {
    delta?: APIMessage
    message: APIMessage
  }[]
}

function parseOpenAIMessage(request: APIRequest) {
  const validMessages = request.messages.slice(0, Math.max(1, request.messages.findLastIndex(message => message.role === 'user') + 1))
  const prompt = validMessages.pop()?.content
  const context = validMessages.map(message => `[${message['role']}](#message)\n${message['content']}\n`).join('\n')
  return {
    prompt,
    context,
    stream: request.stream,
    model: /Creative|gpt-?4/i.test(request.model) ? 'Creative' : 'Balanced',
  };
}

function responseOpenAIMessage(content: string): APIResponse {
  const message: APIMessage = {
    role: 'assistant',
    content,
  };
  return {
    choices: [{
      delta: message,
      message,
    }],
  };
}

function getOriginFromHost(host: string) {
  const uri = new URL(`http://${host}`)
  if (uri.protocol === 'http:' && !/^[0-9.:]+$/.test(host)) {
    uri.protocol = 'https:';
  }
  return uri.toString().slice(0, -1)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).end('ok')
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  })
  const abortController = new AbortController()

  req.socket.once('close', () => {
    abortController.abort()
  })
  const { prompt, stream, model, context } = parseOpenAIMessage(req.body);
  let lastLength = 0
  let lastText = ''
  try {
    const chatbot = new BingWebBot({
      endpoint: getOriginFromHost(req.headers.host || '127.0.0.1:3000'),
    })

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    }

    assert(prompt, 'messages can\'t be empty!')

    const toneType = model as BingConversationStyle

    await chatbot.sendMessage({
      prompt,
      context,
      options: {
        bingConversationStyle: Object.values(BingConversationStyle)
          .includes(toneType) ? toneType : BingConversationStyle.Creative,
      },
      signal: abortController.signal,
      onEvent(event) {
        if (event.type === 'UPDATE_ANSWER') {
          lastText = event.data.text
          if (stream && lastLength !== lastText.length) {
            res.write(`data: ${JSON.stringify(responseOpenAIMessage(lastText.slice(lastLength)))}\n\n`)
            lastLength = lastText.length
          }
        }
      },
    })
  } catch (error) {
    console.log('Catch Error:', error)
    res.write(`data: ${JSON.stringify(responseOpenAIMessage(`${error}`))}\n\n`)
  } finally {
    if (stream) {
      res.end(`data: [DONE]\n\n`);
    } else {
      res.end(JSON.stringify(responseOpenAIMessage(lastText)))
    }
  }
}
