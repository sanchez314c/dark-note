# Deployment

## Release Process

### 1. Prepare the Release

Update version in `package.json`:
```json
"version": "X.Y.Z"
```

Update `CHANGELOG.md` with a dated entry describing changes.

Update `VERSION_MAP.md` Active Version table.

Commit: `git commit -m "chore: bump version to X.Y.Z"`

Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`

### 2. Build Packages

From a macOS machine (required for universal macOS builds):
```bash
npm install
npm run dist
```

This produces packages in `dist/` for all three platforms. For Linux + Windows only, any platform works.

Verify output with:
```bash
npm run bloat-check
```

### 3. Publish to GitHub Releases

```bash
GH_TOKEN=<token> npm run dist -- --publish=always
```

Or manually:
1. Go to `https://github.com/sanchez314c/dark-sticky-notes/releases/new`
2. Choose the tag `vX.Y.Z`
3. Upload the built packages from `dist/`
4. Write release notes from `CHANGELOG.md`
5. Publish

### 4. Verify the Release

- Download the macOS DMG and test on Intel + Apple Silicon if available
- Download the Windows installer and verify it installs and launches
- Download the Linux AppImage: `chmod +x *.AppImage && ./Dark Sticky Notes-*.AppImage`
- Confirm note persistence works: create note, close, relaunch

## Distribution Formats by Use Case

| User Scenario | Recommended Format |
|---|---|
| macOS — personal install | DMG |
| macOS — deployment via MDM | PKG |
| macOS — App Store | MAS (requires Apple Developer account + code signing) |
| Windows — end user | NSIS installer (.exe) |
| Windows — enterprise/IT | MSI |
| Windows — no install | Portable .exe |
| Linux — Ubuntu/Debian | DEB |
| Linux — Fedora/RHEL | RPM |
| Linux — any distro | AppImage |

## Code Signing

The app currently ships **unsigned**. Users on macOS will see a Gatekeeper warning on first launch. To bypass: right-click → Open → Open.

To enable code signing, set in `package.json`:
```json
"mac": {
  "hardenedRuntime": true,
  "identity": "Developer ID Application: Name (TEAMID)"
}
```

And provide `CSC_LINK` (p12 path) + `CSC_KEY_PASSWORD` environment variables during build.

Windows code signing requires `WIN_CSC_LINK` + `WIN_CSC_KEY_PASSWORD`.

## Auto-Update

Auto-update is not currently implemented. The `electron-updater` package (part of electron-builder) can be added as a runtime dependency and wired into `main.js` to enable it. GitHub Releases serves as the update feed when `publish.provider = "github"`.

## Data Migration

There is no migration system. The `notes.json` schema has been stable since v1.0.0. If the schema changes in a future version, a migration function must be added to `loadSavedNotes()` in `main.js` to handle old data formats.

## Rollback

If a release has a critical bug:
1. Yank the GitHub Release (mark as pre-release or delete)
2. Users can download the previous release from GitHub Releases history
3. `notes.json` persists across versions — user data is not affected by downgrade
