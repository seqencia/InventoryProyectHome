# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [0.6.0] - 2026-03-05

### Added

#### Dashboard
- `dashboard:getSummary` IPC handler aggregates all metrics in a single call: loads sales, sale details, and products in parallel, then computes everything in JS
- **Ventas Hoy** stat card: count of today's sales with average per sale
- **Ingresos Hoy** stat card: total revenue for today
- **Alertas de Stock Bajo** card: products with stock ≤ 5 sorted by stock ascending; shows "Sin stock" badge in red, low stock in amber; clicking navigates to Inventario; green confirmation when all stock is healthy
- **Top 5 Más Vendidos** card: aggregates all-time quantity sold per product from `sale_details`, ranked list with proportional bar visualization
- **Ventas Recientes** card: last 5 sales with date, customer, and total; "Ver todas →" link navigates to Historial
- Skeleton loading state while data is fetched
- Dashboard added as the first tab and default home screen

---

## [0.5.0] - 2026-03-05

### Added

#### Customers module
- `customers` table in SQLite (`name` required; `phone`, `email` optional)
- IPC handlers: `customers:getAll`, `customers:create`, `customers:update`, `customers:delete`
- `CustomersView` screen with full CRUD: table with name, phone, and email columns; inline create/edit modal; delete with confirmation
- "Clientes" tab added to main navigation

#### Customer integration in sales
- `sales` table extended with nullable `customer_id` and `customer_name` columns (auto-migrated via `synchronize: true`)
- Optional customer selector in the Nueva Venta cart panel: type to search by name or phone, results dropdown limited to 5 matches, selected customer shown as a dismissible pill
- Customer name snapshotted at sale time (`customer_name` stored in the sale record)
- Customer name displayed in the sale receipt when present
- "Cliente" column added to the Historial de Ventas table

---

## [0.4.0] - 2026-03-04

### Added

#### Receipt / Print
- `SaleReceipt` modal shown immediately after a sale is confirmed
- Receipt displays store name (TechStore), sale number, date, itemized product list with quantity, unit price, and subtotal per row, and grand total
- **Print** button triggers `window.print()`; `@media print` CSS hides all UI and renders only the receipt full-width with no decorations
- Closing the receipt navigates automatically to sales history

---

## [0.3.0] - 2026-03-04

### Added

#### Categories module
- `categories` table in SQLite (`name` unique, `description` nullable)
- IPC handlers: `categories:getAll`, `categories:create`, `categories:update`, `categories:delete`
- `CategoriesView` screen with full CRUD: table list, inline create/edit modal, delete with confirmation
- "Categorías" tab added to main navigation
- `ProductForm` category field replaced from a hardcoded static list to a dynamic dropdown loaded from the categories table via `window.electron.categories.getAll()`
- Hint displayed in `ProductForm` when no categories exist yet, directing the user to the Categories tab

---

## [0.2.0] - 2026-03-04

### Added

#### Sales module
- `sales` table in SQLite (`total`, `created_at`)
- `sale_details` table in SQLite (`sale_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal`); product name and price are snapshotted at sale time
- IPC handlers: `sales:create` (runs in a transaction, decrements product stock atomically), `sales:getAll` (returns sales with embedded `details[]` array)
- **Nueva Venta** screen: two-column layout with real-time product search filtered by name/category, cart panel with quantity +/− controls, available stock shown per product (deducting cart quantity), and grand total
- Confirm button disabled when cart is empty; shows "Procesando..." while saving
- **Historial** screen: table of all sales sorted by date descending, expandable rows showing itemized sale details
- "Nueva Venta" and "Historial" tabs added to main navigation
- App shell refactored to tab-based navigation; inventory logic extracted to `InventoryView`

---

## [0.1.0] - 2026-03-04

### Added

#### Project setup
- Electron 35 desktop app with React 19 renderer and TypeScript support
- SQLite database via TypeORM 0.3 using `EntitySchema` (plain JS, no decorator compilation required)
- `synchronize: true` auto-migrates schema on startup; DB stored in `app.getPath('userData')`
- esbuild bundler for the React renderer (`src/renderer/index.js` → `src/renderer/bundle.js`)
- `contextIsolation: true` enforced; all Node/DB calls bridged through `preload.js` via `contextBridge`
- ESLint + Prettier configured

#### Inventory module
- `products` table in SQLite (`name`, `description`, `category`, `price`, `stock`, `created_at`, `updated_at`)
- IPC handlers: `products:getAll`, `products:create`, `products:update`, `products:delete`
- **Inventario** screen: product table with columns name, category, description, price, stock, and actions
- Rows highlighted in amber when stock ≤ 5; red badge with "Stock bajo" label
- Create/edit product modal with fields: name (required), category (dropdown), price (required), stock (required), description
- Delete with confirmation dialog
