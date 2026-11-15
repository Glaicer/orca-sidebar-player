import { execFile, spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

export const VIDEO_EXT = /\.(mp4|m4v|mkv|webm|mov|avi|wmv|flv|ts|m2ts|mts|mpg|mpeg|ogv|3gp)$/i
const CHUNK_BYTES = 700 * 1024
const HIGH_WATER_BYTES = 8 * 1024 * 1024
const H264_PROFILES = { Baseline: '42', 'Constrained Baseline': '42', Main: '4d', High: '64' }
const AAC = 'mp4a.40.2'
const TRANSCODED_H264 = 'avc1.640029'

export function expandHome(path) {
  const trimmed = path.trim()
  if (trimmed === '~') return homedir()
  return resolve(/^~[\\/]/.test(trimmed) ? join(homedir(), trimmed.slice(2)) : trimmed)
}

const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

export async function listDir(path) {
  const entries = await readdir(path, { withFileTypes: true })
  const dirs = []
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    if (entry.isDirectory()) dirs.push(entry.name)
    else if (entry.isFile() && VIDEO_EXT.test(entry.name)) files.push(entry.name)
  }
  return { dirs: dirs.sort(byName), files: files.sort(byName) }
}

// A source is a file path, or { video, audio?, headers? } for URLs (YouTube serves picture and
// sound separately, and its URLs only answer with the HTTP headers yt-dlp names).
function inputsOf(source) {
  if (typeof source === 'string') return { video: source, audio: null, http: [] }
  const headers = Object.entries(source.headers ?? {}).map(([key, value]) => `${key}: ${value}\r\n`)
  return { video: source.video, audio: source.audio ?? null, http: headers.length ? ['-headers', headers.join('')] : [] }
}

export async function probe(source) {
  const { video, audio, http } = inputsOf(source)
  if (!audio) return probeInput(video, http)
  const [picture, sound] = await Promise.all([probeInput(video, http), probeInput(audio, http)])
  return { ...picture, audio: sound.audio }
}

async function probeInput(path, http) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    ...http,
    '-show_entries',
    'format=duration:stream=index,codec_type,codec_name,profile,level,pix_fmt,width,height,channels:stream_tags=language,title:stream_disposition=default,attached_pic',
    '-of', 'json',
    path
  ])
  const data = JSON.parse(stdout)
  const streams = data.streams ?? []
  const v = streams.find((s) => s.codec_type === 'video' && !s.disposition?.attached_pic)
  const audio = streams
    .filter((s) => s.codec_type === 'audio')
    .map((s, index) => ({
      index,
      default: s.disposition?.default === 1,
      label: [s.tags?.title, s.tags?.language, `${s.codec_name} ${s.channels ?? '?'}ch`]
        .filter(Boolean)
        .join(' · ')
    }))
  return {
    duration: Number(data.format?.duration) || 0,
    video: v
      ? { codec: v.codec_name, profile: v.profile, level: v.level, pixFmt: v.pix_fmt, width: v.width, height: v.height }
      : null,
    audio
  }
}

export function h264Codec(video) {
  if (!video || video.codec !== 'h264' || video.pixFmt !== 'yuv420p') return null
  const profile = H264_PROFILES[video.profile]
  if (!profile || !(video.level > 0)) return null
  const constraint = video.profile === 'Constrained Baseline' ? 'e0' : '00'
  return `avc1.${profile}${constraint}${video.level.toString(16).padStart(2, '0')}`
}

async function keyframeAtOrBefore(path, http, seconds) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    ...http,
    '-read_intervals', `${seconds}%+#1`,
    '-select_streams', 'v:0',
    '-show_entries', 'packet=pts_time',
    '-of', 'csv=p=0',
    path
  ])
  const keyframe = Number.parseFloat(stdout)
  return Number.isFinite(keyframe) && keyframe <= seconds ? keyframe : seconds
}

