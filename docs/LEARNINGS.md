# Learnings

Things that didn't work, surprises, and gotchas discovered during development.

## electron-store Was Removed

The initial implementation used the `electron-store` npm package for persistence. It was removed and replaced with a custom JSON file implementation (`store` object, `main.js` lines 11-35) because:
- `electron-store` requires a specific import style incompatible with CommonJS `require()`
- Adding it as a dependency increased bundle size without meaningful benefit for such a simple schema
- The custom implementation is 25 lines and has zero dependencies

If you're tempted to add `electron-store` back: don't. The custom store handles error cases (corrupted file, missing file) cleanly and writes synchronously to prevent partial writes on force-quit.

## Code Signing is a Rabbit Hole on macOS

Initial builds had `"hardenedRuntime": true` and tried to use code signing. This caused build failures on machines without an Apple Developer certificate. Setting `"hardenedRuntime": false` and `"identity": null` produces unsigned builds that work fine for development and distribution outside the Mac App Store. Users see a Gatekeeper warning on first launch but can right-click → Open to bypass it.

## Linux AppImage + User Namespaces

Electron's sandbox requires unprivileged user namespaces on Linux, which is disabled by default on some hardened kernels (Debian, some Ubuntu configs). The fix (`sysctl -w kernel.unprivileged_userns_clone=1`) works but isn't persistent across reboots. The `--no-sandbox` flag is the pragmatic alternative for AppImages.

## `window-all-closed` Behavior Differs by Platform

The standard Electron pattern:
```js
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```
On macOS, closing all note windows does NOT quit the app — it stays in the Dock. `app.on('activate')` handles relaunching notes when the Dock icon is clicked. This is correct macOS behavior but unintuitive if you're developing on Linux.

## Transparent Windows + Shadows

Using `frame: false, transparent: true` makes the OS chrome invisible. The visual appearance is entirely driven by the CSS in `note.html` — `border-radius: 8px` on `.note-container` and `box-shadow` for depth. If `transparent: true` is removed, you get a white rectangular frame around the rounded note. The `hasShadow: true` option in `BrowserWindow` doubles the shadow effect with native OS shadow + CSS shadow, which looks nice but is redundant.

## Auto-Save Debounce Timing

The 1-second auto-save debounce (renderer.js line 44) was chosen to balance responsiveness with disk I/O. A shorter debounce (e.g. 100ms) causes excessive writes while typing. A longer debounce (e.g. 5s) risks data loss on crash. 1 second feels snappy enough that users trust the app is saving without hammering `notes.json`.

## Cascading Window Position Offset

New notes are positioned using `(existingCount * 30) % (screenDimension - noteSize)` in `createNote()`. The modulo prevents notes from cascading off-screen on smaller displays. Without the modulo, creating 20+ notes in a row would place the last ones off-screen.

## Build Output Size

The `scripts/bloat-check.sh` tooling was written because electron-builder will silently include `node_modules` in the build if the `files` array is not carefully specified. The default electron-builder behavior (without an explicit `files` array) packs everything. The current explicit `files` list keeps the ASAR small.

## `before-quit` Save Race Condition

The `app.on('before-quit')` handler calls `saveAllNotes()`, which sends `request-save` IPC to all renderer windows and asks them to flush content. There's a potential race — if the renderer processes the IPC after the main process has already written `notes.json`, the content write is a no-op. In practice this works because Electron processes IPC before fully quitting, but it is not guaranteed under heavy load.
