import Debug from 'debug'

const safeRequire = (path: string) => {
  try {
    return eval(`require("${path}")`) || {}
  } catch (e) {}
  return {}
}

const { fetch, setGlobalDispatcher, ProxyAgent } = safeRequire('undici')
const { HttpsProxyAgent } = safeRequire('https-proxy-agent')
const ws = safeRequire('ws')

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
