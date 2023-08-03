import Debug from 'debug'

const { fetch, setGlobalDispatcher, ProxyAgent } = require('undici')
const { HttpsProxyAgent } = require('https-proxy-agent')
const ws = require('ws')

const debug = Debug('bingo')

const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy || process.env.HTTPS_PROXY;
let WebSocket = ws.WebSocket

if (httpProxy) {
  setGlobalDispatcher(new ProxyAgent(httpProxy))
  const agent = new HttpsProxyAgent(httpProxy)
  // @ts-ignore
  WebSocket = class extends ws.WebSocket {
    constructor(address: string | URL, options: typeof ws.WebSocket) {
      super(address, {
        ...options,
        agent,
      })
    }
  }
}

export default { fetch, WebSocket, debug }
