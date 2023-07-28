'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'

const API_ENDPOINT = 'https://www.bing.com/turing/captcha/challenge'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const headers = createHeaders(req.cookies)

    debug('headers', headers)
    const response = await fetch(API_ENDPOINT, { method: 'GET', headers, redirect: 'error', mode: 'cors', credentials: 'include' })
      .then((res) => res.text())
    res.writeHead(200, {
      'Content-Type': 'text/html',
    })

    res.end(response)
  } catch (e) {
    return res.json({
      result: {
        value: 'UnauthorizedRequest',
        message: `${e}`
      }
    })
  }
}
