# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                # install dependencies
npm start                  # build renderer + launch Electron
npm run build:renderer     # bundle React with esbuild only
npm run dev                # esbuild watch + Electron (for active development)
npx eslint .
npx prettier --write .
```

## Architecture

Electron desktop app with three layers:

- **Main process** (`src/main/main.js`): Electron lifecycle, TypeORM DataSource initialization, all IPC handlers. Plain JS (no build step needed).
- **Renderer process** (`src/renderer/`): React app. JSX bundled by esbuild into `bundle.js`. All DB access goes through `window.electron` — never import Node modules directly in renderer files.
- **Preload** (`src/main/preload.js`): contextBridge definition. The only place that bridges main ↔ renderer.

**Database**: TypeORM with SQLite using `EntitySchema` (plain JS, no decorators). Schemas defined inline in `main.js`. `synchronize: true` auto-migrates on startup. DB file stored in `app.getPath('userData')`.

**Adding a new entity**: define an `EntitySchema` in `main.js`, add it to the `DataSource` `entities` array, add IPC handlers, expose them in `preload.js`.

**Renderer structure**:

```
src/renderer/
  app.js               — navigation shell (3 tabs)
  components/
    InventoryView.js   — product CRUD state + layout
    ProductList.js     — table with low-stock highlights (≤5)
    ProductForm.js     — create/edit modal
    NewSale.js         — product search + cart + confirm
    SaleHistory.js     — sales table with expandable detail rows
```

**IPC channels** (all use `ipcMain.handle` / `ipcRenderer.invoke`):
| Channel | Description |
|---|---|
| `products:getAll` | sorted by name |
| `products:create` | |
| `products:update` | receives `{ id, ...fields }` |
| `products:delete` | |
| `sales:create` | receives `{ items }`, runs in transaction, decrements stock |
| `sales:getAll` | returns sales with embedded `details[]` array |

## Project Goal

Desktop inventory and sales management app for a tech/refurbished goods store.
Sells: refurbished computers, monitors, peripherals, accessories, office chairs.
Single user, offline-first (SQLite), no authentication needed for now.

## UI Conventions

- Spanish language for all UI labels and messages
- Inline styles (JS objects) — no CSS files or external UI libraries
- Low-stock threshold: stock ≤ 5 triggers yellow row highlight + red badge

## Key Config

- `package.json` `"main"`: `src/main/main.js` (plain JS entry, no compilation needed)
- esbuild input: `src/renderer/index.js` → output: `src/renderer/bundle.js`
- Prettier: single quotes, 2-space indent, semicolons, `trailingComma: "es5"`

## Git Workflow

After completing each feature or module, always run:
git add .
git commit -m "feat: [short description of what was built]"
Use conventional commits format: feat:, fix:, refactor:, docs:
Do NOT push automatically, only commit.
After completing each feature or module, always:

1. git add (only relevant files, never node_modules)
2. git commit -m "feat: [description]"
3. Update CHANGELOG.md with what was built
4. Do NOT push automatically, only commit.

## UI Design System

Style: Windows 11 Fluent Design - Clean and modern

Colors:

- Primary: #0078d4 (Windows blue)
- Success: #107c10 (green)
- Warning: #ff8c00 (orange)
- Danger: #d13438 (red)
- Text primary: #201f1e
- Text secondary: #605e5c
- Background: #f3f3f3
- Card: #ffffff

Design tokens:

- Border radius: 12px
- Font: Segoe UI
- Cards: white with subtle box-shadow
- Navbar: acrylic/frosted glass effect
- Active tab: pill-shaped indicator with #0078d4
- Inputs: bottom border focus animation (Fluent style)
- Buttons: outlined, rounded, hover fill effect
- Table rows: hover highlight #f5f5f5
- Status badges: soft colored backgrounds
