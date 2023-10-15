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
        const json = await response.json().catch((e: any) => {})
        console.log('json', json)
        if (!json?.clientId) {
          continue
        }
        json.encryptedconversationsignature = response.headers.get('X-Sydney-encryptedconversationsignature') || undefined

        if (!json?.conversationSignature && !json.encryptedconversationsignature) {
          continue
        }

        debug('headers', headers)
        const cookies = [`BING_IP=${headers['x-forwarded-for']}`]
        res.setHeader('set-cookie', cookies.map(cookie => `${cookie.trim()}; Max-Age=${86400 * 30}; Path=/;`))

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
