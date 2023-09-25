import { NextApiRequest, NextApiResponse } from 'next'
import EventEmitter from 'events'
import { pEvent } from 'p-event'
import { fetch, debug } from '@/lib/isomorphic'
import { encodeHeadersToCookie } from '@/lib/utils'
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
let working = false
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
emitter.addListener('create', async () => {
  if (working) return
  working = true
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
      emitter.emit('done', { status: 'fail' })
      working = false
      return
    }
    debug('wait captcha valid')
    await sleep(3000)
    await remoteFetch('https://www.bing.com/turing/conversation/create', [])
    await sleep(1000)
  }
  debug('create conversation')
  emitter.emit('done', await remoteFetch('https://www.bing.com/turing/conversation/create', []))
  working = false
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    debug('new')
    emitter.emit('create')
    const { status, solution: { cookies, response } } = await pEvent(emitter, 'done', { timeout: 50000 }) || {} as any
    const content = /<pre>([^<]+)/.test(response) ? RegExp.$1 : ''
    if (
      status != 'ok'
      || !content
      || content.includes('|BingProd|')
      || !content.includes('conversationSignature')
    ) {
      validMatchine.setState(false)
      throw new Error('create conversation error')
    }
    const cookie = cookies.filter((cookie: any) => cookie.domain === '.bing.com').concat(requestCookies).map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ')
    const bingCookies = encodeHeadersToCookie(`curl -H 'cookie: ${cookie}'`)
    res.setHeader('set-cookie', bingCookies.concat([`RESET=`]).map(cookie => `${cookie.trim()}; Max-Age=${86400 * 30}; Path=/;`))
    return res.end(content)
  } catch (e) {
    return res.end(JSON.stringify({
      result: {
        value: 'TryLater',
        message: `Please try again after a while`
      }
    }))
  }
}
