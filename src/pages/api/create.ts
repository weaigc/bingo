'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch, debug } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'

// const API_ENDPOINT = 'https://www.bing.com/turing/conversation/create'
const API_ENDPOINT = 'https://edgeservices.bing.com/edgesvc/turing/conversation/create';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const headers = createHeaders(req.cookies)

    debug('headers', headers)
    const response = await fetch(API_ENDPOINT, { method: 'GET', headers })
      .then((res) => res.text())
    res.writeHead(200, {
      'Content-Type': 'application/json',
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
