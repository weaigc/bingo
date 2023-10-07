import { NextApiRequest, NextApiResponse } from 'next'
import EventEmitter from 'events'
import { pEvent } from 'p-event'
import PQueue from 'p-queue';
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders, encodeHeadersToCookie } from '@/lib/utils'
import { sleep } from '@/lib/bots/bing/utils'

const requestCookies = [
  {
    "name": "_U",
    "value": "xxx"
  },
]

async function remoteFetch(url: string, cookies: any[]) {
  const abort = new AbortController()
  setTimeout(() => {
    abort.abort()
  }, 50000)
  const resp = await fetch('http://127.0.0.1:8181/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abort.signal,
    body: JSON.stringify({
      "cmd": "request.get",
      "session": "d4b5a514-5751-11ee-963b-6ef6de7a7b4a",
      url,
      "maxTimeout": 50000,
      "headers": {
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "x-ms-useragent": "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.3 OS/Win32",
        "referer": "https://www.bing.com/search?showconv=1&sendquery=1&q=Bing%20AI&form=MY02CJ&OCID=MY02CJ&OCID=MY02CJ&pl=launch"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.0.0",
      cookies,
      "returnOnlyCookies": false
    })
  }).then(res => res.json()).catch(e => {
    console.log('fetch error', e)
    return {}
  }) || {}
  return resp
}
async function destory() {
  await fetch('http://127.0.0.1:8181/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "cmd": "sessions.destroy",
      "session": "d4b5a514-5751-11ee-963b-6ef6de7a7b4a",
    })
  })
}

const emitter = new EventEmitter()
const queue = new PQueue({ concurrency: 1 });
let cookie = ''
let useCount = 0
let validMatchine = {
  state: false,
  tid: 0,
  setState(valid: boolean) {
    clearTimeout(validMatchine.tid)
    validMatchine.state = valid
    if (valid) {
      validMatchine.tid = setTimeout(() => {
        validMatchine.state = false
      }, 300 * 1000) as unknown as number
    }
  },
}

function createWork() {
  return new Promise(async (resolve) => {
    debug('use count', ++useCount)
    if (useCount >= 6 || !validMatchine.state) {
      useCount = 0
      validMatchine.setState(true)
      debug('destory')
      await destory()
      await sleep(1000)
      debug('captcha')
      const { status, message } = await remoteFetch('https://www.bing.com/turing/captcha/challenge', requestCookies)
      debug('captcha done')
      if (status !== 'ok' || message !== 'Challenge solved!') {
        debug('captcha error')
        resolve({ content: '' })
        return
      }
      debug('wait captcha valid')
      await sleep(3000)
      const { solution: { cookies } } = await remoteFetch('https://www.bing.com/turing/conversation/create?bundleVersion=1.1055.8', [])
      cookie = requestCookies.concat(cookies).map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ')
    }
    debug('create conversation')
    const response = await fetch(`https://www.bing.com/turing/conversation/create?bundleVersion=1.1055.8`,
      {
        method: 'GET',
        headers: {
          ...createHeaders({ BING_HEADER: '' }),
          cookie,
        },
      })
      .catch((error) => {
        console.log('Fetch error', error);
        return {
          url: '',
          headers: new Headers(),
          status: 500,
        }
      })

    debug('status', response.status, response.url)
    if (response.status === 200) {
      // @ts-ignore
      const json = await response.json().catch((e: any) => ({}))
      if (!json?.clientId) {
        resolve({})
        return
      }
      json.encryptedconversationsignature = response.headers.get('X-Sydney-encryptedconversationsignature') || undefined
      if (!json?.conversationSignature && !json.encryptedconversationsignature) {
        resolve({})
        return
      }
      console.log('json', json)
      resolve({
        json,
        cookie
      })
    } else {
      resolve({})
    }
  })
}

emitter.addListener('create', async (id) => {
  queue.add(() => {
    createWork().then((result) => {
      emitter.emit(id, result)
    })
  })
})

async function createContext() {
  const id = String(Date.now())
  emitter.emit('create', id)
  const { cookie, json } = await pEvent(emitter, id, { timeout: 50000 }) || {} as any
  if (
    !json
  ) {
    validMatchine.setState(false)
    throw new Error('create conversation error')
  }
  return { cookie, json }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    debug('new')
    const { json, cookie } = await createContext()
    const bingCookies = encodeHeadersToCookie(`curl -H 'cookie: ${cookie}'`)
    res.setHeader('set-cookie', bingCookies.map(cookie => `${cookie.trim()}; Max-Age=${86400 * 30}; Path=/;`))
    res.end(JSON.stringify(json))
    return
  } catch (e) {
    console.log('handler error', e)
    res.end(JSON.stringify({
      result: {
        value: 'TryLater',
        message: `Please try again after a while`
      }
    }))
    return
  }
}
