const TARGET_HOST = 'copilot.github1s.tk'

const handlers = {
  async fetch(request, env = {}) {
    const uri = new URL(request.url)
    console.log('uri', uri.toString())
    if (uri.protocol === 'http:' && !/^[0-9.:]+$/.test(TARGET_HOST)) {
      uri.protocol = 'https:';
    }
    uri.host = TARGET_HOST
    uri.port = TARGET_HOST.split(':')[1] || ''
    const headersObj = {}
    for (const [key, value] of request.headers.entries()) {
      if (key.startsWith('cf-') || key.startsWith('x-') || ['connection', 'origin', 'referer', 'host', 'authority', 'link'].includes(key)) continue
      headersObj[key] = value
    }
    const headers = new Headers(headersObj)
    headers.set('Host', uri.host)
    // console.log(headers)
    const response = await fetch(uri.toString(), {
      headers,
      method: request.method,
      redirect: request.redirect,
      body: request.body,
    })
    return response
  },
}

export default handlers

addEventListener("fetch", (event) => {
  event.respondWith(handlers.fetch(event.request))
})
