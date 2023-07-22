'use client'

import Default from './browser'

const exportsModel = typeof window !== 'undefined' ? require('./browser').default : require('./node').default

export default exportsModel as typeof Default

export const fetch: typeof Default.fetch = exportsModel.fetch
export const WebSocket: typeof Default.WebSocket = exportsModel.WebSocket
export const debug: typeof Default.debug = exportsModel.debug
