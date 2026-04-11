# Quick Start

From clone to running in under 5 minutes.

## Prerequisites

Node.js v20+ must be installed. Check: `node --version`

## Steps

```bash
# 1. Clone
git clone https://github.com/sanchez314c/dark-sticky-notes.git
cd dark-sticky-notes

# 2. Install dependencies (~1-2 minutes)
npm install

# 3. Launch
npm start
```

A yellow sticky note appears on your desktop. That's it.

## First Things to Try

- **New note** — click ➕ in the header or press Cmd+N
- **Type** — click inside the note and start typing (auto-saves after 1 second)
- **Change color** — click a colored circle in the bottom bar
- **Pin on top** — click 📌 to keep the note above all other windows
- **Move** — drag by the header bar
- **Resize** — drag from any corner
- **Close** — click ✕ or press Cmd+W

Quit the app and relaunch — all notes restore exactly as you left them.

## Build a Package (Optional)

```bash
# Package for your current platform
npm run dist:current
```

Output is in `dist/`. On macOS you get a `.dmg`. On Linux you get an `.AppImage`. On Windows you get an installer `.exe`.
