'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders, randomIP } from '@/lib/utils'
import { sleep } from '@/lib/bots/bing/utils'

const API_ENDPOINT = 'https://www.bing.com/turing/conversation/create'
// const API_ENDPOINT = 'https://edgeservices.bing.com/edgesvc/turing/conversation/create';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let count = 0
    let { BING_IP, ...cookies } = req.cookies
    do {
      const headers = createHeaders({
        ...cookies,
        BING_IP: BING_IP || randomIP(),
      })
      const response = await fetch(API_ENDPOINT, { method: 'GET', headers })
      if (response.status === 200) {
        res.setHeader('set-cookie', [headers.cookie, `BING_IP=${headers['x-forwarded-for']}`]
          .map(cookie => `${cookie}; Max-Age=${86400 * 30}; Path=/; SameSite=None; Secure`))
        debug('headers', headers)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(await response.text())
        break;
      }
      BING_IP = ''
      await sleep(1000)
      debug('loop', count)
    } while(count++ < 10)
    res.end(JSON.stringify({
      result: {
        value: 'TryLater',
        message: `Please try again after a while`
      }
    }))
  } catch (e) {
    console.log('error', e)
    return res.end(JSON.stringify({
      result: {
        value: 'UnauthorizedRequest',
        message: `${e}`
      }
    }))
  }
}
