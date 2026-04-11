# Build & Compile

## Overview

Packaging is handled by `electron-builder` v26.0.12, configured entirely in the `build` section of `package.json`. There is no separate config file.

## Quick Build Commands

```bash
# Current platform only
npm run dist:current

# All platforms (requires mac/win/linux toolchains)
npm run dist

# Platform-specific
npm run dist:mac          # DMG + ZIP + PKG, x64 + arm64 + universal
npm run dist:win          # NSIS + MSI + ZIP + portable, x64 + ia32 + arm64
npm run dist:linux        # AppImage + DEB + RPM + Snap + tar.xz, x64 + arm64 + armv7l
```

Output lands in `dist/`.

## What Gets Packaged

The `build.files` array in `package.json` explicitly includes only:
```
main.js
renderer.js
preload.js
note.html
package.json
```

Everything else is excluded (`!**/*.md`, `!**/docs/**`, `!**/scripts/**`, `!**/test/**`, `!**/build-temp/**`, etc.). The result is a minimal ASAR with only the 4 source files and `package.json`.

## macOS Targets

| Target | Architectures | Output |
|---|---|---|
| DMG | x64, arm64, universal | `Dark Sticky Notes-<version>.dmg` |
| ZIP | x64, arm64, universal | `Dark Sticky Notes-<version>-mac.zip` |
| PKG | x64, arm64, universal | `Dark Sticky Notes-<version>.pkg` |
| MAS (App Store) | x64, arm64 | via `dist:mac:store` |

Icon: `resources/icon.icns`
App category: `public.app-category.productivity`
Hardened runtime: enabled

## Windows Targets

| Target | Architectures | Output |
|---|---|---|
| NSIS installer | x64, ia32, arm64 | `Dark Sticky Notes Setup <version>.exe` |
| MSI | x64, ia32, arm64 | `Dark Sticky Notes-<version>.msi` |
| ZIP | x64, ia32, arm64 | `Dark Sticky Notes-<version>-win.zip` |
| Portable | x64, ia32, arm64 | `Dark Sticky Notes <version>.exe` |

Icon: `resources/icon.ico`
NSIS config: one-click false, allows directory selection, creates Desktop + Start Menu shortcuts.

## Linux Targets

| Target | Architectures | Output |
|---|---|---|
| AppImage | x64, arm64, armv7l | `Dark Sticky Notes-<version>.AppImage` |
| DEB | x64, arm64, armv7l | `dark-sticky-notes_<version>_amd64.deb` |
| RPM | x64, arm64, armv7l | `dark-sticky-notes-<version>.x86_64.rpm` |
| Snap | x64, arm64 | `dark-sticky-notes_<version>_amd64.snap` |
| tar.xz | x64, arm64, armv7l | `dark-sticky-notes-<version>.tar.xz` |
| tar.gz | x64, arm64, armv7l | `dark-sticky-notes-<version>.tar.gz` |

Category: `Utility`
Snap grade: stable, confinement: strict, base: core20

Linux DEB dependencies (auto-installed by apt):
`libgtk-3-0`, `libnotify4`, `libnss3`, `libxss1`, `libxtst6`, `xdg-utils`, `libatspi2.0-0`, `libuuid1`, `libsecret-1-0`

## Build on Linux for All Platforms

Cross-platform building from Linux requires Wine for Windows targets:
```bash
# Install Wine (Debian/Ubuntu)
sudo apt install wine

# Then build all
npm run dist
```

macOS builds can only be produced on macOS (Apple's restriction on `codesign`). If you only need Linux and Windows packages, the `npm run dist:linux && npm run dist:win` commands work from any Linux host.

## Compression

`package.json` sets `"compression": "maximum"` — electron-builder uses 7-zip LZMA2 compression for the ASAR and package formats.

## Checking Build Size

```bash
npm run bloat-check
```

This runs `scripts/bloat-check.sh` which analyzes `node_modules` and `dist/` sizes, checks for duplicate packages, and reports optimization opportunities. The target is under 150MB per package.

## Build Temp Directory

`build-temp/` contains electron-builder's download cache (`electron-cache/`, `node-compile-cache/`) and intermediate unpacked directories. It is not committed to git and can be safely cleared if disk space is needed.

## Publishing

GitHub Releases publishing is configured in `package.json`:
```json
"publish": [{ "provider": "github", "owner": "sanchez314c", "repo": "dark-sticky-notes" }]
```

To publish: `npm run dist -- --publish=always` (requires `GH_TOKEN` environment variable).
