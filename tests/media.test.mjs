import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { expandHome, listDir, planStream, probe, startStream } from '../worker/media.mjs'

const dir = mkdtempSync(join(tmpdir(), 'sidebar-player-'))
const h264 = join(dir, 'h264-ac3.mkv')
const hevc = join(dir, 'hevc10.mkv')
const flashBeepH264 = join(dir, 'flash-beep-h264.mkv')
const flashBeepHevc = join(dir, 'flash-beep-hevc.mkv')
// What YouTube serves: picture and sound as separate files, which yt-dlp hands over as two URLs.
const splitVideo = join(dir, 'split-video.mp4')
const splitAudio = join(dir, 'split-audio.m4a')

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args])
const lavfiVideo = ['-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=25:duration=6']
const tone = (hz) => ['-f', 'lavfi', '-i', `sine=frequency=${hz}:duration=6`]

before(() => {
  ffmpeg(
    ...lavfiVideo, ...tone(440), ...tone(880),
    '-map', '0', '-map', '1', '-map', '2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '25',
    '-c:a:0', 'ac3', '-c:a:1', 'eac3',
    '-metadata:s:a:0', 'language=rus', '-metadata:s:a:0', 'title=Dub',
    '-metadata:s:a:1', 'language=eng', '-metadata:s:a:1', 'title=Original',
    '-disposition:a:0', 'default', '-disposition:a:1', '0',
    h264
  )
  // A white frame and a beep together at every whole second; keyframes every 4.17 s, B-frames.
  const flashBeep = [
    '-f', 'lavfi', '-i', "color=c=black:s=320x180:r=24:d=30,drawbox=c=white:t=fill:enable='lt(mod(t,1),0.04)'",
    '-f', 'lavfi', '-i', "aevalsrc='sin(2*PI*1000*t)*lt(mod(t,1),0.05)':s=48000:d=30",
    '-g', '100', '-bf', '3', '-c:a', 'ac3', '-ac', '6'
  ]
  ffmpeg(...flashBeep, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', flashBeepH264)
  ffmpeg(...flashBeep, '-c:v', 'libx265', '-x265-params', 'log-level=error', flashBeepHevc)
  ffmpeg('-i', flashBeepH264, '-map', '0:v', '-c', 'copy', splitVideo)
  ffmpeg('-i', flashBeepH264, '-map', '0:a', '-c:a', 'aac', '-ac', '2', splitAudio)
  ffmpeg(...lavfiVideo, ...tone(440), '-c:v', 'libx265', '-x265-params', 'log-level=error', '-pix_fmt', 'yuv420p10le', '-c:a', 'ac3', hevc)
})

// Like googlevideo: serves byte ranges, but only to clients that send the headers yt-dlp asked for.
const server = createServer((req, res) => {
  if (req.headers['x-client'] !== 'tv') return res.writeHead(403).end()
  const bytes = readFileSync(join(dir, req.url.slice(1)))
  const [, from, to] = /bytes=(\d+)-(\d*)/.exec(req.headers.range ?? '') ?? [, '0', '']
  const end = to ? Number(to) : bytes.length - 1
  res.writeHead(req.headers.range ? 206 : 200, {
    'accept-ranges': 'bytes',
    'content-length': end - Number(from) + 1,
    'content-range': `bytes ${from}-${end}/${bytes.length}`
  })
  res.end(bytes.subarray(Number(from), end + 1))
})
before(() => new Promise((r) => server.listen(0, '127.0.0.1', r)))
after(() => server.close())
const served = (file) => `http://127.0.0.1:${server.address().port}/${file.slice(dir.length + 1)}`

async function drain(stream) {
  const parts = []
  for (let chunk; (chunk = await stream.read()); ) parts.push(chunk)
  return Buffer.concat(parts)
}

function describeOutput(bytes) {
  const file = join(dir, `out-${Math.random()}.mp4`)
  writeFileSync(file, bytes)
  return JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,codec_type,width', '-of', 'json', file])
  ).streams
}

test('lists folders and video files only, hiding dotfiles, in natural order', async () => {
  const root = join(dir, 'tree')
  mkdirSync(join(root, 'Season 2'), { recursive: true })
  mkdirSync(join(root, 'Season 10'))
  mkdirSync(join(root, '.cache'))
  for (const name of ['E10.mkv', 'E2.mp4', 'notes.txt', '.E1.mkv']) writeFileSync(join(root, name), '')
  assert.deepEqual(await listDir(root), { dirs: ['Season 2', 'Season 10'], files: ['E2.mp4', 'E10.mkv'] })
})

test('expands ~ in folder settings with either slash', () => {
  assert.equal(expandHome(' ~ '), homedir())
  assert.equal(expandHome('~/Videos'), join(homedir(), 'Videos'))
  assert.equal(expandHome('~\\Videos'), join(homedir(), 'Videos'))
})

