'use client'

import Default from './browser'

let exportsModel: any = {}

if (process.browser) {
  Object.assign(exportsModel, require('./browser').default)
} else {
  Object.assign(exportsModel, require('./node').default)
}

export default exportsModel! as typeof Default

export const fetch: typeof Default.fetch = exportsModel!.fetch
export const WebSocket: typeof Default.WebSocket = exportsModel!.WebSocket
export const debug: typeof Default.debug = exportsModel!.debug
