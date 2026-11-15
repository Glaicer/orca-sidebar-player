import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
// why: the panel copies only H.264 without re-encoding, and YouTube serves it up to 1080p.
const FORMAT = 'bv*[vcodec^=avc1][height<=1080]+ba[ext=m4a]/b[height<=1080]/b'
// why: with a JS runtime (yt-dlp's --js-runtimes) it prefers TV clients, and googlevideo answers
// their media URLs with 403 unless a PO token comes along. Other clients' URLs play.
const CLIENTS = 'youtube:player_client=default,-tv,-tv_samsung,-tv_simply,-tv_downgraded'

// why: reading browser cookies (--cookies-from-browser in the user's config) adds ~3 s to every
// call, and most videos don't need them; private, age-restricted or bot-checked ones do.
async function ytDlp(args) {
  try {
    return await runYtDlp(['--no-cookies-from-browser', ...args])
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('yt-dlp is not installed or not on PATH')
  }
  try {
    return await runYtDlp(args)
  } catch (error) {
    throw new Error(error.stderr?.trim() || error.message)
  }
}

async function runYtDlp(args) {
  const { stdout } = await run('yt-dlp', ['-J', '--no-warnings', ...args], { maxBuffer: 64 << 20 })
  return JSON.parse(stdout)
}

// Turns a page URL into direct media URLs, which expire (YouTube puts the time in `expire`).
export async function resolveUrl(url) {
  const data = await ytDlp(['--no-playlist', '--extractor-args', CLIENTS, '-f', FORMAT, url])
  if (data.is_live) throw new Error('Live streams are not supported')
  const formats = data.requested_formats ?? [data]
  const source = { video: formats[0].url, audio: formats[1]?.url, headers: formats[0].http_headers }
  const expire = Number(new URL(formats[0].url).searchParams.get('expire'))
  return { source, title: data.title, expires: expire > 0 ? expire * 1000 : Date.now() + 3600 * 1000 }
}

export async function listPlaylist(url) {
  const data = await ytDlp(['--flat-playlist', '--yes-playlist', url])
  return {
    title: data.title,
    entries: (data.entries ?? []).map((entry) => ({
      id: entry.id,
      url: entry.url ?? `https://www.youtube.com/watch?v=${entry.id}`,
      title: entry.title ?? entry.id,
      duration: entry.duration ?? 0
    }))
  }
}
