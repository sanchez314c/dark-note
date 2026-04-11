# Architecture

## Overview

dark-sticky-notes is a multi-process Electron desktop application. Each sticky note is a separate, independent `BrowserWindow`. There is no central "app window" — the application exists only as a collection of floating note windows and a native menu bar.

## Process Model

```
OS / Native Menu Bar
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Main Process (main.js)                         │
│                                                 │
│  noteWindows: Map<uuid, BrowserWindow>          │
│  store: { get(), set() } → userData/notes.json │
│                                                 │
│  createNote()     loadSavedNotes()              │
│  saveNotePosition() saveNoteSize()              │
│  saveAllNotes()   createMenu()                  │
│                                                 │
│  ipcMain.handle() for 6 channels               │
└────────────┬────────────────────────────────────┘
             │  IPC (contextBridge)
             │
┌────────────▼────────────────────────────────────┐
│  Preload Script (preload.js)                    │
│                                                 │
│  contextBridge.exposeInMainWorld('electronAPI') │
│  → 6 invoke methods + 2 event listeners        │
└────────────┬────────────────────────────────────┘
             │  window.electronAPI.*
             │
┌────────────▼────────────────────────────────────┐
│  Renderer Process (note.html + renderer.js)     │
│  (one instance per note window)                 │
│                                                 │
│  noteId, currentColor, isPinned state           │
│  1-second auto-save debounce                    │
│  Color brightness → text contrast calculation   │
└─────────────────────────────────────────────────┘
```

## Key Design Decisions

**One BrowserWindow per note.** This gives each note independent minimize/always-on-top/resize behavior that would be impossible with a single window. The `noteWindows` Map in `main.js` tracks all live windows by UUID.

**Frameless transparent windows.** Each note uses `frame: false, transparent: true` so the custom `note-container` div with `border-radius: 8px` and `box-shadow` is what the user sees. The header `.note-header` has `-webkit-app-region: drag` for OS-native dragging.

**JSON file instead of electron-store.** Data is persisted to `userData/notes.json` using Node's `fs` module directly. The `store` object in `main.js` (lines 11-35) is a thin wrapper that reads/merges/writes this file. This eliminates the `electron-store` package dependency.

**Context isolation enforced.** `nodeIntegration: false` and `contextIsolation: true` are set on every `BrowserWindow`. The renderer process has zero direct Node access — it only calls the 8 methods exposed via `preload.js`.

## Data Flow: Creating a Note

1. User clicks ➕ or presses Cmd+N
2. `renderer.js` calls `window.electronAPI.createNote()`
3. `preload.js` sends `ipcRenderer.invoke('create-note')`
4. `main.js` `ipcMain.handle('create-note')` calls `createNote()`
5. `createNote()` generates a UUID, calculates screen-offset position, creates `BrowserWindow`
6. On `did-finish-load`, sends `load-note` event with config to renderer
7. `renderer.js` `onLoadNote` handler sets `noteId`, content, color, font size

## Data Flow: Saving a Note

**Auto-save path (1-second debounce):**
1. User types in textarea
2. `input` event fires, `saveTimeout` reset to 1000ms
3. After 1s idle: `saveNoteContent()` calls `window.electronAPI.saveNoteContent(noteId, content)`
4. `main.js` merges content into `notes[id]` and writes `notes.json`

**Position/size save path:**
- `moved` event → `saveNotePosition(id, x, y)` writes x/y to `notes.json`
- `resized` event → `saveNoteSize(id, width, height)` writes dimensions to `notes.json`

**App quit path:**
- `before-quit` → `saveAllNotes()` broadcasts `request-save` IPC to all windows, then writes positions/sizes

## Startup Sequence

```
app.whenReady()
  └─> createMenu()         sets native application menu
  └─> loadSavedNotes()
        └─> store.get('notes', {})
              ├─ empty → createNote()        (one default note)
              └─ has data → forEach note → createNote(savedData)
```

## File Layout

```
dark-sticky-notes/
├── main.js           Main process — window management, IPC, persistence
├── preload.js        Context bridge — exposes electronAPI to renderer
├── renderer.js       Renderer logic — UI state, events, auto-save
├── note.html         Note window — inline CSS, markup, loads renderer.js
├── package.json      App config + electron-builder packaging config
├── resources/        Icon assets (PNG, ICNS, ICO) for packaging
├── scripts/          Run and build helper scripts (not packaged)
└── docs/             Developer documentation
```

The 4 source files (`main.js`, `preload.js`, `renderer.js`, `note.html`) are the complete application. The `package.json` `build.files` array explicitly lists only these 4 files plus `package.json` for the packaged output.
