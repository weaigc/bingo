const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const { PORT = 3000 } = process.env
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port: PORT })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(handleRequest)
    .once('error', (err) => {
      console.error('error', err)
      process.exit(1)
    })
    .listen(PORT, () => {
      console.log(`> Ready on http://${hostname}:${PORT}`)
    })

  async function handleRequest(req, res) {
    try {
      const { method } = req
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (pathname === '/api/counts') {
        server.getConnections(function (error, count) {
          res.end(String(count))
        })
      } else if (pathname.endsWith('/completions')) {
        await app.render(req, res, '/api/openai/chat/completions', query)
      } else if (pathname.endsWith('/models')) {
        res.end(JSON.stringify({
          data: [
            {
              id: 'gpt-4',
            }
          ],
        }))
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }
})
