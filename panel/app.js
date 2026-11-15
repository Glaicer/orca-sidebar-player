const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M8.09 14.647c-1.787-1.154-1.787-4.14 0-5.294l10.79-6.968c1.736-1.121 3.87.339 3.87 2.648v13.934c0 2.31-2.134 3.769-3.87 2.648zM2 5a.75.75 0 0 1 1.5 0v14A.75.75 0 0 1 2 19z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M16.66 14.647c1.787-1.154 1.787-4.14 0-5.294L5.87 2.385C4.135 1.264 2 2.724 2 5.033v13.934c0 2.31 2.134 3.769 3.87 2.648zM22.75 5a.75.75 0 0 0-1.5 0v14a.75.75 0 0 0 1.5 0z"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24"><path d="M2.003 11.716c.037-1.843.056-2.764.668-3.552a3 3 0 0 1 .413-.431c.752-.636 1.746-.636 3.733-.636c.71 0 1.065 0 1.403-.092q.105-.03.209-.067c.33-.121.627-.33 1.22-.746c2.338-1.645 3.508-2.467 4.489-2.11c.188.069.37.168.533.29c.848.635.913 2.115 1.042 5.073c.048 1.096.08 2.034.08 2.555s-.032 1.46-.08 2.555c-.13 2.958-.194 4.438-1.042 5.073a2.1 2.1 0 0 1-.533.29c-.982.357-2.15-.465-4.49-2.11c-.592-.416-.889-.625-1.22-.746a3 3 0 0 0-.208-.067c-.338-.092-.693-.092-1.403-.092c-1.987 0-2.98 0-3.733-.636a3 3 0 0 1-.413-.43c-.612-.79-.63-1.71-.668-3.552a14 14 0 0 1 0-.57"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19.49 5.552a.66.66 0 0 1 .97.094l-.529.471l.53-.47l.002.002l.003.004l.007.009l.079.112q.072.107.186.305c.149.264.339.652.526 1.171C21.64 8.291 22 9.851 22 12s-.36 3.71-.736 4.75c-.187.52-.377.907-.526 1.172a5 5 0 0 1-.265.417l-.007.009l-.003.003l-.001.002s-.001.001-.531-.47l.53.471a.66.66 0 0 1-.971.094a.77.77 0 0 1-.09-1.035l.03-.041q.04-.06.125-.207a6 6 0 0 0 .422-.943c.314-.871.644-2.253.644-4.222s-.33-3.35-.644-4.222a6 6 0 0 0-.422-.942a3 3 0 0 0-.157-.253m-1.641 1.833c.333-.197.753-.07.938.286l-.603.357l.603-.357l.001.002l.002.003l.003.007l.01.018l.024.053q.028.063.07.17c.053.145.12.35.185.62c.13.54.252 1.337.252 2.425c0 1.089-.122 1.886-.252 2.426c-.065.27-.132.475-.186.619a3 3 0 0 1-.094.223l-.009.018l-.003.007l-.002.003v.002s-.001.001-.604-.356l.603.357c-.185.355-.605.483-.938.286c-.33-.196-.45-.638-.272-.991l.004-.01l.035-.085c.032-.086.08-.23.13-.438c.1-.416.208-1.09.208-2.06c0-.971-.108-1.645-.208-2.06a4 4 0 0 0-.165-.524l-.004-.01a.76.76 0 0 1 .272-.991"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.515 6.316a.75.75 0 0 1 .991.376c.468 1.035.994 2.768.994 5.308c0 2.192-.392 3.783-.8 4.844a7.7 7.7 0 0 1-.572 1.195a5 5 0 0 1-.289.425l-.007.01l-.003.003l-.002.002L20.25 18l.576.48a.75.75 0 0 1-1.156-.956l.003-.004l.031-.041a3 3 0 0 0 .137-.212c.12-.199.288-.516.459-.961c.342-.889.7-2.298.7-4.306c0-2.326-.48-3.849-.86-4.692a.75.75 0 0 1 .375-.992m-2.101 2.95a.75.75 0 0 1 .887.582c.11.53.199 1.24.199 2.152c0 1.11-.132 1.923-.273 2.474a5 5 0 0 1-.203.631a3 3 0 0 1-.102.228l-.01.018l-.003.007l-.002.003v.002s-.001.001-.657-.363l.656.364a.75.75 0 0 1-1.317-.719l.005-.01l.038-.087a4 4 0 0 0 .141-.447c.11-.424.227-1.111.227-2.101a9 9 0 0 0-.168-1.848a.75.75 0 0 1 .582-.886"/><path d="M21.78 3.53a.75.75 0 0 0-1.06-1.06l-4.45 4.449a11 11 0 0 0-.193-1.39c-.172-.788-.477-1.473-1.116-1.923a3 3 0 0 0-.769-.39c-.818-.28-1.631-.057-2.457.345c-.814.395-1.8 1.046-3.032 1.857l-.267.176c-.447.295-.602.394-.76.464q-.257.115-.535.16c-.171.03-.354.032-.89.032h-.162c-1.217 0-2.062-.001-2.814.347A3.96 3.96 0 0 0 1.548 8.22c-.392.729-.438 1.491-.504 2.575l-.008.13C1.014 11.294 1 11.658 1 12s.014.706.036 1.074l.008.13c.066 1.084.112 1.846.504 2.575a3.96 3.96 0 0 0 1.727 1.624c.61.283 1.283.336 2.166.345L2.72 20.47a.75.75 0 1 0 1.06 1.06zM16.5 12a.75.75 0 0 0-1.255-.554l-.071.074l-6 6.274A.778.778 0 0 0 9.34 19c1.039.68 1.899 1.225 2.631 1.549c.743.328 1.48.489 2.222.236a3 3 0 0 0 .769-.391c.706-.497 1.005-1.28 1.167-2.18c.159-.884.213-2.056.281-3.516l.003-.058a68 68 0 0 0 .088-2.64"/></svg>',
  folder: '<svg viewBox="0 0 1024 1024"><path d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32"/></svg>',
  youtube: '<svg viewBox="0 0 1024 1024"><path d="M941.3 296.1a112.3 112.3 0 0 0-79.2-79.3C792.2 198 512 198 512 198s-280.2 0-350.1 18.7A112.12 112.12 0 0 0 82.7 296C64 366 64 512 64 512s0 146 18.7 215.9c10.3 38.6 40.7 69 79.2 79.3C231.8 826 512 826 512 826s280.2 0 350.1-18.8c38.6-10.3 68.9-40.7 79.2-79.3C960 658 960 512 960 512s0-146-18.7-215.9M423 646V378l232 133z"/></svg>',
  chevron: '<svg class="chevron" viewBox="0 0 16 16"><path d="M5.5 3 10.5 8l-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
}
const AHEAD_SECONDS = 30
const BEHIND_SECONDS = 30
// why: Orca allows about 100 plugin.request calls per 10 s and then makes the panel wait ~10 s.
// Buffering ahead takes at most half; reads the picture is waiting for (after a seek) may use
// most of the rest, leaving a few for the tree.
const READS_PER_10S = { ahead: 50, urgent: 90 }
const URGENT_SECONDS = 3

