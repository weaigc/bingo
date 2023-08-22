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
  async handleWebSocket(request) {
    const response = await fetch('https://sydney.bing.com/sydney/ChatHub', {
      headers: request.headers,
    })

    return new Response(null, {
      status: response.status,
      webSocket: response.webSocket
    })
  },
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return this.handleOptions(request)
    }
    const uri = new URL(request.url)
    const upgradeHeader = request.headers.get('Upgrade')
    if (upgradeHeader === 'websocket') {
      return this.handleWebSocket(request)
    }
    uri.hostname = 'www.bing.com'
    return fetch(new Request(uri.toString(), request))
  },
}
