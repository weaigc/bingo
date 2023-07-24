'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { debug } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'
import { createImage } from '@/lib/bots/bing/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, id } = req.query
  if (!prompt) {
    return res.json({
      result: {
        value: 'Image',
        message: 'No Prompt'
      }
    })
  }
  try {
    const headers = createHeaders(req.cookies)

    debug('headers', headers)
    const response = await createImage(String(prompt), String(id), headers)
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=UTF-8',
    })
    return res.end(response)
  } catch (e) {
    return res.json({
      result: {
        value: 'Error',
        message: `${e}`
      }
    })
  }
}
