import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function random (start: number, end: number) {
  return start + Math.ceil(Math.random() * (end - start))
}

export function randomIP() {
  return `11.${random(104, 107)}.${random(1, 255)}.${random(1, 255)}`
}

export const defaultUID = Math.random().toString(36).slice(2)

export function parseHeadersFromCurl(content: string) {
  const re = /-H '([^:]+):\s*([^']+)/mg
  const headers: HeadersInit = {}
  content = content.replaceAll('-H "', '-H \'').replaceAll('" ^', '\'\\').replaceAll('^\\^"', '"') // 将 cmd curl 转成 bash curl
  content.replace(re, (_: string, key: string, value: string) => {
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
  } catch(e) {
    return ''
  }
}

export function extraHeadersFromCookie(cookies: Partial<{ [key: string]: string }>) {
  return parseHeadersFromCurl(extraCurlFromCookie(cookies))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function parseCookie(cookie: string, cookieName: string) {
  const targetCookie = new RegExp(`(?:[; ]|^)${cookieName}=([^;]*)`).test(cookie) ? RegExp.$1 : cookie
  return targetCookie ? decodeURIComponent(targetCookie).trim() : cookie.indexOf('=') === -1 ? cookie.trim() : ''
}

export function setCookie(key: string, value: string) {
  const maxAge = 86400 * 30
  document.cookie = `${key}=${value || ''}; Path=/; Max-Age=${maxAge}; SameSite=None; Secure`
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

export const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.0.0'
export const DEFAULT_IP = process.env.BING_IP || randomIP()

export function parseUA(ua?: string, default_ua = DEFAULT_UA) {
  return / EDGE?/i.test(decodeURIComponent(ua || '')) ? decodeURIComponent(ua!.trim()) : default_ua
}

export function createHeaders(cookies: Partial<{ [key: string]: string }>, defaultHeaders?: Partial<{ [key: string]: string }>, type?: string) {
  let {
    BING_COOKIE = process.env.BING_COOKIE,
    BING_UA = process.env.BING_UA,
    BING_IP = process.env.BING_IP,
    BING_HEADER = process.env.BING_HEADER,
    IMAGE_ONLY = process.env.IMAGE_ONLY ?? '1',
  } = cookies

  if (BING_HEADER) {
    const headers = extraHeadersFromCookie({
      BING_HEADER,
      ...cookies,
    }) || {}
    if (/^(1|true|yes)$/.test(String(IMAGE_ONLY)) && type !== 'image') {
      // 仅画图时设置 cookie
      headers.cookie = `_U=${defaultUID}`
    }
    if (headers['user-agent']) {
      return headers
    }
  }

  const ua = parseUA(BING_UA)

  if (!BING_COOKIE) {
    BING_COOKIE = defaultHeaders?.IMAGE_BING_COOKIE || defaultUID // hf 暂时不用 Cookie 也可以正常使用
  }

  const parsedCookie = parseCookie(BING_COOKIE, '_U')
  if (!parsedCookie) {
    throw new Error('Invalid Cookie')
  }
  return {
    'x-forwarded-for': BING_IP || DEFAULT_IP,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'User-Agent': ua!,
    'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32',
    cookie: `_U=${parsedCookie}` || '',
  }
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
