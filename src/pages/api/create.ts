'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders, randomIP, extraHeadersFromCookie } from '@/lib/utils'
import { sleep } from '@/lib/bots/bing/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let count = 0
    const headers = createHeaders(req.cookies)
    do {
      headers['x-forwarded-for'] = headers['x-forwarded-for'] || randomIP()
      const endpoints = [req.headers['x-endpoint'], ...(process.env.ENDPOINT || '').split(',').filter(Boolean), 'www.bing.com']
      const endpoint = endpoints[count % endpoints.length]
      const { conversationId } = req.query
      const query = conversationId ? new URLSearchParams({
        conversationId: String(conversationId),
      }) : ''
      debug(`try ${count+1}`, endpoint, headers['x-forwarded-for'])
      const response = await fetch(`https://${endpoint || 'www.bing.com'}/turing/conversation/create?${query}`, { method: 'GET', headers })
        .catch(e => {
          if (endpoint === 'www.bing.com') {
            throw e
          }
          return e
        })
      debug('status', response.status, response.url, headers)
      if (response.status === 200) {
        const json = await response.json().catch((e: any) => {})
        console.log('json', json)
        if (!json?.conversationSignature) {
          continue
        }
        const cookies = [`BING_IP=${headers['x-forwarded-for']}`]

        res.setHeader('set-cookie', cookies.map(cookie => `${cookie.trim()}; Max-Age=${86400 * 30}; Path=/;`))
        debug('headers', headers)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({
          ...json,
          // userIpAddress: endpoint && !endpoint.endsWith('.bing.com') ? await lookupPromise(endpoint.split('/')[0]) : headers['x-forwarded-for']
        }))
        return
      }
      await sleep(2000)
      headers['x-forwarded-for'] = ''
    } while(count++ < 10)
    res.end(JSON.stringify({
      result: {
        value: 'TryLater',
        message: `Please try again after a while`
      }
    }))
  } catch (e) {
    console.log('error', e)
    res.end(JSON.stringify({
      result: {
        value: 'UnauthorizedRequest',
        message: `${e}`
      }
    }))
  }
}
