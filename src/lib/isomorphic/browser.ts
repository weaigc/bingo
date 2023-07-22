'use client'

const debug = console.debug.bind(console)

class WebSocketAlias extends WebSocket {
  constructor(address: string | URL, ...args: any) {
    super(address)
  }
}

export default { fetch, WebSocket: WebSocketAlias, debug }
