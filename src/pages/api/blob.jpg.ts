'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
import { fetch } from '@/lib/isomorphic'
import { createHeaders } from '@/lib/utils'

const API_DOMAIN = 'https://www.bing.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { bcid } = req.query
    const { headers, body } = await fetch(`${API_DOMAIN}/images/blob?bcid=${bcid}`,
      {
        method: 'GET',
        headers: {
          ...createHeaders(req.cookies, false),
          Referer: 'https://www.bing.com/search?q=Bing+AI&showconv=1',
          'Sec-Fetch-Dest': 'iframe',
        },
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
