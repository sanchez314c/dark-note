# Product Requirements Document

## Product Overview

**Name:** Dark Sticky Notes (package: dark-sticky-notes)
**Type:** Cross-platform desktop application
**Platform:** macOS, Windows, Linux (via Electron)
**Version:** 1.0.0
**Status:** Stable, production-ready

## Problem Statement

Users need a lightweight, always-available way to keep short notes visible on their desktop while working. Existing sticky note solutions are either OS-specific (macOS Stickies, Windows Sticky Notes), require cloud accounts, or ship with bloated feature sets that make simple note-taking slow and complex.

## Goals

1. Let users create and manage multiple floating notes on their desktop
2. Notes persist automatically without any user action
3. Notes restore exactly as left (position, size, color, content) on every launch
4. App works identically on macOS, Windows, and Linux
5. Zero configuration required — works out of the box

## Non-Goals

- Cloud sync or cross-device sharing
- Rich text editing (bold, italic, lists, images)
- Note search or filtering
- Folders or tagging
- Reminders or notifications
- Collaboration or sharing

## Core Features (Implemented)

### Multi-Note Management
- Create unlimited notes via ➕ button or Cmd+N
- Each note is an independent resizable, moveable window
- New notes cascade with 30px offset to avoid stacking
- Close individual notes with ✕ or Cmd+W

### Persistence
- Notes auto-save content 1 second after typing stops
- Position saves immediately on window move
- Size saves immediately on window resize
- All notes restore on next app launch from `notes.json` in userData

### Color Customization
- 7 preset colors: yellow (#ffeb3b), orange (#ff9800), green (#4caf50), blue (#2196f3), pink (#e91e63), purple (#9c27b0), white (#ffffff)
- Color persists per note
- Text color auto-adjusts to maintain contrast (dark text on light colors, light text on dark colors)

### Window Controls
- Always-on-top toggle (pin) per note
- Minimize per note
- Native OS drag via header bar
- Corner resize handle

### Keyboard Shortcuts
- Cmd+N: new note
- Cmd+W: close current note
- Cmd+S: force save
- Cmd+M: minimize
- Cmd+T: toggle pin

## User Stories

**As a developer**, I want a note to stay pinned above my editor while I read requirements, so I don't have to switch windows.

**As a writer**, I want multiple notes with different colors for different projects, so I can visually separate my work.

**As a general user**, I want my notes to be there when I turn on my computer, exactly where I left them, without doing anything.

## Technical Constraints

- Must use Electron for cross-platform compatibility
- No cloud dependencies — all data local
- Renderer must run with `nodeIntegration: false` and `contextIsolation: true` for security
- Package size target: under 150MB per platform package
- Memory target: under 200MB RAM for a typical 5-note session

## Success Criteria

- App starts in under 3 seconds on mid-range hardware
- Notes survive app restart with 100% fidelity (position, size, color, content)
- Build produces working packages on all 3 platforms
- Memory usage stays under 500MB with 10+ open notes

## Future Considerations (Not Planned)

These are mentioned in the `docs/TODO.md` backlog:
- Rich text formatting
- Cloud sync
- Note search
- Import/export (PDF, TXT)
- Themes beyond the 7 color presets
- Font size controls in the UI
- Attachments or images in notes
