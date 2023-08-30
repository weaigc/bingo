'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import FormData from 'form-data'
import { debug, fetch } from '@/lib/isomorphic'
import { KBlobRequest } from '@/lib/bots/bing/types'
import { createHeaders } from '@/lib/utils'

const API_DOMAIN = 'https://www.bing.com'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Set desired value here
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { knowledgeRequest, imageBase64 } = req.body as KBlobRequest
    const headers = createHeaders(req.cookies, 'image')

    const formData = new FormData()
    formData.append('knowledgeRequest', JSON.stringify(knowledgeRequest))
    if (imageBase64) {
      formData.append('imageBase64', imageBase64)
    }

    const response = await fetch(`${API_DOMAIN}/images/kblob`,
      {
        method: 'POST',
        body: formData.getBuffer(),
        headers: {
          'x-forwarded-for': headers['x-forwarded-for'],
          'user-agent': headers['User-Agent'],
          cookie: headers['cookie'],
          Referer: 'https://www.bing.com/search?q=Bing+AI&showconv=1',
          'Sec-Fetch-Dest': 'iframe',
          ...formData.getHeaders()
        }
      }
    )

    if (response.status !== 200) {
      throw new Error('图片上传失败')
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    res.end(await response.text())
  } catch (e) {
    res.json({
      result: {
        value: 'UploadFailed',
        message: `${e}`
      }
    })
  }
}
