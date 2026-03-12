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

See [`docs/diagrams/ARCHITECTURE.md`](diagrams/ARCHITECTURE.md) for the Mermaid diagram.

## Main process (`src/main/main.js`)

- Imports: `electron`, `path`, `fs`, `crypto`, `xlsx`, `typeorm`
- Defines all `EntitySchema` objects inline (no separate files)
- Initializes TypeORM `DataSource` with `synchronize: true` (auto-migrate on startup)
- Calls `seedDefaultAdmin()` after DB init — creates `admin/admin` on first run
- Calls `runAutoBackup()` after seed if auto-backup is enabled
- Registers all `ipcMain.handle` handlers inside `setupIpcHandlers()`
- `mainWindow` reference stored at module level for dialog calls

## Preload (`src/main/preload.js`)

Single `contextBridge.exposeInMainWorld('electron', { ... })` call.
Every namespace maps directly to IPC channel names.

Namespaces: `dashboard`, `products`, `categories`, `customers`, `suppliers`, `stockEntries`, `sales`, `returns`, `reports`, `backup`, `auth`, `users`

## Renderer (`src/renderer/`)

- **Entry**: `index.js` → React root renders `<App />`
- **Bundle**: esbuild compiles JSX → `bundle.js` (never commit this)
- **Auth shell**: `app.js` — `currentUser` state; renders `<LoginScreen>` when null, otherwise renders tab shell
- **Navigation shell**: `app.js` — `ALL_TABS` array filtered by `currentUser.role`; `useState('dashboard')` for active tab
- **Rule**: never `require()` or `import` Node/Electron modules in renderer files

### Component map

| File | Responsibility |
|---|---|
| `app.js` | Auth state, tab nav, role-based tab filtering, global CSS injection |
| `LoginScreen.js` | Login form; calls `auth:login` IPC; stores session in parent state |
| `DashboardView.js` | KPI cards (hides profit for Vendedor), low-stock alerts, top products, recent sales |
| `InventoryView.js` | Product CRUD shell — state + layout (Admin only) |
| `ProductList.js` | Products table, low-stock highlight (Admin only) |
| `ProductForm.js` | Create/edit modal with all product fields (Admin only) |
| `StockEntriesView.js` | Stock entry CRUD; hides cost fields for Vendedor |
| `SuppliersView.js` | Supplier CRUD (Admin only) |
| `CategoriesView.js` | Category CRUD (Admin only) |
| `CustomersView.js` | Customer CRUD (Admin only) |
| `NewSale.js` | Barcode scan, product search, cart, regalía, checkout |
| `SaleHistory.js` | Sales table, expandable detail rows, return modal |
| `SaleReceipt.js` | Print-ready receipt with regalía section |
| `ReportsView.js` | Date filters, KPI summary, charts, CSV/Excel export (Admin only) |
| `ConfigView.js` | Auto-backup toggle, export/import DB; includes `UsersView` for Admin |
| `UsersView.js` | User CRUD (Admin only, rendered inside ConfigView) |

## Adding a new entity

1. Define `EntitySchema` in `main.js` and add to `DataSource.entities[]`
2. Add `ipcMain.handle` handlers in `setupIpcHandlers()`
3. Expose bridge in `preload.js`
4. Create renderer component and add tab in `app.js`

## IPC channels

All channels use `ipcMain.handle` / `ipcRenderer.invoke` pattern.

| Namespace | Channels |
|---|---|
| `auth` | `login` |
| `users` | `getAll`, `create`, `update`, `delete` |
| `products` | `getAll`, `create`, `update`, `delete`, `getBonificacionInfo`, `updateBonificacionPrice` |
| `categories` | `getAll`, `create`, `update`, `delete` |
| `customers` | `getAll`, `create`, `update`, `delete` |
| `suppliers` | `getAll`, `create`, `update`, `delete` |
| `stockEntries` | `getAll`, `create`, `updateBonificacion` |
| `sales` | `getAll`, `create`, `updateStatus` |
| `returns` | `getAll`, `create` |
| `dashboard` | `getSummary` |
| `reports` | `getData`, `exportCSV`, `exportXLSX` |
| `backup` | `getInfo`, `setAutoBackup`, `export`, `import`, `restore`, `manualBackup` |
