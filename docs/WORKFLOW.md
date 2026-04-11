# Workflow

## Development Cycle

The app has no compile step, so the development loop is fast:

```
edit renderer.js / note.html
  → Cmd+R in note window to reload renderer
  → verify change

edit main.js / preload.js
  → Ctrl+C to stop app
  → npm start
  → verify change
```

For major feature work, follow the pattern:
1. Open a feature branch: `git checkout -b feat/my-feature`
2. Make changes, test manually using the checklist in `docs/DEVELOPMENT.md`
3. Commit with conventional commit messages
4. Open a pull request using `.github/PULL_REQUEST_TEMPLATE.md`

## Git Conventions

**Branch naming:**
- `feat/<name>` — new features
- `fix/<name>` — bug fixes
- `docs/<name>` — documentation only
- `chore/<name>` — build, deps, config

**Commit format:** `<type>: <short description>`
```
feat: add search bar to filter notes by content
fix: restore notes.json when file is corrupted
docs: update API.md with new color endpoints
chore: bump electron to 37.4.0
```

## CI Pipeline

GitHub Actions runs on every push to `main`/`master` and on all pull requests.

Pipeline: `.github/workflows/ci.yml`

```
push/PR to main
  └─> ubuntu-latest
        └─> actions/setup-node@v4 (Node.js 20)
        └─> npm ci
        └─> npm test   (currently exits 1, no tests defined)
```

The `npm test` step will fail until tests are added. This is a known gap — see `docs/TODO.md`.

## Release Cycle

There is no fixed release cadence. Releases happen when:
- A meaningful new feature is complete
- A user-facing bug is fixed
- Dependencies need a security update

Release steps are in `docs/DEPLOYMENT.md`.

## Dependency Updates

Check for outdated dependencies with:
```bash
npm outdated
```

Electron updates are significant — new major versions may require testing on all three platforms before releasing. The `electron-builder` version should be kept compatible with the Electron version being used.

Security audits:
```bash
npm audit
npm audit fix   # fix auto-fixable issues
```

## Branch Protection

The `main` branch should have at minimum:
- Require PR reviews before merging (at least 1)
- Status checks must pass (`CI / test`)

Configure at: `https://github.com/sanchez314c/dark-sticky-notes/settings/branches`
