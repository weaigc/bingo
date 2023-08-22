'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
import { fetch } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'

const { ENDPOINT = 'www.bing.com' } = process.env

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { bcid } = req.query
    const { headers, body } = await fetch(`https://${ENDPOINT}/images/blob?bcid=${bcid}`,
      {
        method: 'GET',
        headers: createHeaders(req.cookies, 'image'),
      },
    )

    res.writeHead(200, {
      'Content-Length': headers.get('content-length')!,
      'Content-Type': headers.get('content-type')!,
    })
    // @ts-ignore
    Readable.fromWeb(body!).pipe(res)
  } catch (e) {
    console.log('Error', e)
    res.json({
      result: {
        value: 'UploadFailed',
        message: `${e}`
      }
    })
  }
}
