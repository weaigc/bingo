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

export const RND_IP = randomIP()

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function parseCookie(cookie: string) {
  const targetCookie = /\s*_U=([^;]+)/.test(cookie) ? RegExp.$1 : cookie
  return targetCookie ? decodeURIComponent(targetCookie) : targetCookie
}
