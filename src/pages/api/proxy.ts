'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch } from '@/lib/isomorphic'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, headers, method = 'GET', body } = req.body
    if (!url) {
      return res.end('ok')
    }
    const response = await fetch(url, { headers, method, body, redirect: 'manual' })
    const text = await response.text()
      res.writeHead(200, {
        'Content-Type': 'application/text',
        'x-url': response.url,
        'x-status': response.status,
      })
    res.end(text)
  } catch (e) {
    console.log(e)
    return res.end(e)
  }
}