// Remuxes H.264 as is and transcodes everything else, so any container or codec ffmpeg reads
// becomes fragmented MP4 that MediaSource in the panel can play. The stream starts at 0;
// `offset` is the source time it starts at.
export async function planStream(source, info, { audio, start }) {
  const inputs = inputsOf(source)
  const copyCodec = h264Codec(info.video)
  const args = ['-v', 'error', '-nostdin']
  let offset = 0
  let seekVideo = []
  let seekAudio = []
  if (start > 0 && copyCodec) {
    // why: copied video can only start at a keyframe. For files with B-frames ffmpeg seeks
    // 0.13 s before -ss, so -ss on the keyframe lands on the previous one, and accurate seeking
    // then trims audio but not the copied video (sound came out a whole GOP late). Seeking just
    // past the keyframe without trimming starts both streams together at that keyframe.
    // Separate sound takes the same -ss: ffmpeg aligns inputs by it, not by where each one lands.
    offset = await keyframeAtOrBefore(inputs.video, inputs.http, start)
    if (offset > 0) {
      seekAudio = ['-ss', String(offset + 0.2)]
      seekVideo = [...seekAudio, '-noaccurate_seek']
    }
  } else if (start > 0) {
    offset = start
    seekVideo = seekAudio = ['-ss', String(start)]
  }
  args.push(...seekVideo, ...inputs.http, '-i', inputs.video)
  if (inputs.audio) args.push(...seekAudio, ...inputs.http, '-i', inputs.audio)
  args.push('-map_chapters', '-1', '-map_metadata', '-1')
  const codecs = []
  if (info.video) {
    args.push('-map', '0:v:0')
    if (copyCodec) {
      args.push('-c:v', 'copy')
      codecs.push(copyCodec)
    } else {
      args.push(
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-profile:v', 'high', '-level:v', '4.1', '-pix_fmt', 'yuv420p',
        '-vf', "scale='min(1280,iw)':-2", '-g', '48'
      )
      codecs.push(TRANSCODED_H264)
    }
  }
  if (info.audio.length > 0) {
    const track = info.audio.some((a) => a.index === audio) ? audio : 0
    args.push('-map', inputs.audio ? '1:a:0' : `0:a:${track}`, '-c:a', 'aac', '-ac', '2', '-b:a', '192k')
    codecs.push(AAC)
  }
  args.push('-f', 'mp4', '-movflags', 'empty_moov+default_base_moof', '-frag_duration', '500000', 'pipe:1')
  return { args, offset, mime: `video/mp4; codecs="${codecs.join(', ')}"` }
}

export function startStream(args) {
  const child = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
  const queue = []
  let queued = 0
  let ended = false
  let failure = null
  let stderr = ''
  let wake = null
  const notify = () => {
    wake?.()
    wake = null
  }

  child.stdout.on('data', (chunk) => {
    queue.push(chunk)
    queued += chunk.length
    if (queued > HIGH_WATER_BYTES) child.stdout.pause()
    notify()
  })
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk).slice(-2000)
  })
  child.on('error', (error) => {
    failure = error.code === 'ENOENT' ? new Error('ffmpeg is not installed or not on PATH') : error
    notify()
  })
  child.on('close', (code, signal) => {
    ended = true
    if (code !== 0 && !signal && !failure) failure = new Error(stderr.trim() || `ffmpeg exited with ${code}`)
    notify()
  })

  return {
    async read() {
      while (queue.length === 0 && !ended && !failure) await new Promise((r) => (wake = r))
      if (queue.length === 0) {
        if (failure) throw failure
        return null
      }
      const parts = []
      let size = 0
      while (queue.length > 0 && size < CHUNK_BYTES) {
        const head = queue[0]
        const take = Math.min(head.length, CHUNK_BYTES - size)
        parts.push(head.subarray(0, take))
        size += take
        if (take === head.length) queue.shift()
        else queue[0] = head.subarray(take)
      }
      queued -= size
      if (queued <= HIGH_WATER_BYTES / 2) child.stdout.resume()
      return Buffer.concat(parts, size)
    },
    close() {
      if (!ended) child.kill('SIGKILL')
      ended = true
      notify()
    }
  }
}
