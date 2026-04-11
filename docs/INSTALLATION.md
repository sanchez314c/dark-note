# Installation

## Prerequisites

- **Node.js v20 or higher** — [nodejs.org](https://nodejs.org/)
- **npm** — included with Node.js
- **Git** — to clone the repository

Verify your environment:
```bash
node --version   # should be v20+
npm --version
```

## Install from Source

```bash
# 1. Clone the repository
git clone https://github.com/sanchez314c/dark-sticky-notes.git
cd dark-sticky-notes

# 2. Install dependencies
npm install
```

This installs two dev dependencies (`electron`, `electron-builder`) and one runtime dependency (`uuid`). The full `node_modules` will be around 300-400 MB — this is normal for Electron.

## Run in Development Mode

```bash
npm start
```

The app opens immediately. No build step is needed for development. Changes to `renderer.js`, `note.html`, or `renderer.js` take effect on next app launch (or window reload with Cmd+R/Ctrl+R).

Changes to `main.js` require restarting the app.

## Install Pre-built Packages

Pre-built packages are published to GitHub Releases at [github.com/sanchez314c/dark-sticky-notes/releases](https://github.com/sanchez314c/dark-sticky-notes/releases).

### macOS

Download `Dark Sticky Notes-<version>.dmg`, open it, and drag Dark Sticky Notes to Applications. First launch may require right-click → Open to bypass Gatekeeper (the app is not code-signed for public distribution).

### Windows

Download `Dark Sticky Notes Setup <version>.exe` (NSIS installer) or the portable `.exe`. The installer creates Start Menu and Desktop shortcuts.

### Linux

- **AppImage**: `chmod +x Dark Sticky Notes-<version>.AppImage && ./Dark Sticky Notes-<version>.AppImage`
- **Debian/Ubuntu**: `sudo dpkg -i dark-sticky-notes_<version>_amd64.deb`
- **Fedora/RHEL**: `sudo rpm -i dark-sticky-notes-<version>.x86_64.rpm`

On Linux, if the AppImage crashes with a sandbox error, run: `sudo sysctl -w kernel.unprivileged_userns_clone=1`

## Platform Run Scripts

For convenience, the `scripts/` directory contains ready-to-use launch scripts:

| Script | Platform | Mode |
|---|---|---|
| `scripts/run-linux-source.sh` | Linux | Development (from source) |
| `scripts/run-linux.sh` | Linux | From compiled `dist/` binary |
| `scripts/run-macos-source.sh` | macOS | Development (from source) |
| `scripts/run-macos.sh` | macOS | From compiled `dist/` binary |
| `scripts/run-windows-source.bat` | Windows | Development (from source) |
| `scripts/run-windows.bat` | Windows | From compiled `dist/` binary |

## Data Storage Location

Notes are saved to a `notes.json` file in Electron's `userData` directory:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Dark Sticky Notes/notes.json` |
| Windows | `%APPDATA%\Dark Sticky Notes\notes.json` |
| Linux | `~/.config/Dark Sticky Notes/notes.json` |

## Verification

After installing and launching:
1. A default yellow sticky note should appear on screen
2. Type some text — it auto-saves after 1 second of inactivity
3. Close the app and relaunch — the note and its content should restore
4. Click ➕ to create a second note in a different color
