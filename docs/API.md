# API Reference

## window.electronAPI (Renderer-facing API)

All renderer↔main communication goes through `window.electronAPI`, exposed by `preload.js` via `contextBridge.exposeInMainWorld`. The renderer has no other access to Node.js or Electron internals.

### Methods (renderer → main)

#### `window.electronAPI.createNote()`
Creates a new note window. Position is offset by `(existingCount * 30) % screenDimension` from the default `{x: 100, y: 100}`. Returns a Promise resolving to the new note's UUID string.

#### `window.electronAPI.closeNote(id: string)`
Closes the `BrowserWindow` associated with `id`. Saves content first via `saveNoteContent` in the renderer before calling this. Returns void.

#### `window.electronAPI.saveNoteContent(id: string, content: string)`
Persists the textarea content for `id` to `notes.json`. Called by the auto-save debounce (1 second after last keystroke) and before close. Returns void.

#### `window.electronAPI.updateNoteColor(id: string, color: string)`
Persists the `backgroundColor` for `id` to `notes.json`. `color` is a hex string (e.g. `"#ffeb3b"`). Returns void.

#### `window.electronAPI.minimizeNote(id: string)`
Minimizes the `BrowserWindow` for `id`. Returns void.

#### `window.electronAPI.toggleAlwaysOnTop(id: string)`
Toggles the always-on-top state for `id`. Returns a Promise resolving to `boolean` — `true` if the window is now always-on-top.

### Event Listeners (main → renderer)

#### `window.electronAPI.onLoadNote(callback: (data: NoteConfig) => void)`
Fires once when the window finishes loading, delivering the saved note data. `data` matches the `NoteConfig` schema below.

#### `window.electronAPI.onRequestSave(callback: () => void)`
Fires when the main process needs the renderer to flush content (triggered by `app.before-quit` → `saveAllNotes()`).

## IPC Channels (main.js)

| Channel | Direction | Handler |
|---|---|---|
| `create-note` | renderer→main | `createNote()` |
| `close-note` | renderer→main | `noteWindows.get(id).close()` |
| `save-note-content` | renderer→main | writes to `store` notes object |
| `update-note-color` | renderer→main | writes to `store` notes object |
| `minimize-note` | renderer→main | `window.minimize()` |
| `toggle-always-on-top` | renderer→main | `window.setAlwaysOnTop(!current)`, returns new state |
| `load-note` | main→renderer | sent on `did-finish-load` with `NoteConfig` |
| `request-save` | main→renderer | sent by `saveAllNotes()` before quit |

## Data Schema

### NoteConfig

```typescript
interface NoteConfig {
  id: string;          // UUID v4
  x: number;           // Window left position (pixels)
  y: number;           // Window top position (pixels)
  width: number;       // Window width (pixels, min 200)
  height: number;      // Window height (pixels, min 200)
  content: string;     // Textarea text content
  backgroundColor: string;  // Hex color string, default "#ffeb3b"
  fontSize: number;    // Font size in px, default 14
}
```

### notes.json

```json
{
  "<uuid-v4>": {
    "id": "<uuid-v4>",
    "x": 100,
    "y": 100,
    "width": 300,
    "height": 300,
    "content": "Note text here",
    "backgroundColor": "#ffeb3b",
    "fontSize": 14
  },
  "<uuid-v4>": { ... }
}
```

Stored at:
- macOS: `~/Library/Application Support/Dark Sticky Notes/notes.json`
- Windows: `%APPDATA%\Dark Sticky Notes\notes.json`
- Linux: `~/.config/Dark Sticky Notes/notes.json`

## Available Note Colors

The color picker in `note.html` offers these 7 preset colors:

| Color | Hex | Label |
|---|---|---|
| Yellow | `#ffeb3b` | Default |
| Orange | `#ff9800` | |
| Green | `#4caf50` | |
| Blue | `#2196f3` | |
| Pink | `#e91e63` | |
| Purple | `#9c27b0` | |
| White | `#ffffff` | |

Text color is computed dynamically in `renderer.js:hexToRgb()` + luminance formula: bright backgrounds get `rgba(0,0,0,0.87)`, dark backgrounds get `rgba(255,255,255,0.87)`.

## Keyboard Shortcuts

| Shortcut | Action | Where handled |
|---|---|---|
| Cmd+N | New note | renderer.js + main.js menu |
| Cmd+W | Close current note | renderer.js |
| Cmd+S | Save current note | renderer.js |
| Cmd+M | Minimize current note | renderer.js |
| Cmd+T | Toggle always-on-top | renderer.js |
| Cmd+Q | Quit app | main.js menu |
| Cmd+Z | Undo | main.js menu (native role) |
| Cmd+R | Reload window | main.js menu (native role) |
| Alt+Cmd+I | Toggle DevTools | main.js menu (native role) |

## Application Menu

Built in `createMenu()` in `main.js`. Menu items:
- **Dark Sticky Notes** → New Note, Save All Notes, Quit
- **Edit** → Undo, Redo, Cut, Copy, Paste, Select All
- **View** → Reload, Toggle Developer Tools