const $ = (id) => document.getElementById(id)
const video = $('video')
const seek = $('seek')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function request(name, input) {
  for (;;) {
    try {
      return await orca.plugin.request(name, input, { timeoutMs: 120000 })
    } catch (error) {
      if (error.code !== 'rate_limited') throw error
      await sleep(error.retryAfterMs ?? 500)
    }
  }
}
const recentReads = []
async function paceRead(urgent) {
  for (;;) {
    const now = performance.now()
    while (recentReads.length && now - recentReads[0] > 10000) recentReads.shift()
    if (recentReads.length < READS_PER_10S[urgent() ? 'urgent' : 'ahead']) {
      recentReads.push(now)
      return
    }
    await sleep(Math.min(250, 10000 - (now - recentReads[0])))
  }
}
const once = (target, event) => new Promise((r) => target.addEventListener(event, r, { once: true }))
const parentOf = (path) => path.slice(0, path.lastIndexOf('/')) || '/'
const nameOf = (path) => path.slice(path.lastIndexOf('/') + 1)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function showError(error) {
  $('status').textContent = error ? String(error.message ?? error) : ''
}

function setBusy(on) {
  $('busy').hidden = !on
}

function decodeBase64(text) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(text)
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Playback: the worker turns a file `{ path }` or a YouTube page `{ url }` into fragmented MP4 from
// a start time; the panel feeds it to MediaSource and restarts the stream when a seek lands outside
// what is buffered.
const current = { source: null, info: null, audio: 0, siblings: [] }
const keyOf = (source) => source?.path ?? source?.url
let generation = 0
let streamId = null
let restartingAt = null
let objectUrl = null

