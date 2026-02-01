# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.0 | Yes |

## Security Model

Dark Sticky Notes is a local-only desktop application. There is no server component, no network requests, and no cloud storage. The attack surface is limited to:

1. **Local file access** — notes are read/written to `userData/notes.json` using Node's `fs` module in the main process only
2. **Renderer process isolation** — the renderer runs with `nodeIntegration: false` and `contextIsolation: true`; it has no direct file system or Node access
3. **IPC surface** — the renderer can only call the 8 methods exposed via `preload.js`'s `contextBridge.exposeInMainWorld`
4. **Electron version** — security depends on keeping Electron up to date; outdated Electron versions inherit Chromium CVEs

## Known Security Considerations

**Unsigned binaries:** The distributed builds are not code-signed (no Apple Developer or Windows EV certificate). Users must bypass OS security prompts on first launch. This does not affect runtime security but means the installer's authenticity cannot be verified by the OS.

**No input sanitization on note content:** Note content is stored as plain text and rendered in a `<textarea>`. There is no HTML injection risk from the textarea. If rich text is ever added (contenteditable), XSS considerations would need to be addressed.

**Drag-and-drop is blocked:** `dragover` and `drop` events are prevented in `renderer.js` to avoid unintended file loading behavior.

## Reporting a Vulnerability

**Do not create a public GitHub issue for security vulnerabilities.**

Report security issues to: [GitHub Security Advisories](https://github.com/sanchez314c/dark-sticky-notes/security/advisories)

Or email: the repository owner via the GitHub profile at [github.com/sanchez314c](https://github.com/sanchez314c)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix if you have one

Allow reasonable time (7-14 days) for a response before any public disclosure.

## Responsible Disclosure

Please:
- Give us time to fix the issue before public disclosure
- Do not access or modify other users' data
- Do not perform denial-of-service testing
- Respect user privacy
