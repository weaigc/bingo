import { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert'
import NextCors from 'nextjs-cors';
import { BingWebBot } from '@/lib/bots/bing'
import { BingConversationStyle, APIMessage, Action } from '@/lib/bots/bing/types'
import { messageToContext } from '@/lib/utils';

export const config = {
  api: {
    responseLimit: false,
  },
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
  const messages = request.messages.slice(0)
  const prompt = messages.pop()?.content
  const context = messageToContext(messages)
  return {
    prompt,
    context,
    stream: request.stream,
    allowSearch: /Creative|Balanced|Precise/i.test(request.model),
    model: /Creative|gpt-?4/i.test(request.model) ? 'Creative' : request.model,
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

  let authFlag = false
  if (process.env.apikey) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token === process.env.apikey) {
        authFlag = true;
      } else {
        authFlag = false;
        res.status(401).send('授权失败');
      }
    } else {
      authFlag = false;
      res.status(401).send('缺少授权信息');
    }
  } else {
    authFlag = true;
  }
  if (authFlag) {
    const {prompt, stream, model, allowSearch, context} = parseOpenAIMessage(req.body);
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
          allowSearch,
          bingConversationStyle: Object.values(BingConversationStyle)
            .includes(toneType) ? toneType : BingConversationStyle.Creative,
        },
        signal: abortController.signal,
        onEvent(event) {
          if (event.type === 'UPDATE_ANSWER' && event.data.text) {
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
}