test('probe names every audio track and marks the default one', async () => {
  const info = await probe(h264)
  assert.ok(Math.abs(info.duration - 6) < 0.2)
  assert.equal(info.video.codec, 'h264')
  assert.deepEqual(
    info.audio.map((a) => [a.index, a.default, a.label]),
    [
      [0, true, 'Dub · rus · ac3 1ch'],
      [1, false, 'Original · eng · eac3 1ch']
    ]
  )
})

test('H.264 with AC3 is remuxed, the chosen track as AAC', async () => {
  const info = await probe(h264)
  const plan = await planStream(h264, info, { audio: 1, start: 3.5 })
  assert.match(plan.mime, /^video\/mp4; codecs="avc1\.64[0-9a-f]{4}, mp4a\.40\.2"$/)
  assert.ok(plan.args.includes('0:a:1'))
  const out = describeOutput(await drain(startStream(plan.args)))
  assert.deepEqual(
    out.map((s) => s.codec_name),
    ['h264', 'aac']
  )
})

test('10-bit HEVC is transcoded to H.264', async () => {
  const info = await probe(hevc)
  const plan = await planStream(hevc, info, { audio: 0, start: 2.2 })
  assert.equal(plan.mime, 'video/mp4; codecs="avc1.640029, mp4a.40.2"')
  const out = describeOutput(await drain(startStream(plan.args)))
  assert.deepEqual(
    out.map((s) => s.codec_name),
    ['h264', 'aac']
  )
})

// Where the panel shows each flash and hears each beep: the stream's timestamps plus plan.offset.
function flashesAndBeeps(bytes, offset) {
  const file = join(dir, `sync-${Math.random()}.mp4`)
  writeFileSync(file, bytes)
  const frames = execFileSync('ffprobe', [
    '-v', 'error', '-f', 'lavfi', `movie=${file},signalstats`,
    '-show_entries', 'frame=pts_time:frame_tags=lavfi.signalstats.YAVG', '-of', 'csv=p=0'
  ]).toString().trim().split('\n').map((line) => line.split(',').map(Number)).sort((a, b) => a[0] - b[0])
  const flashes = frames.filter(([, y], i) => y > 128 && !(frames[i - 1]?.[1] > 128)).map(([t]) => t + offset)
  const rate = 8000
  const pcm = execFileSync('ffmpeg', [
    '-v', 'error', '-i', file, '-map', '0:a:0', '-ac', '1',
    '-af', 'aresample=async=1:first_pts=0', '-ar', String(rate), '-f', 's16le', '-'
  ])
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1)
  const beeps = []
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) > 3000 && (beeps.length === 0 || i / rate + offset - beeps.at(-1) > 0.5)) beeps.push(i / rate + offset)
  }
  return { flashes, beeps }
}

const sources = [
  ['copied H.264', () => flashBeepH264],
  ['transcoded HEVC', () => flashBeepHevc],
  ['H.264 with sound in a separate file', () => ({ video: splitVideo, audio: splitAudio })],
  [
    'H.264 and sound from URLs that need headers',
    () => ({ video: served(splitVideo), audio: served(splitAudio), headers: { 'X-Client': 'tv' } })
  ]
]
for (const [name, source] of sources) {
  for (const start of [0, 12.5, 14]) {
    test(`${name} from ${start} s: picture and sound stay together on the source timeline`, async () => {
      const plan = await planStream(source(), await probe(source()), { audio: 0, start })
      const { flashes, beeps } = flashesAndBeeps(await drain(startStream(plan.args)), plan.offset)
      const second = Math.ceil(start) + 1
      const flash = flashes.find((t) => t > second - 0.5)
      const beep = beeps.find((t) => t > second - 0.5)
      // why: B-frame delay and AAC priming leave up to ~80 ms; a GOP-sized slip is what this catches.
      assert.ok(Math.abs(flash - beep) < 0.1, `flash at ${flash} s, beep at ${beep} s`)
      assert.ok(Math.abs(beep - second) < 0.1, `the beep at ${second} s plays at ${beep} s`)
    })
  }
}

test('chunks stay small enough for a 1 MiB plugin.request answer', async () => {
  const info = await probe(h264)
  const stream = startStream((await planStream(h264, info, { audio: 0, start: 0 })).args)
  for (let chunk; (chunk = await stream.read()); ) {
    assert.ok(JSON.stringify({ data: chunk.toString('base64') }).length < 1024 * 1024)
  }
})

test('a missing file fails the read with ffmpeg\'s message', async () => {
  const stream = startStream(['-v', 'error', '-i', join(dir, 'nope.mkv'), '-f', 'mp4', 'pipe:1'])
  await assert.rejects(stream.read(), /No such file/)
})
