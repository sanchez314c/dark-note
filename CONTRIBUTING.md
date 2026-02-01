# Contributing to Dark Sticky Notes

Contributions are welcome. This is a small, focused Electron app — keeping it simple is a feature.

## Getting Started

```bash
git clone https://github.com/sanchez314c/dark-sticky-notes.git
cd dark-sticky-notes
npm install
npm start
```

## How to Contribute

1. Open an issue first for significant changes — describe what you want to build and why
2. Fork the repository
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes
5. Test manually using the checklist below
6. Commit with a conventional commit message
7. Push and open a pull request using the template

## Manual Test Checklist

Before submitting a PR, verify:

- [ ] `npm start` — app launches, default note appears
- [ ] Create 2+ notes — each appears offset from the previous
- [ ] Type in a note, quit, relaunch — content restores
- [ ] Move and resize notes, quit, relaunch — positions restore
- [ ] All 7 color options change the note color and persist
- [ ] Pin (📌) keeps the window above other apps
- [ ] Cmd+N, Cmd+W, Cmd+T, Cmd+M, Cmd+S all work
- [ ] No errors in the terminal (main process) or Dev Tools console (renderer)

## Code Style

- 2-space indentation (enforced by `.editorconfig`)
- Vanilla JavaScript — no TypeScript, no build-time transpilation
- Function declarations for named functions, arrow functions for callbacks
- Keep IPC handlers thin — logic belongs in named functions, not inline lambdas
- No new `npm` dependencies without strong justification

## IPC Changes

Any feature that crosses the main/renderer boundary requires changes to three files: `main.js` (add `ipcMain.handle`), `preload.js` (expose via `contextBridge`), and `renderer.js` (call via `window.electronAPI`). See `docs/API.md` and `AGENTS.md` for the full pattern.

## Commit Format

```
feat: add font size slider to note footer
fix: use CmdOrCtrl for cross-platform menu accelerators
docs: add data migration section to DEPLOYMENT.md
chore: bump electron-builder to 26.1.0
```

## Reporting Issues

When reporting a bug, include:
- OS and version (e.g., Ubuntu 24.04, macOS 15.0, Windows 11)
- App version from `package.json`
- Steps to reproduce
- What you expected vs. what happened
- Terminal output if the app crashes

## License

By contributing, you agree your contributions will be licensed under MIT, the same as the project.
