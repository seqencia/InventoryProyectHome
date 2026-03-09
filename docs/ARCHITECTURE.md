# Architecture

## Process layers

```
┌─────────────────────────────────────────────────────┐
│  Renderer (React)  src/renderer/                    │
│  window.electron.* → IPC invoke                     │
├─────────────────────────────────────────────────────┤
│  Preload           src/main/preload.js              │
│  contextBridge — sole bridge between layers         │
├─────────────────────────────────────────────────────┤
│  Main process      src/main/main.js                 │
│  Electron lifecycle · TypeORM · IPC handlers        │
└─────────────────────────────────────────────────────┘
```

## Main process (`src/main/main.js`)

- Imports: `electron`, `path`, `fs`, `xlsx`, `typeorm`
- Defines all `EntitySchema` objects inline (no separate files)
- Initializes TypeORM `DataSource` with `synchronize: true` (auto-migrate on startup)
- Calls `runAutoBackup()` after DB init if auto-backup is enabled
- Registers all `ipcMain.handle` handlers inside `setupIpcHandlers()`
- `mainWindow` reference stored at module level for dialog calls

## Preload (`src/main/preload.js`)

Single `contextBridge.exposeInMainWorld('electron', { ... })` call.
Every namespace maps directly to IPC channel names.

Namespaces: `dashboard`, `products`, `categories`, `customers`, `suppliers`, `stockEntries`, `sales`, `returns`, `reports`, `backup`

## Renderer (`src/renderer/`)

- **Entry**: `index.js` → React root renders `<App />`
- **Bundle**: esbuild compiles JSX → `bundle.js` (never commit this)
- **Navigation shell**: `app.js` — `TABS` array + `useState('dashboard')` for active tab
- **Rule**: never `require()` or `import` Node/Electron modules in renderer files

### Component map

| File | Responsibility |
|---|---|
| `app.js` | Tab nav, global CSS injection (`GLOBAL_CSS`) |
| `DashboardView.js` | KPI cards, low-stock alerts, top products, recent sales |
| `InventoryView.js` | Product CRUD shell — state + layout |
| `ProductList.js` | Products table, low-stock highlight |
| `ProductForm.js` | Create/edit modal with all product fields |
| `StockEntriesView.js` | Stock entry CRUD with bonus quantity support |
| `SuppliersView.js` | Supplier CRUD |
| `CategoriesView.js` | Category CRUD |
| `CustomersView.js` | Customer CRUD |
| `NewSale.js` | Barcode scan, product search, cart, regalía, checkout |
| `SaleHistory.js` | Sales table, expandable detail rows, return modal |
| `SaleReceipt.js` | Print-ready receipt with regalía section |
| `ReportsView.js` | Date filters, KPI summary, charts, CSV/Excel export |
| `ConfigView.js` | Auto-backup toggle, export/import DB |

## Adding a new entity

1. Define `EntitySchema` in `main.js` and add to `DataSource.entities[]`
2. Add `ipcMain.handle` handlers in `setupIpcHandlers()`
3. Expose bridge in `preload.js`
4. Create renderer component and add tab in `app.js`

## IPC channels

All channels use `ipcMain.handle` / `ipcRenderer.invoke` pattern.

| Namespace | Channels |
|---|---|
| `products` | `getAll`, `create`, `update`, `delete` |
| `categories` | `getAll`, `create`, `update`, `delete` |
| `customers` | `getAll`, `create`, `update`, `delete` |
| `suppliers` | `getAll`, `create`, `update`, `delete` |
| `stockEntries` | `getAll`, `create` |
| `sales` | `getAll`, `create` |
| `returns` | `getAll`, `create` |
| `dashboard` | `getSummary` |
| `reports` | `getData`, `exportCSV`, `exportXLSX` |
| `backup` | `getInfo`, `setAutoBackup`, `export`, `import`, `restore`, `manualBackup` |
