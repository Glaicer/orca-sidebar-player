import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { before, test } from 'node:test'
import activate from '../worker/main.mjs'

const dir = mkdtempSync(join(tmpdir(), 'sidebar-player-worker-'))
const video = join(dir, 'video.mp4')
const calls = join(dir, 'yt-dlp-calls')

// A stand-in for yt-dlp that logs each page URL it resolves and points it at a local file.
// Links with `private` in them only resolve with the browser's cookies.
before(() => {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=25:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', video])
  writeFileSync(calls, '')
  const fake = join(dir, 'yt-dlp')
  writeFileSync(
    fake,
    `#!/usr/bin/env node
const fs = require('node:fs')
const url = process.argv.at(-1)
const cookies = !process.argv.includes('--no-cookies-from-browser')
fs.appendFileSync(${JSON.stringify(calls)}, (cookies ? 'cookies ' : '') + url + '\\n')
if (url.includes('private') && !cookies) {
  console.error('ERROR: Private video. Sign in if you\\'ve been granted access to this video')
  process.exit(1)
}
setTimeout(() => console.log(JSON.stringify({ title: url, url: ${JSON.stringify(pathToFileURL(video).href)}, http_headers: {} })), 200)
`
  )
  chmodSync(fake, 0o755)
  process.env.PATH = `${dir}:${process.env.PATH}`
})

const log = () => readFileSync(calls, 'utf8').trim().split('\n')
const handlers = {}
activate({ panels: { handle: (name, fn) => (handlers[name] = fn) } })

test('prefetched and recently played videos open without running yt-dlp again', async () => {
  const a = 'https://www.youtube.com/watch?v=a'
  const b = 'https://www.youtube.com/watch?v=b'
  await handlers.prefetch({ url: a })
  assert.equal((await handlers.probe({ url: a })).title, a)
  await handlers.probe({ url: b })
  await handlers.probe({ url: a })
  assert.deepEqual(log(), [a, b])
})

test('falls back to browser cookies only when yt-dlp fails without them', async () => {
  const url = 'https://www.youtube.com/watch?v=private'
  assert.equal((await handlers.probe({ url })).title, url)
  assert.deepEqual(log().slice(-2), [url, `cookies ${url}`])
})

test('probe of a local file answers plain JSON, as Orca requires', async () => {
  const info = await handlers.probe({ path: video })
  assert.deepEqual(JSON.parse(JSON.stringify(info)), info)
})
