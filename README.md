# Sidebar Player

Watch videos in Orca's right sidebar while agents work: files from your own folders, or YouTube videos and playlists. Playback pauses when an agent finishes or needs you.

Pick an episode in the folder tree, switch audio tracks, seek with the bar or ←/→ (10 s), pause with Space. The tree remembers which folders you expanded. Paste a YouTube link to play a video, or a playlist to step through with previous/next (up to 1080p).

Plays any file ffmpeg can read: H.264 is remuxed as is, other video (HEVC, 10-bit, …) is transcoded to 720p H.264, and every audio track becomes AAC, so AC3/E-AC3/DTS dubs play too.

## Requirements

- `ffmpeg` and `ffprobe` built with libx264, and `yt-dlp` for YouTube, all on `PATH`.
  - macOS: the plugin also looks in `/opt/homebrew/bin` and `/usr/local/bin`.
  - Windows: install them as `.exe` files (pip, winget, scoop and choco do); the plugin can't find `.cmd`/`.bat` wrappers.
- Tested on Linux only. macOS and Windows should work; please open an issue if they don't.

## Access

The plugin asks for full access because its worker reads the folders you list, runs ffmpeg and yt-dlp, and fetches YouTube streams. It also reads agent status to pause playback. If your yt-dlp config loads browser cookies, the plugin uses them only when a video fails without them.

## Settings

**Video folders** (in the plugin's settings in Orca): one path per line, `~` by default.

## Develop

Tests need `ffmpeg` and `ffprobe` with libx264, libx265 and the ac3 encoder.

```sh
npm test                   # worker logic against ffmpeg-generated fixtures
orca plugin validate .
orca plugin dev watch .
```
