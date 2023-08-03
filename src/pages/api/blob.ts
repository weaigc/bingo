'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
import { fetch } from '@/lib/isomorphic'

const API_DOMAIN = 'https://www.bing.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { bcid } = req.query

    const { headers, body } = await fetch(`${API_DOMAIN}/images/blob?bcid=${bcid}`,
      {
        method: 'GET',
        headers: {
          "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "Referrer-Policy": "origin-when-cross-origin",
        },
      },
    )

    res.writeHead(200, {
      'Content-Length': headers.get('content-length')!,
      'Content-Type': headers.get('content-type')!,
    })
    // @ts-ignore
    return Readable.fromWeb(body!).pipe(res)
  } catch (e) {
    console.log('Error', e)
    return res.json({
      result: {
        value: 'UploadFailed',
        message: `${e}`
      }
    })
  }
}