function bufferedRange(t) {
  for (let i = 0; i < video.buffered.length; i++) {
    if (video.buffered.start(i) <= t + 0.25 && t <= video.buffered.end(i)) return [video.buffered.start(i), video.buffered.end(i)]
  }
  return null
}

async function append(sourceBuffer, bytes, gen) {
  for (;;) {
    try {
      sourceBuffer.appendBuffer(bytes)
      await once(sourceBuffer, 'updateend')
      return
    } catch (error) {
      if (error.name !== 'QuotaExceededError' || gen !== generation) throw error
      await evict(sourceBuffer, 10)
      await sleep(500)
    }
  }
}

async function evict(sourceBuffer, keepBehind) {
  const cutoff = video.currentTime - keepBehind
  if (sourceBuffer.buffered.length === 0 || sourceBuffer.buffered.start(0) >= cutoff) return
  sourceBuffer.remove(0, cutoff)
  await once(sourceBuffer, 'updateend')
}

async function startAt(start, autoplay) {
  const gen = ++generation
  restartingAt = start
  setBusy(true)
  if (streamId !== null) request('close', { id: streamId }).catch(() => {})
  streamId = null
  showError(null)
  const { source, audio, info } = current
  const opened = await request('open', { ...source, audio, start })
  if (gen !== generation) {
    request('close', { id: opened.id }).catch(() => {})
    return
  }
  streamId = opened.id

  const mediaSource = new MediaSource()
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(mediaSource)
  video.src = objectUrl
  await once(mediaSource, 'sourceopen')
  if (gen !== generation) return
  if (info.duration > 0) mediaSource.duration = info.duration
  const sourceBuffer = mediaSource.addSourceBuffer(opened.mime)
  sourceBuffer.timestampOffset = opened.offset

  let first = true
  while (gen === generation) {
    const end = sourceBuffer.buffered.length ? sourceBuffer.buffered.end(sourceBuffer.buffered.length - 1) : 0
    if (!first && end - video.currentTime > AHEAD_SECONDS) {
      await sleep(500)
      continue
    }
    await paceRead(() => first || end - video.currentTime < URGENT_SECONDS)
    if (gen !== generation) return
    const chunk = await request('read', { id: opened.id })
    if (gen !== generation) return
    if (chunk.eof) {
      if (mediaSource.readyState === 'open' && !sourceBuffer.updating) mediaSource.endOfStream()
      return
    }
    await append(sourceBuffer, decodeBase64(chunk.data), gen)
    if (first) {
      first = false
      video.currentTime = start
      restartingAt = null
      setBusy(false)
      if (autoplay) video.play().catch(() => {})
    }
    if (video.currentTime > BEHIND_SECONDS * 2) await evict(sourceBuffer, BEHIND_SECONDS)
  }
}

function play(start, autoplay) {
  startAt(start, autoplay).catch((error) => {
    restartingAt = null
    setBusy(false)
    if (error.name !== 'AbortError') showError(error)
  })
}

// `siblings` are what prev/next walk: a file's folder, or the playlist a link came from.
async function openSource(source, siblings = []) {
  const gen = ++generation
  showError(null)
  setBusy(true)
  let info
  try {
    info = await request('probe', source)
  } catch (error) {
    showError(error)
    if (gen === generation) setBusy(false)
    return
  }
  if (gen !== generation) return
  const { path = null, url } = source
  if (path) {
    const folder = await listing(parentOf(path)).catch(() => ({ files: [] }))
    siblings = folder.files.map((f) => ({ path: `${parentOf(path)}/${f}` }))
  }
  Object.assign(current, {
    source,
    info,
    audio: (info.audio.find((a) => a.default) ?? info.audio[0])?.index ?? 0,
    siblings
  })
  $('placeholder').hidden = true
  $('title').textContent = info.title ?? nameOf(path)
  $('title').title = path ?? url
  seek.max = String(info.duration)
  $('total').textContent = formatTime(info.duration)
  const select = $('audio')
  select.replaceChildren(...info.audio.map((a) => new Option(a.label, String(a.index), false, a.index === current.audio)))
  select.hidden = info.audio.length < 2
  updateNav()
  markCurrent()
  play(0, true)
  prefetchNeighbours()
}

