# CLAUDE.md — Dark Sticky Notes Project Context

## What This Project Is

Dark Sticky Notes is a minimal Electron desktop sticky notes app. Each note is a separate `BrowserWindow`. Notes persist to `userData/notes.json`. There is no server, no cloud, no build step for source changes.

## Tech Stack

- **Runtime:** Electron 37.4.0 (Node.js 18+)
- **Language:** Vanilla JavaScript (CommonJS, ES2018+)
- **UI:** HTML5 + CSS3 (inline in note.html) + no frameworks
- **Storage:** JSON file via Node `fs` module (synchronous)
- **IDs:** uuid v11.x (UUID v4)
- **Packaging:** electron-builder v26.0.12
- **CI:** GitHub Actions (ubuntu-latest, Node 20)

## File Structure (Complete Source)

```
main.js       — Main process: BrowserWindow management, IPC handlers, persistence
preload.js    — Context bridge: exposes window.electronAPI to renderer
renderer.js   — Renderer: UI events, auto-save debounce, keyboard shortcuts
note.html     — Note window: all CSS inline in <style>, loads renderer.js
package.json  — Config + electron-builder packaging (explicit files array)
```

That's the entire app. Four source files.

## Key Commands

```bash
npm start                # Run from source (no build needed)
npm run dist:current     # Package for current platform
npm run dist             # Package all platforms
npm run bloat-check      # Check node_modules and dist sizes
```

## Architecture Summary

- Main process manages all `BrowserWindow` instances in `noteWindows: Map<uuid, BrowserWindow>`
- Each note window loads `note.html` and receives its data via `load-note` IPC event
- Renderer calls `window.electronAPI.*` methods (defined in `preload.js`)
- All persistence is in `main.js` via the `store` object (reads/writes `notes.json` synchronously)
- `contextIsolation: true`, `nodeIntegration: false` — renderer has zero Node access

## IPC Channels

Renderer → Main: `create-note`, `close-note`, `save-note-content`, `update-note-color`, `minimize-note`, `toggle-always-on-top`
Main → Renderer: `load-note` (on window ready), `request-save` (on app quit)

## Data Location

`notes.json` in Electron's `userData`:
- macOS: `~/Library/Application Support/Dark Sticky Notes/notes.json`
- Windows: `%APPDATA%\Dark Sticky Notes\notes.json`
- Linux: `~/.config/Dark Sticky Notes/notes.json`

## Adding a Feature

1. For renderer-only changes: edit `renderer.js` and/or `note.html`, reload with Cmd+R
2. For main-process changes: edit `main.js`, restart with `npm start`
3. For IPC changes: update all three of `main.js`, `preload.js`, `renderer.js`

## What NOT to Do

- Do not add `electron-store` — removed intentionally, custom store handles it
- Do not enable `nodeIntegration: true` — security boundary is intentional
- Do not add frontend frameworks (React, Vue, etc.) — vanilla JS only
- Do not restructure the 4-file flat layout — `package.json` `build.files` depends on it
- Do not use `CmdOrCtrl` → actually, DO use `CmdOrCtrl` in menu accelerators (current code uses `Cmd` only — this is a known bug)

## Known Issues

See `docs/TODO.md` for full list. Key items:
- CI `npm test` always fails (no tests defined)
- Menu accelerators use `Cmd` instead of `CmdOrCtrl` (breaks Windows/Linux keyboard shortcuts)
- `before-quit` save has a potential race condition (see `docs/LEARNINGS.md`)

## Docs

- Architecture: `docs/ARCHITECTURE.md`
- IPC/API: `docs/API.md`
- Build targets: `docs/BUILD_COMPILE.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
