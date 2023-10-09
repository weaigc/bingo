import { clsx, type ClassValue } from 'clsx'
import md5 from 'md5'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import { lookup } from 'dns'
// @ts-ignore
import imei from 'node-imei'
// @ts-ignore
import randomip from 'random-ip'
import cidr from './cidr.json'
import { debug } from './isomorphic'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number) {
  const time = dayjs(date)
  if (time > dayjs().startOf('day')) {
    return dayjs(time).format('H:mm')
  } else if (time > dayjs().subtract(1, 'day').startOf('day')) {
    return '昨天'
  } else if (time > dayjs().startOf('year')) {
    return dayjs(time).format('M-DD')
  } else {
    return dayjs(time).format('YYYY-MM-DD')
  }
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export function createChunkDecoder() {
  const decoder = new TextDecoder()
  return function (chunk: Uint8Array | undefined): string {
    if (!chunk) return ''
    return decoder.decode(chunk, { stream: true })
  }
}

export function muid() {
  return md5(new imei().random()).toUpperCase()
}

export function random(start: number, end: number) {
  return start + Math.floor(Math.random() * (end - start))
}

export function randomString(length: number = 32) {
  const char = 'ABCDEFGHJKMNPQRSTWXYZ1234567890';
  return Array.from({ length }, () => char.charAt(random(0, char.length))).join('')
}

export function randomIP() {
  // return `104.${random(0, 21)}.${random(0, 127)}.${random(1, 255)}`
  const [ip, range] = cidr.at(random(1, cidr.length))?.split('/')!
  return randomip(ip, range)
}

export const lookupPromise = async function (domain: string) {
  return new Promise((resolve, reject) => {
    lookup(domain, (err, address, family) => {
      if (err) resolve('')
      resolve(address)
    })
  })
}

export const defaultUID = 'xxx'

export function parseHeadersFromCurl(content: string) {
  const re = /-H '([^:]+):\s*([^']+)/mg
  const headers: HeadersInit = {}
  content = content.replaceAll('-H "', '-H \'').replaceAll('" ^', '\'\\').replaceAll('^\\^"', '"') // 将 cmd curl 转成 bash curl
  content.split('curl ')[1]?.replace(re, (_: string, key: string, value: string) => {
    headers[key] = value
    return ''
  })
  return headers
}

export const ChunkKeys = ['BING_HEADER', 'BING_HEADER1', 'BING_HEADER2']

export function encodeHeadersToCookie(content: string) {
  const base64Content = btoa(content)
  const contentChunks = base64Content.match(/.{1,4000}/g) || []
  return ChunkKeys.map((key, index) => `${key}=${contentChunks[index] ?? ''}`)
}

export function extraCurlFromCookie(cookies: Partial<{ [key: string]: string }>) {
  let base64Content = ''
  ChunkKeys.forEach((key) => {
    base64Content += (cookies[key] || '')
  })
  try {
    return atob(base64Content)
  } catch (e) {
    return ''
  }
}

export function extraHeadersFromCookie(cookies: Partial<{ [key: string]: string }>) {
  return parseHeadersFromCurl(extraCurlFromCookie(cookies))
}

export function parseCookie(cookie: string, cookieName: string) {
  if (!cookie || !cookieName) return ''
  const targetCookie = new RegExp(`(?:[; ]|^)${cookieName}=([^;]*)`).test(cookie) ? RegExp.$1 : cookie
  return targetCookie ? decodeURIComponent(targetCookie).trim() : cookie.indexOf('=') === -1 ? cookie.trim() : ''
}

export function setCookie(key: string, value?: string) {
  const cookie = value === undefined ? key : `${key}=${value || ''}`
  const maxAge = value === '' ? 0 : 86400 * 30
  const cookieSuffix = location.protocol === 'http:' ? '' : 'SameSite=None; Secure'
  document.cookie = `${cookie}; Path=/; Max-Age=${maxAge}; ${cookieSuffix}`
}

export function getCookie(cookieName: string) {
  const re = new RegExp(`(?:[; ]|^)${cookieName}=([^;]*)`)
  return re.test(document.cookie) ? RegExp.$1 : ''
}

export function parseCookies(cookie: string, cookieNames: string[]) {
  const cookies: { [key: string]: string } = {}
  cookieNames.forEach(cookieName => {
    cookies[cookieName] = parseCookie(cookie, cookieName)
  })
  return cookies
}

export function resetCookies() {
  [...ChunkKeys, 'BING_COOKIE', 'BING_UA', '_U', 'BING_IP', 'MUID'].forEach(key => setCookie(key, ''))
}

export const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.0.0'
export const DEFAULT_UA_MOBILE = `Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/605.1.15 BingSapphire/1.0.410427012`

export function parseUA(ua?: string, default_ua = DEFAULT_UA) {
  return / EDGE?/i.test(decodeURIComponent(ua || '')) ? decodeURIComponent(ua!.trim()) : default_ua
}

export function mockUser(cookies: Partial<{ [key: string]: string }>) {
  const {
    BING_HEADER = process.env.BING_HEADER || '',
    BING_UA = process.env.BING_UA,
    BING_IP = process.env.BING_IP || '',
  } = cookies
  const ua = parseUA(BING_UA)

  const { _U, MUID } = parseCookies(extraHeadersFromCookie({
    BING_HEADER,
    ...cookies,
  }).cookie, ['MUID'])

  return {
    'x-forwarded-for': BING_IP || randomIP(),
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'User-Agent': ua!,
    'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.3 OS/Win32',
    'referer': 'https://www.bing.com/search?showconv=1&sendquery=1&q=Bing%20AI&form=MY02CJ&OCID=MY02CJ&OCID=MY02CJ&pl=launch',
    cookie: `_U=${_U || defaultUID}; MUID=${MUID || randomString(32)}`,
  }
}

export function createHeaders(cookies: Partial<{ [key: string]: string }>, useMock?: boolean) {
  let {
    BING_HEADER = process.env.BING_HEADER,
    BING_IP = process.env.BING_IP || '',
    IMAGE_ONLY = process.env.IMAGE_ONLY ?? '1',
  } = cookies || {}
  useMock = useMock ?? /^(1|true|yes)$/i.test(String(IMAGE_ONLY))
  if (!BING_HEADER || useMock) {
    return mockUser(cookies)
  }
  const headers = extraHeadersFromCookie({
    BING_HEADER,
    ...cookies,
  })
  headers['x-forwarded-for'] = BING_IP || randomIP()
  headers['user-agent'] = parseUA(headers['user-agent'])
  headers['referer'] = 'https://www.bing.com/search?showconv=1&sendquery=1&q=Bing%20AI&form=MY02CJ&OCID=MY02CJ&OCID=MY02CJ&pl=launch'
  headers['x-ms-useragent'] = headers['x-ms-useragent'] || 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.3 OS/Win32'
  return headers
}

export class WatchDog {
  private tid = 0
  watch(fn: Function, timeout = 2000) {
    clearTimeout(this.tid)
    this.tid = setTimeout(fn, timeout + Math.random() * 1000)
  }
  reset() {
    clearTimeout(this.tid)
  }
}