function prefetchNeighbours() {
  const i = currentIndex()
  for (const neighbour of [current.siblings[i + 1], current.siblings[i - 1]]) {
    if (neighbour?.url) request('prefetch', neighbour).catch(() => {})
  }
}

const currentIndex = () => current.siblings.findIndex((s) => keyOf(s) === keyOf(current.source))

function step(delta) {
  const target = current.siblings[currentIndex() + delta]
  if (target) openSource(target, current.siblings)
}

function updateNav() {
  const i = currentIndex()
  $('prev').disabled = i <= 0
  $('next').disabled = i < 0 || i >= current.siblings.length - 1
}

$('prev').innerHTML = ICONS.prev
$('next').innerHTML = ICONS.next
$('prev').onclick = () => step(-1)
$('next').onclick = () => step(1)
$('toggle').onclick = () => {
  if (!current.info) return
  if (video.paused) video.play().catch(() => {})
  else video.pause()
}
video.onclick = $('toggle').onclick
video.onended = () => step(1)

function renderToggle() {
  $('toggle').innerHTML = video.paused ? ICONS.play : ICONS.pause
  $('toggle').setAttribute('aria-label', video.paused ? 'Play' : 'Pause')
}
video.onplay = video.onpause = renderToggle
renderToggle()
updateNav()

let dragging = false
seek.oninput = () => {
  dragging = true
  $('elapsed').textContent = formatTime(Number(seek.value))
}
function seekTo(target) {
  if (!current.info) return
  const t = Math.min(Math.max(0, target), current.info.duration || Infinity)
  if (bufferedRange(t)) video.currentTime = t
  else play(t, !video.paused)
  renderTime()
}
seek.onchange = () => {
  dragging = false
  seekTo(Number(seek.value))
}
function renderTime() {
  if (dragging) return
  // why: a new MediaSource resets currentTime to 0 until the first chunk lands.
  const t = restartingAt ?? video.currentTime
  seek.value = String(t)
  $('elapsed').textContent = formatTime(t)
}
video.ontimeupdate = renderTime

// Pause when any agent in Orca stops working (finished, or waiting on you). A pane seen for the
// first time counts as having been working, since the panel may open mid-run.
const agentStates = new Map()
orca.on('agent.status.changed', ({ paneKey, state }) => {
  const before = agentStates.get(paneKey) ?? 'working'
  agentStates.set(paneKey, state)
  if (state !== 'working' && before === 'working') video.pause()
})

const SEEK_STEP = 10
document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLSelectElement || event.target === $('url') || event.ctrlKey || event.metaKey || event.altKey) return
  const now = restartingAt ?? video.currentTime
  if (event.key === 'ArrowLeft') seekTo(now - SEEK_STEP)
  else if (event.key === 'ArrowRight') seekTo(now + SEEK_STEP)
  else if (event.key === ' ') $('toggle').onclick()
  else return
  event.preventDefault()
})
// why: Space on a focused button would also click it on keyup and toggle a second time.
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' && !(event.target instanceof HTMLSelectElement)) event.preventDefault()
})

$('audio').onchange = () => {
  current.audio = Number($('audio').value)
  play(video.currentTime, !video.paused)
}

function renderMute() {
  const silent = video.muted || video.volume === 0
  $('mute').innerHTML = silent ? ICONS.soundOff : ICONS.soundOn
  $('mute').setAttribute('aria-label', silent ? 'Unmute' : 'Mute')
}
video.onvolumechange = renderMute
video.volume = $('volume').value = load('volume', 0.7)
video.muted = load('muted', false)
renderMute()
$('volume').oninput = () => {
  video.volume = Number($('volume').value)
  video.muted = false
  save('volume', video.volume)
  save('muted', false)
}
$('mute').onclick = () => {
  if (!video.muted && video.volume === 0) {
    video.volume = $('volume').value = 0.5
    save('volume', 0.5)
  } else video.muted = !video.muted
  save('muted', video.muted)
}

// Folder tree: roots come from the plugin's settings; expanded folders survive restarts.
const expanded = new Set(load('expanded', []))
const listings = new Map()

async function listing(path) {
  if (!listings.has(path)) listings.set(path, request('list', { path }))
  try {
    return await listings.get(path)
  } catch (error) {
    listings.delete(path)
    throw error
  }
}

