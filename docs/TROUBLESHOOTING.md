# Troubleshooting

## App Won't Launch

**Error: `ELECTRON_RUN_AS_NODE` / credits permission denied on Linux**
```
[65820:0101/000000.000000:FATAL:setuid_sandbox_host.cc(157)] The SUID sandbox helper binary...
```
Fix: `sudo sysctl -w kernel.unprivileged_userns_clone=1`
Or run: `./Dark Sticky Notes.AppImage --no-sandbox`

**Error: `A JavaScript error occurred in the main process`**
Open Developer Tools with `Cmd+Alt+I` (macOS) or `Ctrl+Alt+I` (Linux/Windows). The renderer console shows renderer errors. Main process errors appear in the terminal where you ran `npm start`. Look for stack traces indicating missing modules or syntax errors.

**App launches but no note window appears**
The `notes.json` may contain corrupted data. Check the file at:
- macOS: `~/Library/Application Support/Dark Sticky Notes/notes.json`
- Windows: `%APPDATA%\Dark Sticky Notes\notes.json`
- Linux: `~/.config/Dark Sticky Notes/notes.json`

If the file is malformed JSON, the `store.get()` catch block silently returns the default empty object and `loadSavedNotes()` creates a new default note. If that doesn't happen, delete `notes.json` and relaunch.

## Notes Not Saving

**Notes don't persist after closing and reopening**
Verify the `notes.json` file is being written. After creating a note and waiting 1+ second, check the file's modification time:
```bash
# macOS/Linux
ls -la ~/Library/Application\ Support/Dark Sticky Notes/notes.json
```
If the file doesn't exist or isn't updating, check for file permission issues on the userData directory.

**Note content saves but position doesn't**
Position saves on the `moved` window event in `main.js` (line 157). If you're dragging and releasing without the `moved` event firing (can happen on some Linux WMs), force a save with Cmd+S.

## Build Errors

**`npm install` fails with `node-pre-gyp` or native module errors**
```
npm ERR! code 1
npm ERR! path .../node_modules/...
```
Try:
```bash
npm install --ignore-scripts
npm run postinstall
```
Or clear the cache: `npm cache clean --force && npm install`

**`npm run dist` fails with `electron-builder` errors on Ubuntu**
Missing system libraries for cross-compilation. Install:
```bash
sudo apt install rpm alien fakeroot
```

**`Cannot find module 'uuid'`**
The `uuid` package is in `dependencies` in `package.json`. Run `npm install`. If it still fails: `npm install uuid@^11.1.0 --save`

**`electron-builder: cannot find icon`**
The build config expects `resources/icon.icns` (macOS) and `resources/icon.ico` (Windows). Verify these files exist:
```bash
ls resources/
```
If missing, run `python3 scripts/create_icon.py && python3 scripts/convert_icons.py` to regenerate.

## Display and UI Issues

**Notes appear transparent/invisible on startup**
This is a known Electron/compositor interaction on some Linux desktop environments. The `transparent: true` window setting combined with certain compositors can cause issues. Try disabling compositing or running in X11 mode.

**Color picker colors look wrong**
The text contrast is computed dynamically in `renderer.js` using the `hexToRgb()` function and luminance formula (line 106). If the text is unreadable, the hex value stored in `notes.json` for that note may be invalid. Fix by selecting a color from the picker, which will overwrite the stored value.

**Window can't be resized smaller than 200x200**
This is intentional. `BrowserWindow` is created with `minWidth: 200, minHeight: 200` in `main.js` (lines 127-128).

**Notes open in wrong positions after moving to a different monitor**
Note positions are stored as absolute screen coordinates. If you change your monitor configuration, stored `x`/`y` values may be off-screen. Edit `notes.json` manually to reset positions, or delete the file to start fresh.

## Dev Tools

**How to open Dev Tools for a note window**
Press `Alt+Cmd+I` (macOS) or `Alt+Ctrl+I` (Linux/Windows) while a note window is focused. Or via View → Toggle Developer Tools in the menu bar.

**How to see main process logs**
Run `npm start` in a terminal. `console.error` calls in `main.js` (from the `store.get`/`store.set` error handlers) appear in the terminal, not in the renderer Dev Tools console.
