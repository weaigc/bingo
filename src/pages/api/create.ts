'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders, randomIP } from '@/lib/utils'
import { sleep } from '@/lib/bots/bing/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let count = 0
    const headers = createHeaders({
      ...req.cookies,
      BING_IP: randomIP()
    })
    do {
      const endpoints = [req.headers['x-endpoint'], ...(process.env.ENDPOINT || '').split(','), 'www.bing.com'].filter(Boolean)
      const endpoint = endpoints[count % endpoints.length]
      const { conversationId } = req.query
      const query = new URLSearchParams({
        bundleVersion: '1.1055.8',
      })
      if (conversationId) {
        query.set('conversationId', String(conversationId))
      }

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
        const json = await response.json().catch((e: any) => {
          console.log('fetch error', e)
        }) || {}
        debug('json', json)
        json.encryptedconversationsignature = json.encryptedconversationsignature || response.headers.get('X-Sydney-encryptedconversationsignature') || undefined

        if (!json?.clientId || (!json?.conversationSignature && !json.encryptedconversationsignature) || (headers.cookie.includes('xxx') && !json.conversationId.includes('BingProdUnAuthenticatedUsers'))) {
          await sleep(2000)
          continue
        }

        const cookie = response.headers.getSetCookie().join('; ')
        debug('headers', headers, cookie)

        // const bingCookie = btoa(`curl -H 'cookie: ${cookie}'`)
        res.setHeader('set-cookie', [
          // ...[`BING_HEADER=${bingCookie.trim()}`, `BING_IP=${response.headers.get('x-forwarded-for') || headers['x-forwarded-for']}`].map(c => `${c}; Max-Age=${86400 * 30}; Path=/;`),
          ...[`BING_HEADER=`, `BING_IP=`].map(c => `${c}; Max-Age=0; Path=/;`)
        ])

        res.writeHead(200, {
          'Content-Type': 'application/json',
        })

        res.end(JSON.stringify(json))
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
