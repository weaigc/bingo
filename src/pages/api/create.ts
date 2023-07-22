'use server'

import { NextApiRequest, NextApiResponse } from 'next'
import { fetch } from '@/lib/isomorphic'
import { RND_IP, parseCookie } from '@/lib/utils'

// const API_ENDPOINT = 'https://www.bing.com/turing/conversation/create'
// const API_ENDPOINT = 'https://edgeservices.bing.com/edgesvc/turing/conversation/create';
const API_ENDPOINT = 'https://bing.vcanbb.top/turing/conversation/create'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    BING_COOKIE = process.env.BING_COOKIE,
    UA = process.env.BING_UA
  } = req.cookies

  const ua = decodeURIComponent(UA || '') || req.headers['user-agent']

  if (!BING_COOKIE) {
    return res.end('{"erro": "no cookie"}')
  }

  const parsedCookie = parseCookie(BING_COOKIE)
  if (!parsedCookie) {
    return res.end('{"erro": "invalid cookie"}')
  }

  const headers = {
    'x-forwarded-for': RND_IP,
    'Accept-Encoding': 'gzip, deflate, br, zsdch',
    'User-Agent': ua!,
    'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32',
    cookie: `_U=${parsedCookie}` || '',
  }

  const response = await fetch(API_ENDPOINT, { method: 'GET', headers, redirect: 'error', mode: 'cors', credentials: 'include' })
    .then((res) => res.text())
    const maxAge = 86400 * 30
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': [
        `BING_COOKIE=${encodeURIComponent(parsedCookie)}; Max-Age=${maxAge}; Path=/`,
        `UA=${encodeURIComponent(ua!)}; Max-Age=${maxAge}; Path=/`,
      ]
    })

    res.end(response)
}
