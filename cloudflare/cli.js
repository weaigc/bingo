const { spawn } = require('child_process');
const { join } = require('path');

const miniflare = join(require.resolve('miniflare'), '../cli.js')
const script = join(__dirname, './worker.js');

const proc = spawn(`node`, [
  '--experimental-vm-modules',
  miniflare,
  script,
  '-w',
  '-d',
  '-m',
  '-b',
  `BING_COOKIE=${process.env.BING_COOKIE || ''}`,
  '-p',
  process.env.PORT || 8080
])
proc.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
})
proc.stderr.on('data', (chunk) => {
  process.stderr.write(chunk)
})
