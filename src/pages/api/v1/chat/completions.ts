import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors';
import assert from 'assert'
import { BingWebBot } from '@/lib/bots/bing'
import { BingConversationStyle, ConversationInfoBase } from '@/lib/bots/bing/types'

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
  id?: string
  model: string
  action: Action
  messages: APIMessage[]
  stream?: boolean
}

export interface APIResponse {
  id?: string
  choices: {
    delta?: APIMessage
    message: APIMessage
  }[]
}

function parseOpenAIMessage(request: APIRequest) {
  return {
    prompt: request.messages?.reverse().find((message) => message.role === 'user')?.content,
    stream: request.stream,
    model: request.model,
  };
}

function responseOpenAIMessage(content: string, id?: string): APIResponse {
  const message: APIMessage = {
    role: 'assistant',
    content,
  };
  return {
    id,
    choices: [{
      delta: message,
      message,
    }],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method !== 'POST') return res.status(403).end()
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const { prompt, stream, model } = parseOpenAIMessage(req.body);
  console.log('prompt', prompt, stream, process.env.PORT)
  let { id } = req.body
  const chatbot = new BingWebBot({
    endpoint: `http://127.0.0.1:${process.env.PORT}`,
    cookie: `BING_IP=${process.env.BING_IP}`
  })
  id ||= JSON.stringify(chatbot.createConversation())

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  }
  let lastLength = 0
  let lastText = ''
  const abortController = new AbortController()
  assert(prompt, 'messages can\'t be empty!')

  const toneType = model as BingConversationStyle
  chatbot.sendMessage({
    prompt,
    options: {
      bingConversationStyle: Object.values(BingConversationStyle)
        .includes(toneType) ? toneType : BingConversationStyle.Creative,
      conversation: JSON.parse(id) as ConversationInfoBase
    },
    signal: abortController.signal,
    onEvent(event) {
      if (event.type === 'UPDATE_ANSWER') {
        lastText = event.data.text
        if (stream && lastLength !== lastText.length) {
          res.write(`data: ${JSON.stringify(responseOpenAIMessage(lastText.slice(lastLength), id))}\n\n`)
          res.flushHeaders()
          lastLength = lastText.length
        }
      } else if (event.type === 'ERROR') {
        res.write(`data: ${JSON.stringify(responseOpenAIMessage(`${event.error}`, id))}\n\n`)
        res.flushHeaders()
      } else if (event.type === 'DONE') {
        if (stream) {
          res.end(`data: [DONE]\n\n`);
        } else {
          res.json(responseOpenAIMessage(lastText, id))
        }
      }
    },
  })
  req.socket.once('close', () => {
    abortController.abort()
  })
}
