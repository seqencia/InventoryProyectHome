# Modules

## Dashboard (`DashboardView.js`)

Home screen. Loads all data via `dashboard:getSummary` in a single IPC call.

**Cards**:
- Ventas Hoy — count + sub-text
- Ingresos Hoy — net income (gross − today's returns); shows breakdown when returns exist
- Utilidad Hoy — estimated profit from cost prices
- Alertas de Stock Bajo — products where `stock ≤ min_stock`; click navigates to Catálogo
- Top 5 Más Vendidos — all-time ranked bar chart
- Ventas Recientes — last 5 sales; "Ver todas" navigates to Historial

---

## Catálogo (`InventoryView` + `ProductList` + `ProductForm`)

Full product master data CRUD.

**Fields**: name, SKU (auto-generated if blank), barcode, serial number, condition, status, `disponible_regalia`, cost price, sale price, offer price, category, location, description, technical notes.

**Rules**:
- New products start with `stock = 0`; stock is managed only via Entradas
- SKU auto-generated as `PRD-XXXXXX` (timestamp-based) if left blank
- Low-stock rows highlighted amber when `stock ≤ min_stock`
- `disponible_regalia = true` enables the "+ Regalía" button in Nueva Venta

---

## Entradas de Inventario (`StockEntriesView`)

Records incoming stock. Each entry increments `product.stock`.

**Fields**: product, purchased quantity, bonus quantity (gift units from supplier), unit cost (applies to purchased qty only), supplier, notes.

**Stock formula**: `stock += quantity + bonus_quantity`

**Display**: history table shows `+total` badge; when bonus > 0 shows "X compradas + Y bonificadas" breakdown.

---

## Proveedores (`SuppliersView`)

Simple CRUD for supplier master data. Supplier name is snapshotted in each stock entry at creation time.

---

## Nueva Venta (`NewSale` + `SaleReceipt`)

Two-column layout: product search panel (left) + cart panel (right).

**Product panel**:
- Barcode scanner input at top (Enter key triggers lookup, 2s feedback)
- Text search by name/category
- Each in-stock product shows: **"Agregar"** (normal price) and, if `disponible_regalia = true`, **"+ Regalía"** ($0.00)
- Same product can appear twice in cart as separate lines (normal + regalía)

**Cart**:
- Per-item quantity controls (+/−/remove)
- Regalía lines shown with purple "REGALÍA" badge and $0.00
- Breakdown: Subtotal (venta) / Regalías N uds $0.00 / IVA 13% / Total
- Optional customer selector (type-to-search)
- Payment method dropdown (Efectivo / Tarjeta / Transferencia)
- Confirm → saves sale in a transaction, decrements stock (including regalía items)

**Receipt** (`SaleReceipt`): frosted overlay modal; regular items + separate regalía section; `@media print` hides everything except `#sale-receipt`.

---

## Historial de Ventas (`SaleHistory`)

Paginated sales table with expandable detail rows.

**Columns**: #, Fecha, Cliente, Método, Estado, Productos, Total, actions.

**Status badges**: Completada (green), Cancelada (red), Pendiente (amber), Devuelta (purple), Parcial (orange). Sales with regalías show `+N reg.` pill.

**Regalía in detail view**: regalía items show "REGALÍA" badge and $0.00.

**Devoluciones**: "↩ Devolver" button on Completada/Parcial sales opens ReturnModal.
- Select items + quantities to return
- Required reason dropdown
- On confirm: restores stock, creates return record, updates sale status

**Ver Devoluciones** toggle: shows all returns table with expandable detail rows.

---

## Categorías (`CategoriesView`)

Simple CRUD. Category names are denormalized into products and stock entries.

---

## Clientes (`CustomersView`)

Simple CRUD (name, phone, email). Customer name is snapshotted in each sale.

---

## Reportes (`ReportsView`)

On-demand reports for a selected date range.

**Filters**: quick buttons (Hoy / Esta semana / Este mes / Este año) + custom date pickers.

**Sections**: Sales Summary (6 KPIs), By Payment Method (bars), By Category (table + bar), Top 10 Products (ranked table), Daily Sales (bar chart).

**Exports**: "Exportar Excel" (.xlsx, 4 sheets) + "Exportar CSV".

---

## Configuración (`ConfigView`)

Database backup management:
- **Export**: saves `database.sqlite` copy to user-chosen path via Electron save dialog
- **Save to backups folder**: saves to `userData/backups/backup-YYYY-MM-DD-<ts>.sqlite`
- **Import/Restore**: file picker + confirmation modal; destroys and reinitializes TypeORM DataSource for atomic replacement
- **Auto-backup toggle**: stored in `userData/config.json`; daily backup created on app start if no file exists for today
- Shows last auto-backup filename, date, and size
