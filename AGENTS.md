# AGENTS.md

Orca plugin: a video player in the right sidebar. `worker/` (Node, trusted-worker) lists folders and turns any file, or a YouTube link resolved by `yt-dlp`, into fragmented MP4 with `ffmpeg`. `panel/` (plain HTML/JS, no build) plays that MP4 through MediaSource.

## Commands

- `npm test`: worker logic against fixtures that ffmpeg generates. Needs `ffmpeg`/`ffprobe` with libx264, libx265 and ac3 on PATH.
- `orca-ide plugin validate .` checks the manifest. On this machine the Orca CLI is `orca-ide`; `/usr/bin/orca` is a screen reader.
- `orca-ide plugin dev reload .` loads changes into the running Orca. `plugin shot` won't reload an already-open panel: touch `panel/index.html` and reload again.
- The panel can't be driven from the CLI (`--act` refuses HTML panels). To check behavior in the real frame, add a temporary `<script type="module" src="probe/probe.js">`, log with `console.error`, read `orca-ide plugin logs local.sidebar-player`, then delete the probe.

## Constraints that shape the design

- The panel frame has no network or file access. Video bytes reach it only as base64 answers to `plugin.request`, each at most 1 MiB of JSON. So keep worker chunks at ≤700 KiB.
- Orca allows about 100 `plugin.request` calls per 10 s per plugin. Past that it answers `rate_limited` with `retryAfterMs` ≈ 10 s. `paceRead` in `panel/app.js` keeps buffering at 50 calls and seek reads at 90. Raising the buffer-ahead size or dropping the pacing brings back multi-second seek stalls.
- `yt-dlp` runs with the user's own config (`~/.config/yt-dlp/config`). With a JS runtime enabled there it prefers TV clients, whose googlevideo URLs answer 403 without a PO token, so `resolveUrl` excludes them. Each call first runs with `--no-cookies-from-browser`, because reading browser cookies costs ~3 s. Only if that fails does it retry with the config's cookies. A 403 from ffprobe on a YouTube link means the client choice broke again: compare `c=` in the URL with `yt-dlp -v`.
- The frame's Chromium has no AC3/E-AC3/DTS and no HEVC. `planStream` copies H.264 and transcodes everything else, and audio is always AAC.

## Seeking and A/V sync

`planStream` returns `offset`, the source time where the stream starts. The panel sets it as `sourceBuffer.timestampOffset`, because the fMP4 muxer always restarts timestamps at 0, whatever `-copyts` or `-output_ts_offset` you pass.

- For copied H.264, seek to `keyframe + 0.2` with `-noaccurate_seek`. With B-frames, ffmpeg seeks 0.13 s before `-ss`, so `-ss` exactly on the keyframe lands on the previous one. Accurate seeking then trims audio but not copied video, and the sound comes out a whole GOP late.
- For transcoded video, use plain accurate `-ss start`.
- YouTube sound comes as a second input. Give it the same `-ss` as the video (`keyframe + 0.2`, accurate): ffmpeg aligns inputs by their `-ss`, so cutting the audio at the keyframe itself puts the sound 0.2 s late.
- The flash+beep tests in `tests/media.test.mjs` guard this. Don't trust tests whose keyframes or beeps sit on whole seconds: they missed this bug.
