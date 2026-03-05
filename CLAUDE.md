# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run the Electron app (requires dist/ to exist for TypeScript entry point)
npm start

# Compile TypeScript (main process and database models)
npx tsc

# Lint
npx eslint .

# Format
npx prettier --write .
```

> Note: `package.json` scripts reference `react-scripts` (not installed) and `concurrently` (not installed). Use `npx tsc && npm start` to compile and launch instead of `npm run dev`.

## Architecture

This is an **Electron desktop app** combining:

- **Main process** (`src/main/`): Electron lifecycle, BrowserWindow creation. Written in JS (`main.js`) and TypeScript (`main.ts` — minimal, only `reflect-metadata` import).
- **Renderer process** (`src/renderer/`): React app served via `index.html` + `index.js` + `app.js`. Plain JavaScript/JSX (not compiled by TypeScript).
- **Database layer** (`src/database/`): TypeORM with SQLite. Models in TypeScript under `src/database/models/`. `synchronize: true` auto-migrates the schema on connection.

**Process boundary**: The preload script (`src/main/preload.js`) uses `contextBridge` to expose APIs from Node.js to the renderer. `contextIsolation: true` is enforced — Node APIs must be explicitly bridged through `window.electron`.

**TypeScript compilation**: `tsc` compiles `src/**/*.ts` → `dist/`. Electron's entry point is `dist/main/main.js` (per `package.json` `"main"` field), but the functional main process file is currently `src/main/main.js` (plain JS, copied/referenced directly).

**Database models** (in `src/database/models/`): `Product`, `Customer`, `Sale`, `SaleDetail`, `User`. Add new entities here using TypeORM decorators and register them in `src/database/index.js`.

## Key Config

- `tsconfig.json`: `experimentalDecorators` and `emitDecoratorMetadata` enabled (required by TypeORM). Output to `./dist`.
- `ormconfig.json`: SQLite at `./database.sqlite`, entities glob `src/database/models/**/*.ts`, `synchronize: true`.
- Prettier: single quotes, 2-space indent, semicolons, `trailingComma: "es5"`.
- ESLint: extends `eslint:recommended`, `plugin:react/recommended`, `plugin:prettier/recommended`.

## Project Goal

Desktop inventory and sales management app for a tech/refurbished goods store.
Sells: refurbished computers, monitors, peripherals, accessories, office chairs.
Single user, offline-first (SQLite), no authentication needed for now.

## Modules

- **Inventory**: Products with name, category, price, stock, low-stock alerts
- **Sales**: New sale (cart), sale history, simple receipt/ticket

## UI Conventions

- Framework: React (renderer process)
- Keep UI simple and functional — this is an internal tool
- Spanish language for all UI labels and messages
- Use window.electron (contextBridge) for all Node/DB calls from renderer

## Development Notes

- Always bridge DB calls through preload.js via contextBridge
- Models already exist: Product, Customer, Sale, SaleDetail, User
- Focus on Product and Sale models first
