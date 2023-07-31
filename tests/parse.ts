import { promises as fs } from 'fs'
import { join } from 'path'
import { parseHeadersFromCurl } from '@/lib/utils'

(async () => {
  const content = await fs.readFile(join(__dirname, './fixtures/curl.txt'), 'utf-8')
  const headers = parseHeadersFromCurl(content)
  console.log(headers)

  const cmdContent = await fs.readFile(join(__dirname, './fixtures/cmd.txt'), 'utf-8')
  const cmdHeaders = parseHeadersFromCurl(cmdContent)
  console.log(cmdHeaders)
})()
