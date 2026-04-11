# FAQ

## Using the App

**How do I create a new note?**
Click the ➕ button in any note's header, or press Cmd+N (macOS) / Ctrl+N (Windows/Linux). Each new note opens offset 30px from the previous one so they don't stack perfectly.

**How do I save my notes?**
Notes save automatically. There's a 1-second debounce on the `input` event — after you stop typing, the content saves. Position and size save immediately when you finish moving or resizing. You don't need to do anything manual.

**Why did my notes disappear after restarting?**
Notes are stored in Electron's `userData` directory as `notes.json`. If this file was deleted or the app's userData directory was cleared, notes are gone. Check:
- macOS: `~/Library/Application Support/Dark Sticky Notes/notes.json`
- Windows: `%APPDATA%\Dark Sticky Notes\notes.json`
- Linux: `~/.config/Dark Sticky Notes/notes.json`

**Can I change the font size?**
Not from the UI in the current version. Font size defaults to 14px and is stored per-note in `notes.json`. You can manually edit the `notes.json` file and change the `fontSize` field for any note.

**What are the keyboard shortcuts?**
- `Cmd+N` / `Ctrl+N` — New note
- `Cmd+W` / `Ctrl+W` — Close current note
- `Cmd+S` / `Ctrl+S` — Force save current note
- `Cmd+M` / `Ctrl+M` — Minimize current note
- `Cmd+T` / `Ctrl+T` — Toggle always-on-top (pin)
- `Cmd+Q` / `Ctrl+Q` — Quit

**The "pin" button (📌) doesn't seem to work on Linux.**
The always-on-top feature works via `window.setAlwaysOnTop()` in `main.js`. On some Linux desktop environments (especially Wayland compositors), this behavior can be inconsistent. Try running under X11 if this is an issue.

## Building & Development

**`npm run dist` fails on Linux with a Windows build error.**
Windows cross-compilation from Linux requires Wine. Install with `sudo apt install wine` on Debian/Ubuntu. Alternatively, use `npm run dist:linux` to build only Linux packages.

**`npm run dist:mac` fails — "Cannot find valid certificate".**
The build config has `"identity": null` and `"hardenedRuntime": false`, so signing is disabled. If you still see signing errors, run with `CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist:mac`.

**The app crashes on Linux with a credentials or sandbox error.**
Electron requires user namespaces on Linux. Run: `sudo sysctl -w kernel.unprivileged_userns_clone=1`. Or launch the app with `--no-sandbox` by editing the AppImage launch options.

**Changes to `main.js` aren't taking effect.**
Main process changes require restarting the app (`npm start`). Cmd+R only reloads the renderer process (the HTML/JS displayed in the window).

**How do I add a new feature that needs to access the file system from the renderer?**
You cannot access the file system directly from the renderer — `nodeIntegration` is disabled. Add an IPC handler in `main.js`, expose it in `preload.js`, and call it from `renderer.js`. See `docs/API.md` and `AGENTS.md` for the full pattern.

**Why is `node_modules` 300+ MB for such a simple app?**
Electron itself accounts for most of that — the packaged Chromium + Node runtime is large. Your actual app code is only ~15KB. The packaged output (`.dmg`, `.AppImage`, etc.) compresses this down considerably with `"compression": "maximum"`.

## Data

**Can I sync notes across devices?**
Not natively. Notes are stored as `notes.json` in the local userData directory with no cloud component. You can point two machines at the same Dropbox/synced folder by editing the `userDataPath` in `main.js`, but this is not a supported configuration and can cause write conflicts.

**How do I back up my notes?**
Copy the `notes.json` file from the userData directory (paths above). It's plain JSON and human-readable.

**How do I import notes from another computer?**
Copy the `notes.json` from the source machine to the same userData path on the destination machine before launching the app.
