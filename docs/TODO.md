# TODO

## Known Issues

- **CI test step always fails** — `package.json` has `"test": "echo \"Error: no test specified\" && exit 1"`. The GitHub Actions workflow runs `npm test`, causing CI to show a failure. Either add a real test or update the test script to `exit 0` until tests are written.

- **`before-quit` save race condition** — `saveAllNotes()` sends IPC to renderers asking them to flush, but there's no guarantee the renderer's write completes before the main process terminates. In practice it works, but it's not atomic. See `docs/LEARNINGS.md` for details.

- **Windows keyboard shortcuts use Cmd key** — The menu in `main.js` uses `Cmd+N`, `Cmd+S`, etc. These should be `CmdOrCtrl` for cross-platform behavior. `CmdOrCtrl` maps to Cmd on macOS and Ctrl on Windows/Linux.

- **No data migration path** — If the `notes.json` schema changes in a future version, old data won't be upgraded automatically. A migration function is needed in `loadSavedNotes()`.

## Planned Features

### Small Improvements
- [ ] Font size control in the note UI (currently hardcoded to 14px, stored in schema but not exposed)
- [ ] `CmdOrCtrl` instead of `Cmd` for menu accelerators (cross-platform keyboard shortcuts)
- [ ] Configurable auto-save interval (currently hardcoded 1000ms)
- [ ] Visual indicator when a note is saving

### Medium Features
- [ ] Add automated tests (at minimum: store read/write, IPC handler smoke tests)
- [ ] Search bar to filter/highlight note content across all open notes
- [ ] Note title field (separate from content, used as window title)
- [ ] Export individual notes as `.txt` files

### Large Features
- [ ] Rich text formatting (bold, italic, bullet lists) via contenteditable or a minimal editor
- [ ] Cloud sync support (one-way export/import to a user-chosen file path or directory)
- [ ] Import from macOS Stickies or Windows Sticky Notes
- [ ] Reminder/alert system tied to note content

## Tech Debt

- **No test suite** — The codebase has zero automated tests. Manual testing is the only validation. Priority: Medium.

- **Synchronous file I/O** — `store.get()` and `store.set()` use `fs.readFileSync` / `fs.writeFileSync`. For a notes app with small data this is fine, but it blocks the main process on every read/write. Could be converted to async with `fs.promises` with some refactoring.

- **`docs/CODE_OF_CONDUCT.md` was a duplicate** — Archived to `archive/`. Only the root `CODE_OF_CONDUCT.md` is canonical.

- **AGENTS.md / CLAUDE.md are identical** — Both files contain the same project context. `AGENTS.md` could be differentiated to be a lighter agent-facing reference, but both are accurate as-is.

- **`package.json` copyright year** — Updated to `2026`.

## Dependencies to Watch

- **electron v37.4.0** — Pin to this version. Electron major upgrades often require API changes and should be tested across all platforms before releasing.
- **electron-builder v26.0.12** — Keep in sync with Electron version. Check release notes before upgrading.
- **uuid v11.1.0** — Stable, minimal dependency. No urgent need to upgrade.
