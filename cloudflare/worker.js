const SITE_HOST = '这城改为你的域名' // 为空则自动推断
const TARGET_HOST='hf4all-bingo.hf.space' // 后台服务，默认不需要修改

export default {
  async handleOptions(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Max-Age': '86400',
    }

    if (
      request.headers.get('Origin') !== null &&
      request.headers.get('Access-Control-Request-Method') !== null &&
      request.headers.get('Access-Control-Request-Headers') !== null
    ) {
      return new Response(null, {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Headers': request.headers.get(
            'Access-Control-Request-Headers'
          ),
        },
      })
    } else {
      return new Response(null, {
        headers: {
          Allow: 'GET, HEAD, POST, OPTIONS',
        },
      })
    }
  },

  async handleWebSocket(headers) {
    headers.set('Host', 'sydney.bing.com')
    return fetch('https://sydney.bing.com/sydney/ChatHub', {
      headers
    })
  },

  async fetch(request) {
    const uri = new URL(request.url)
    console.log('uri', uri.toString())
    if (request.method === 'OPTIONS') {
      return this.handleOptions(request)
    }
    const headersObj = {}
    for (const [key, value] of request.headers.entries()) {
      if (key.startsWith('cf-') || key.startsWith('x-') || ['connection', 'origin', 'referer', 'host', 'authority'].includes(key)) continue
      headersObj[key] = value
    }
    headersObj['x-forwarded-for'] = request.headers.get('x-forwarded-for')?.split(',')?.[0]
    if (!headersObj['x-forwarded-for']) {
      delete headersObj['x-forwarded-for']
    }
    headersObj['x-ms-useragent'] = request.headers.get('x-ms-useragent') || 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.3 OS/Win32'
    headersObj['referer'] = 'https://www.bing.com/search?q=Bing+AI'
    const headers = new Headers(headersObj)
    console.log('headers', headersObj)

    const upgradeHeader = headers.get('Upgrade')
    if (upgradeHeader === 'websocket') {
      return this.handleWebSocket(headers)
    }
    if (uri.pathname.startsWith('/turing/')) {
      uri.host = 'www.bing.com'
    } else {
      if (uri.protocol === 'http:' && !/^[0-9.:]+$/.test(TARGET_HOST)) {
        uri.protocol = 'https:';
      }
      headers.set('x-endpoint', SITE_HOST || uri.host)
      headers.set('x-ws-endpoint', SITE_HOST || uri.host)
      uri.host = TARGET_HOST
    }
    headers.set('Host', uri.host)
    return fetch(uri.toString(), {
      headers,
      method: request.method,
      redirect: request.redirect,
      body: request.body,
    })
  },
}
