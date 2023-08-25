'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, headers = {}, method = 'GET', body } = req.body
    if (!url) {
      return res.end('{}')
    }
    Object.assign(headers, createHeaders(req.cookies))
    const id = headers['x-forwarded-for']
    debug(id, method, url, headers, body ?? '')
    const response = await fetch(url, {
      headers,
      method,
      body,
      redirect: 'manual'
    })
    const text = await response.text()
      res.writeHead(200, {
        'Content-Type': 'application/text; charset=UTF-8',
        'x-url': response.url,
        'x-status': response.status,
      })
    res.end(text)
  } catch (e) {
    console.log(e)
    res.end(String(e))
    return
  }
}
