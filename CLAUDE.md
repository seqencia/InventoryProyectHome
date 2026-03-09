# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavior

- Respond in **Spanish**; write code in **English**
- After each feature: `git add` (no node_modules), `git commit`, update `CHANGELOG.md`
- **Never push automatically** — only commit unless the user explicitly says to push
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`

## Commands

```bash
npm install            # install dependencies
npm start              # build renderer + launch Electron
npm run dev            # esbuild watch + Electron (active development)
npm run build:renderer # bundle only
```

## Stack

Electron 35 + React 19 (esbuild) + TypeORM 0.3 + SQLite. Single-user, offline-first desktop app for a tech/refurbished goods store.

- **Main** (`src/main/main.js`): Electron lifecycle, all `EntitySchema` definitions, all `ipcMain.handle` handlers. Plain JS — no build step.
- **Renderer** (`src/renderer/`): React JSX → `bundle.js` via esbuild. Never `require()` Node/Electron here. All DB access via `window.electron.*`.
- **Preload** (`src/main/preload.js`): sole `contextBridge` between layers.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for component map and IPC channel list.

## Database

TypeORM `EntitySchema`, `synchronize: true` (auto-migrate on startup), DB at `app.getPath('userData')/database.sqlite`.

To add an entity: define `EntitySchema` in `main.js` → add to `DataSource.entities[]` → add IPC handlers → expose in `preload.js`.

See [`docs/DATABASE.md`](docs/DATABASE.md) for all schemas and relationships.

## UI Rules

- **Inline styles only** — no CSS files, no Tailwind, no UI libraries
- Pseudo-class effects (hover/focus) → add a `className` from the global CSS sheet injected in `app.js`
- All UI text in **Spanish**
- Design: Windows 11 Fluent — `#0078d4` primary, `#f3f3f3` bg, frosted glass modals, pill tabs

See [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) for full token/class reference.

## Modules & Known Bugs

- [`docs/MODULES.md`](docs/MODULES.md) — what each tab/module does
- [`docs/BUGS.md`](docs/BUGS.md) — open bugs with fix guidance