function nodeButton(label, depth, extra) {
  const button = document.createElement('button')
  button.className = 'node'
  button.style.paddingLeft = `${8 + depth * 14}px`
  button.title = label
  button.innerHTML = extra
  const span = document.createElement('span')
  span.textContent = label
  button.append(span)
  return button
}

async function renderDir(path, label, depth) {
  const fragment = document.createDocumentFragment()
  const open = expanded.has(path)
  const button = nodeButton(label, depth, ICONS.chevron)
  button.setAttribute('aria-expanded', String(open))
  button.onclick = () => {
    if (expanded.has(path)) expanded.delete(path)
    else expanded.add(path)
    save('expanded', [...expanded])
    renderTree()
  }
  fragment.append(button)
  if (!open) return fragment

  let entries
  try {
    entries = await listing(path)
  } catch (error) {
    const note = document.createElement('div')
    note.className = 'empty'
    note.style.paddingLeft = `${8 + (depth + 1) * 14}px`
    note.textContent = error.message
    fragment.append(note)
    return fragment
  }
  for (const dir of entries.dirs) fragment.append(await renderDir(`${path === '/' ? '' : path}/${dir}`, dir, depth + 1))
  for (const file of entries.files) {
    const filePath = `${path === '/' ? '' : path}/${file}`
    const node = nodeButton(file, depth + 1, '<span class="leaf"></span>')
    node.dataset.key = filePath
    node.onclick = () => openSource({ path: filePath })
    fragment.append(node)
  }
  if (entries.dirs.length + entries.files.length === 0) {
    const note = document.createElement('div')
    note.className = 'empty'
    note.style.paddingLeft = `${8 + (depth + 1) * 14}px`
    note.textContent = 'No videos'
    fragment.append(note)
  }
  return fragment
}

let renderGeneration = 0
async function renderTree() {
  const gen = ++renderGeneration
  try {
    const roots = await request('roots', {})
    const parts = []
    for (const root of roots) parts.push(await renderDir(root.path, root.name, 0))
    if (gen !== renderGeneration) return
    const scroll = $('tree').scrollTop
    $('tree').replaceChildren(...parts)
    $('tree').scrollTop = scroll
    markCurrent()
  } catch (error) {
    if (gen === renderGeneration) showError(error)
  }
}

function markCurrent() {
  for (const node of document.querySelectorAll('.node[data-key]')) {
    node.classList.toggle('current', node.dataset.key === keyOf(current.source))
  }
}

orca.settings?.onDidChange?.(() => {
  listings.clear()
  renderTree()
})
renderTree()

// Source switch: the folder tree, or a YouTube link (a video or a playlist) to play.
function setMode(mode) {
  for (const name of ['folder', 'youtube']) $(`mode-${name}`).setAttribute('aria-selected', String(name === mode))
  $('tree').hidden = mode !== 'folder'
  $('web').hidden = mode !== 'youtube'
  save('mode', mode)
}
$('mode-folder').innerHTML = ICONS.folder
$('mode-youtube').innerHTML = ICONS.youtube
$('mode-folder').onclick = () => setMode('folder')
$('mode-youtube').onclick = () => setMode('youtube')
setMode(load('mode', 'folder'))

$('open-url').innerHTML = ICONS.play
function renderPlaylist(entries) {
  const playlist = entries.map((entry) => ({ url: entry.url }))
  $('playlist').replaceChildren(
    ...entries.map((entry, i) => {
      const node = nodeButton(`${i + 1}. ${entry.title}`, 0, '')
      if (entry.duration) node.title += ` (${formatTime(entry.duration)})`
      node.dataset.key = entry.url
      node.onclick = () => openSource(playlist[i], playlist)
      return node
    })
  )
  return playlist
}

$('youtube').onsubmit = async (event) => {
  event.preventDefault()
  const url = new URL($('url').value.trim())
  $('open-url').disabled = true
  try {
    if (!url.searchParams.has('list')) {
      renderPlaylist([])
      await openSource({ url: url.href })
      return
    }
    showError(null)
    const { entries } = await request('playlist', { url: url.href })
    if (entries.length === 0) throw new Error('The playlist is empty or private')
    const playlist = renderPlaylist(entries)
    const start = entries.findIndex((entry) => entry.id === url.searchParams.get('v'))
    await openSource(playlist[Math.max(0, start)], playlist)
  } catch (error) {
    showError(error)
  } finally {
    $('open-url').disabled = false
  }
}
