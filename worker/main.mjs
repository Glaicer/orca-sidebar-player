import { basename, delimiter } from 'node:path'
import { expandHome, listDir, planStream, probe, startStream } from './media.mjs'
import { listPlaylist, resolveUrl } from './youtube.mjs'

// why: Orca started from the Dock doesn't get the shell's PATH, so Homebrew's ffmpeg and yt-dlp
// would be missing.
if (process.platform === 'darwin') process.env.PATH = [process.env.PATH, '/opt/homebrew/bin', '/usr/local/bin'].join(delimiter)

const streams = new Map()
let nextId = 1
// why: resolving a YouTube link takes seconds, so the panel prefetches playlist neighbours and
// switching back to a recent video reuses what was resolved.
const resolved = new Map()
const RESOLVED_KEEP = 8

async function resolve({ path, url }) {
  const { source, title = null, expires } = url ? await resolveUrl(url) : { source: path, expires: Infinity }
  const info = await probe(source)
  return { source, expires, info: { ...info, title } }
}

// The panel opens either a file `path` or a page `url`; seeks reuse what was resolved for it.
function sourceOf(input) {
  const key = input.path ?? input.url
  const hit = resolved.get(key)
  resolved.delete(key)
  // why: direct URLs expire after hours; a seek after a long pause needs fresh ones.
  if (hit && Date.now() < hit.expires - 60 * 1000) {
    resolved.set(key, hit)
    return hit.loaded
  }
  const entry = { expires: Infinity }
  entry.loaded = resolve(input).then(
    (loaded) => {
      entry.expires = loaded.expires
      return loaded
    },
    (error) => {
      if (resolved.get(key) === entry) resolved.delete(key)
      throw error
    }
  )
  resolved.set(key, entry)
  if (resolved.size > RESOLVED_KEEP) resolved.delete(resolved.keys().next().value)
  return entry.loaded
}

function closeStream(id) {
  streams.get(id)?.stream.close()
  streams.delete(id)
}

export default function activate(orca) {
  orca.panels.handle('roots', async () => {
    const raw = (await orca.settings.get('roots')) ?? '~'
    return String(raw)
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const path = expandHome(line)
        return { path, name: line.trim().startsWith('~') ? line.trim() : basename(path) || path }
      })
  })

  orca.panels.handle('list', ({ path }) => listDir(path))

  orca.panels.handle('playlist', ({ url }) => listPlaylist(url))

  orca.panels.handle('prefetch', (input) => {
    sourceOf(input).catch(() => {})
    return { ok: true }
  })

  orca.panels.handle('probe', async (input) => (await sourceOf(input)).info)

  orca.panels.handle('open', async ({ path, url, audio, start }, { panel }) => {
    for (const [id, entry] of streams) if (entry.panel === panel) closeStream(id)
    const { source, info } = await sourceOf({ path, url })
    const plan = await planStream(source, info, { audio, start })
    const id = nextId++
    streams.set(id, { panel, stream: startStream(plan.args) })
    return { id, mime: plan.mime, offset: plan.offset }
  })

  orca.panels.handle('read', async ({ id }) => {
    const entry = streams.get(id)
    const chunk = entry ? await entry.stream.read() : null
    if (!chunk) {
      streams.delete(id)
      return { eof: true }
    }
    return { data: chunk.toString('base64') }
  })

  orca.panels.handle('close', ({ id }) => {
    closeStream(id)
    return { ok: true }
  })
}

export function deactivate() {
  for (const id of streams.keys()) closeStream(id)
}
