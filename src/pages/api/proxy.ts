'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch } from '@/lib/isomorphic'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, headers, method = 'GET', body } = req.body
    if (!url) {
      return res.end('ok')
    }
    const response = await fetch(url, { headers, method, body })
      .then((res) => res.text())

    res.end(response)
  } catch (e) {
    console.log(e)
    return res.end(e)
  }
}
