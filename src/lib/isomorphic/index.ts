'use client'

import Debug from 'debug'
export * from 'ifw'

export const debug = typeof document === 'undefined' ? Debug('bingo')
  : process.env.NEXT_PUBLIC_DEBUG ? console.info.bind(console)
  : () => {}
