# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [0.23.0] - 2026-03-09

### Added

#### Ver Ticket y Exportar PDF desde Historial de Ventas

**Historial de Ventas** (`SaleHistory.js`):
- Nuevo botón **🧾 Ver Ticket** en la columna de acciones de cada venta
- Abre el `SaleReceipt` con los datos reconstruidos desde el snapshot de `sale_details`:
  - `unit_price` → precio efectivo + `discount_amount` (precio original antes de descuento)
  - `line_discount_mode: 'amount'`, `line_discount_value: discount_amount` (del detalle)
  - `subtotalBruto`, `totalDescuentos`, `globalDiscountAmount` (de `sale.global_discount`), `subtotalNeto`, `tax`, `total` reconstruidos desde campos almacenados

**Ticket/Recibo** (`SaleReceipt.js`):
- Nuevo botón **📄 Exportar PDF** (azul) junto a 🖨 Imprimir
- Ambos usan `window.print()` con el CSS de impresión ya definido; en el diálogo del sistema se puede seleccionar "Guardar como PDF"

---

## [0.22.0] - 2026-03-09

### Added

#### Modal de confirmación antes de finalizar venta

Al hacer clic en "Confirmar Venta" se abre un modal de revisión antes de procesar:

- **Tabla de ítems**: Producto · Cant · P.Unit · Desc · Subtotal (con badge 🎁/📦 para regalías)
- **Desglose de totales**: Subtotal bruto → Descuentos → Subtotal neto → Regalías propias / Bonif. proveedor → IVA 13% → **Total** destacado en azul
- **Método de pago** y **cliente** (si aplica) en tarjetas de resumen
- **Cancelar** — cierra el modal y vuelve al carrito sin cambios
- **Confirmar Venta** — ejecuta la venta; si falla muestra el error dentro del modal sin cerrarlo

---

## [0.21.0] - 2026-03-08

### Added

#### Distinción Regalía propia / Bonificación proveedor

**Nueva Venta — listado de productos**:
- Cuando `disponible_regalia = true`, se muestran **dos botones** en lugar de uno:
  - 🎁 **Regalía** (morado) — costo absorbido por el negocio
  - 📦 **Bonif.** (azul) — regalo del proveedor, sin costo para el negocio

**Carrito**:
- Badge diferenciado: `🎁 REGALÍA` (fondo lila) vs `📦 BONIF.` (fondo azul claro)
- Fondo del ítem también diferenciado por tipo
- Desglose de totales separado: "🎁 Regalías propias (N uds)" y "📦 Bonif. proveedor (N uds)"

**Ticket / Recibo** (`SaleReceipt.js`):
- Secciones separadas en la lista de ítems para cada tipo
- Totales: "🎁 Regalías propias $0.00" y "📦 Bonif. proveedor $0.00"

**Backend** (`main.js`):
- `sale_details`: nuevo campo `regalia_type` (`'propia'` | `'bonificacion'` | null)
- `sales:create`: **regalía propia resta costo del profit**; bonificación no afecta profit
- `reports:getData`: summary incluye `regaliaCost`, `regaliaPropiaCount`, `bonificacionCount`; `topProducts.profit` usa snapshot `cost_price` del detalle y distingue por tipo
- `dashboard:getSummary`: incluye `todayRegaliaCost` (costo de regalías propias del día)

**Bugfix**: corregido el call a `<SaleReceipt>` que no pasaba las props de descuentos (`subtotalBruto`, `totalDescuentos`, `globalDiscountAmount`, `subtotalNeto`)

---

## [0.20.0] - 2026-03-08

### Added

#### Descuentos en Nueva Venta

**Descuento por línea** (por cada producto en el carrito):
- Toggle $/% para elegir el modo: monto fijo o porcentaje
- Input de valor de descuento con preview `→ $X.XX/ud` cuando hay descuento activo
- Precio efectivo = `precio_unit − descuento_linea`; subtotal de línea usa precio efectivo

**Descuento global** (aplicado sobre el subtotal post-línea):
- Toggle $/% + input de valor global
- `globalDiscAmount` se envía al IPC `sales:create` como 6.° argumento
- Capped automáticamente para que el total nunca sea negativo

**Desglose de totales en el carrito**:
- Subtotal bruto → Descuentos (−) → Subtotal neto → Regalías → IVA 13% → **Total**

**Ticket/Recibo actualizado** (`SaleReceipt.js`):
- Cada línea muestra sub-fila de descuento cuando aplica (`Desc. X% / $X.XX/ud → −$Y.YY`)
- Sección de totales desglosa: Subtotal bruto, Desc. por línea, Desc. global, Subtotal neto, IVA, Total

**Backend** (`main.js`):
- `Sale` — nuevo campo `global_discount decimal(16,6)`
- `sales:create` — acepta `globalDiscountAmount`; calcula `subtotalNeto = lineSubtotal − globalDiscount`; profit sigue basado en `precio_costo`

**Preload** (`preload.js`): `sales.create` acepta 6.° param `globalDiscountAmount`

---

## [0.19.0] - 2026-03-08

### Added

#### Product pricing model — extended fields (6 decimal places)

**New columns in `products` table** (`decimal(16,6)`):
- `precio_costo` — cost price
- `precio_venta_sin_iva` — base sale price without IVA
- `precio_venta_con_iva` — auto-computed: `sin_iva × 1.13`; stored on save
- `descuento_monto` — fixed discount amount (default 0)
- `descuento_porcentaje` — discount percentage (default 0)
- `precio_neto` — auto-computed: `sin_iva × (1 − %/100) − monto`; stored on save; used as effective sale price in Nueva Venta
- `utilidad` — auto-computed: `precio_neto − precio_costo`; stored on save

Legacy fields (`cost_price`, `sale_price`, `offer_price`) are kept in DB for backward compatibility and synced automatically from the new fields on each save. `computePricing()` helper function in `main.js` handles all derived field calculations.

**ProductForm — Precios section redesigned**:
- Row 1: Precio de costo | Precio venta s/IVA (required) | Precio venta c/IVA (readonly auto)
- Row 2: Descuento monto | Descuento % | Precio neto (readonly auto, blue) | Utilidad (readonly auto, green/red)
- All auto fields update live as the user types; displayed to 2 decimals in UI, stored to 6 decimals in DB

#### SaleDetail pricing snapshot

**New columns in `sale_details` table** (`decimal(16,6)`, nullable, set at sale creation time):
- `cost_price` — snapshot of `producto.precio_costo` (or `cost_price`) at sale time
- `discount_amount` — per-unit discount (`precio_venta_sin_iva − unit_price`)
- `discount_percentage` — snapshot of `producto.descuento_porcentaje`
- `iva_amount` — `subtotal × 0.13` per line (0 for regalías)
- `line_total` — `subtotal + iva_amount` per line (0 for regalías)

All snapshot fields are written once at sale creation and never recalculated — historical financial reports always read stored values.

### Changed
- `sales:create` (main.js): populates all new SaleDetail snapshot fields; profit calculation now prefers `precio_costo` over legacy `cost_price`
- `NewSale.js` `addToCart`: effective price priority is `precio_neto → offer_price → sale_price`; cart items carry `discount_amount` and `discount_percentage` for snapshot
- `NewSale.js` product list: discount display reads `precio_neto` vs `precio_venta_sin_iva` (fallback to `offer_price` vs `sale_price` for legacy products)
- `docs/DATABASE.md`: updated Product and SaleDetail schemas with all new fields and immutability note

---

## [0.18.0] - 2026-03-08

### Fixed

#### QA review — 5 bugs fixed

**BUG-001/002 (Critical) — Devolución duplicada sin validación**
- `returns:create` (main.js): carga devoluciones previas por `sale_id`, construye mapa `alreadyReturnedMap` sumando `ReturnDetail` existentes, valida que cada item solicitado no exceda `original_qty − already_returned`. `isPartial` ahora considera el total acumulado de todas las devoluciones (previas + actual).
- `SaleHistory.js`: nueva función `getAlreadyReturned(saleId)` que suma quantities ya devueltas por `product_id` desde el estado `returns`. `canReturn(sale)` verifica que quede al menos un item con saldo > 0 (antes sólo chequeaba el status). `ReturnModal` recibe prop `alreadyReturned`; items completamente devueltos aparecen grises/deshabilitados con badge "Ya devuelto"; el `max` del input se limita a `original_qty − already`; items parcialmente devueltos muestran cuántas unidades ya se devolvieron.

**BUG-006 (High) — sales:create no valida existencia de producto**
- `sales:create` (main.js): después de construir `productMap`, verifica que todos los `product_id` del carrito existan en DB; lanza error descriptivo si alguno fue eliminado entre que se agregó al carrito y se confirmó la venta.

**BUG-029 (Low) — Entrada de stock con total 0 permitida**
- `StockEntriesView.js`: validación en `handleSubmit` que bloquea el envío si `totalQty <= 0`; muestra mensaje de error inline antes del footer del modal.

**BUG-033 (Medium) — Precio de venta $0.00 aceptado**
- `ProductForm.js`: `min="0"` → `min="0.01"` en el input de precio de venta para impedir productos con precio cero.

---

## [0.17.0] - 2026-03-08

### Added

#### Documentation reorganization
- Created `docs/` folder with modular reference files:
  - `docs/ARCHITECTURE.md` — process layers diagram, component map, IPC channels, entity guide
  - `docs/DATABASE.md` — all schemas with columns/types/notes, relationships diagram, config file info
  - `docs/MODULES.md` — description of every tab/module (Dashboard through Configuración)
  - `docs/DESIGN-SYSTEM.md` — color tokens, badge palette, typography, layout, global CSS classes, button variants, modal patterns
  - `docs/BUGS.md` — open bug tracker (BUG-001: same sale can be returned multiple times)
- Rewrote `CLAUDE.md` to be concise (~50 lines): behavior instructions, stack summary, references to each `docs/` file instead of inline content

---

## [0.16.2] - 2026-03-08

### Changed

#### Regalía — controlled per product
- `disponible_regalia` boolean column added to `ProductSchema` (nullable, default false)
- `ProductForm`: checkbox "¿Disponible como regalía?" in Condición y Estado section with description hint
- `NewSale` product list: "+ Regalía" button only shown when `product.disponible_regalia === true`; "Agregar" always visible for in-stock products

---

## [0.16.1] - 2026-03-08

### Changed

#### Nueva Venta — Regalía flow redesign
- Removed Regalía checkbox from cart items
- Product list now shows two buttons per in-stock product: **"Agregar"** (normal price) and **"+ Regalía"** ($0.00)
- Each button adds the product as a separate cart line: same product can appear twice — one normal, one regalía
- Cart key changed to `product_id + type` so both lines coexist independently
- `setQty` now takes `(productId, isRegalia, qty)` to update the correct line
- Stock cap enforced across both lines: sum of normal + regalía qty cannot exceed available stock

---

## [0.16.0] - 2026-03-08

### Added

#### Stock Entries — Bonus/Gift quantity
- New `bonus_quantity` field in `StockEntrySchema` (nullable, default 0)
- Form: "Cantidad comprada" + "Cantidad bonificada" (optional); live preview "Total a ingresar: N unidades (X compradas + Y bonificadas)"
- Unit cost hint clarifies it applies only over purchased quantity when bonus > 0
- `stockEntries:create` handler increments stock by `quantity + bonus_quantity`
- History table "Ingresado" column shows `+total` badge; when bonus > 0 shows breakdown "X compradas + Y bonificadas" below the badge

#### Nueva Venta — Regalía products
- New `is_regalia` field on `SaleDetailSchema` (nullable boolean, default false) and `regalia_count` on `SaleSchema`
- Per cart item "Regalía" checkbox: when checked, price locks to $0.00, background tints purple, "REGALÍA" badge appears on product name
- Subtotal and IVA 13% computed only over non-regalía items; regalía items still decrement stock normally
- Cart breakdown shows "Subtotal (venta)" + "Regalías (N uds) $0.00" + "IVA (13%)" + "Total"
- `sales:create` handler separates items, computes subtotal/tax/profit from regular items only, saves `is_regalia` and `regalia_count`
- **SaleReceipt**: regular and regalía items shown in separate sections; regalía items display "REGALÍA" label and $0.00; receipt breakdown includes "Subtotal (venta)", "Regalías $0.00", "IVA (13%)", "Total"
- **SaleHistory**: regalía items show "REGALÍA" badge and $0.00 in detail view; sales with regalías show `+N reg.` pill next to status badge

---

## [0.15.0] - 2026-03-08

### Added

#### Excel export for Reports module
- **"Exportar Excel" button** in the Reportes header (visible after generating a report)
- Uses `xlsx` npm package to generate a `.xlsx` workbook with 4 sheets:
  - **Resumen**: 6 KPIs — total ventas, ingreso bruto, IVA, devoluciones, ingreso neto, utilidad
  - **Por Categoría**: categoría, unidades vendidas, ingresos
  - **Top 10 Productos**: rank, nombre, unidades, ingresos, utilidad
  - **Ventas Diarias**: fecha, número de ventas, total
- Column widths configured per sheet for readability
- File saved via Electron `dialog.showSaveDialog` with default name `reporte-{from}_{to}.xlsx`
- `reports:exportXLSX` IPC handler in `main.js`; `preload.js` bridge updated

---

## [0.14.0] - 2026-03-08

### Added

#### Reports (Reportes) module — new tab 📈
- **Date filters**: quick buttons (Hoy / Esta semana / Este mes / Este año) + custom date-range pickers; active quick filter highlighted; custom input clears quick selection
- **Sales Summary card**: 6 KPIs in a horizontal grid — total ventas, ingreso bruto, IVA recaudado (13%), devoluciones, ingreso neto, utilidad estimada; each with colored top-border accent
- **By payment method**: bar progress chart per method (Efectivo / Tarjeta / Transferencia) with amount, percentage, and count
- **By category**: table with units sold, total income, and proportional inline bar
- **Top 10 products**: ranked table with units sold badge, total income, and estimated profit; profit shown only when cost price is known
- **Daily sales chart**: scrollable bar chart with gradient bars; auto-adjusts bar width by day count; dates rotate when >15 days; hover tooltip with date/count/total
- **Export CSV**: saves UTF-8 BOM CSV (Excel-compatible) via Electron save dialog; sections for Resumen, Por método, Por categoría, Top 10, Ventas diarias
- IPC handlers: `reports:getData` (aggregates sales, details, products, returns in range), `reports:exportCSV` (writes file via dialog)
- `preload.js` exposes `reports: { getData, exportCSV }` bridge

---

## [0.13.0] - 2026-03-08

### Added

#### Database Backup module — new "Configuración" tab (⚙️)
- **Export backup**: opens Electron save dialog; copies `database.sqlite` to user-selected path with default filename `backup-YYYY-MM-DD.sqlite`
- **Save to backups folder**: copies the DB to `<userData>/backups/backup-YYYY-MM-DD-<timestamp>.sqlite` without a file picker
- **Import / Restore**: opens file picker for `.sqlite` files; shows a confirmation warning modal before replacing the live database; performs atomic replace by destroying and reinitializing the TypeORM DataSource
- **Auto-backup**: toggle stored in `<userData>/config.json`; when enabled, creates a daily backup at startup in `<userData>/backups/` (skips if today's backup already exists)
- **Last backup info**: shows filename, formatted date, and file size of the most recent automatic backup
- `ConfigView.js`: Fluent Design card layout with toggle switch, status alerts, and confirmation modal
- IPC handlers: `backup:getInfo`, `backup:setAutoBackup`, `backup:export`, `backup:import`, `backup:restore`, `backup:manualBackup`
- `preload.js` exposes full `backup` bridge

---

## [0.12.0] - 2026-03-08

### Added

#### Returns (Devoluciones) module
- **`returns` and `return_details` tables** in SQLite: `sale_id`, `reason`, `notes`, `total_refunded`, `is_partial`, `created_at` (return); `return_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal` (detail)
- **`returns:create` IPC handler**: runs in a transaction — creates return record, creates per-item return details, increments product stock atomically, updates sale status to `Devuelta` (full) or `Parcial` (partial)
- **`returns:getAll` IPC handler**: returns all returns with embedded `details[]` array, sorted by date descending
- **ReturnModal** in `SaleHistory.js`: per-item checkbox selection with quantity control (capped to original qty), required reason dropdown (Producto defectuoso, Error en venta, Cliente arrepentido, Otro), optional notes textarea, refund preview total shown in purple before confirming
- **"↩ Devolver" button** on `Completada` and `Parcial` sales in the history table
- **Status badges** for `Devuelta` (purple `#f3e5f5/#6a1b9a`) and `Parcial` (orange `#fff3e0/#e65100`) added to `STATUS_STYLE`
- **"Ver Devoluciones" section** toggle button in the Historial toolbar (visible only when returns exist); table shows #, date, sale #, reason, type badge, refund total, expandable detail rows with notes
- **Dashboard Ingresos Hoy** card now shows net income (gross − returns); sub-text shows breakdown when returns exist today

### Changed
- `preload.js` exposes `returns: { create, getAll }` bridge
- `dashboard:getSummary` now fetches `Return` records and returns `todayReturnCount` and `todayReturnTotal`

---

## [0.11.0] - 2026-03-07

### Changed

#### Full UI redesign — Windows 11 Fluent Design
- **Global CSS** injected in `app.js`: Segoe UI font, hover/focus effects for buttons (`.fl-btn-primary/secondary/ghost/danger`), table row hover (`.fl-tr`, `.fl-tr-amber`), product row hover (`.fl-product-row`), input/select focus ring in Windows blue (`.fl-input`, `.fl-select`)
- **Navbar**: frosted glass acrylic effect (`rgba(255,255,255,0.85)` + `backdrop-filter: blur(20px)`), sticky top position, pill-shaped active tab in `#0078d4` (Windows blue), emoji icons next to each tab label, title updated to "TechStore"
- **Cards**: 12px border radius, soft shadow `0 2px 8px rgba(0,0,0,0.07)` across all panels and wrappers
- **Tables**: uppercase 11px column headers (`#9e9e9e`), row hover via CSS class, tighter border colors (`#f5f5f5` separator)
- **Badges**: softened palette — green `#e8f5e9/#2e7d32`, blue `#e3f2fd/#1565c0`, amber `#fff8e1/#8a5700`, red `#ffebee/#a4262c`, purple `#ede7f6/#6a1b9a`; replaces all harsh Tailwind-era colors
- **Buttons**: Primary uses `#0078d4` (Windows blue) with hover `#106ebe` and drop shadow; secondary outlined with hover fill; danger outlined with hover fill; all with 8px radius
- **Modal overlays**: frosted glass backdrop (`rgba(0,0,0,0.4)` + `blur(8px)`) across all modals (ProductForm, CategoryModal, CustomerModal, SupplierModal, StockEntryModal, SaleReceipt)
- **ProductForm**: Fluent inputs with `.fl-input` focus ring, section headings refined to uppercase labels
- **NewSale**: panels updated to 12px radius, cart totals in Windows blue, confirm button in `#107c10`, product row hover
- **SaleReceipt**: frosted overlay, refined print/close buttons
- **DashboardView**: stat cards retain colored top border accent; bar chart uses `#0078d4`/`#a8d0f0`; recent sales total in blue
- Page background: `#f3f3f3` (Windows 11 system gray)

---

## [0.10.0] - 2026-03-07

### Added

#### Barcode scanner support
- **ProductForm (Catálogo)**: barcode input captures scanner input (keyboard wedge); pressing Enter moves focus to the Número de serie field instead of submitting the form; barcode label shows a small scanner icon
- **Nueva Venta — barcode lookup**: dedicated barcode input at the top of the product panel; pressing Enter (or scanner trigger) finds the product by exact barcode match and adds it to the cart; displays a 2-second inline feedback message (green on success, red if not found or out of stock); input clears and re-focuses automatically after each scan
- Scanner icon (inline SVG barcode pattern) shown next to both barcode fields

---

## [0.9.0] - 2026-03-05

### Added

#### Catálogo module (replaces Inventario tab)
- Product master data CRUD: Nombre, SKU, Código de barras, Número de serie, Condición, Estado, Precios, Categoría, Ubicación, Descripción, Notas técnicas
- Stock is no longer editable in the form — managed exclusively via Entradas de Inventario
- New products start with `stock = 0` automatically

#### Entradas de Inventario module
- `stock_entries` table: `product_id`, `product_name`, `quantity`, `unit_cost`, `supplier_id`, `supplier_name`, `notes`, `created_at`
- IPC handler `stockEntries:create` runs in a transaction: saves the entry and increments `products.stock` atomically
- IPC handler `stockEntries:getAll` returns all entries sorted by date descending
- History list: columns #, Fecha, Producto, Cantidad (green badge), Costo unit., Proveedor, Notas
- Modal form: product dropdown (shows SKU + current stock), quantity (required), unit cost, supplier dropdown, notes

#### Proveedores module
- `suppliers` table: `name`, `phone`, `email`, `address`, `notes`, `created_at`
- IPC handlers: `suppliers:getAll`, `suppliers:create`, `suppliers:update`, `suppliers:delete`
- Full CRUD with inline modal; supplier name snapshotted at stock entry time

### Changed
- Navigation tabs updated: "Inventario" → "Catálogo"; "Entradas" and "Proveedores" added after Catálogo
- `ProductForm` section "Inventario y Ubicación" (4 cols) simplified to "Clasificación y Ubicación" (2 cols: Categoría, Ubicación); stock and min_stock removed from form
- `preload.js` exposes `suppliers` and `stockEntries` bridges
- Existing product stock values and all existing records remain fully compatible

---

## [0.8.0] - 2026-03-05

### Added

#### Sales module improvements
- **Método de pago**: dropdown in Nueva Venta (Efectivo, Tarjeta, Transferencia); stored on the sale record; shown in receipt and history with color badges
- **Estado de venta**: stored on sale record (Completada / Cancelada / Pendiente); displayed in Historial with color badges; defaults to `Completada` on confirm
- **IVA 13%**: subtotal computed as sum of item prices, tax = subtotal × 0.13, total = subtotal + tax; all three stored in the `sales` table
- **Profit per sale**: calculated at save time as Σ (unit_price − cost_price) × quantity per item; stored in `sales.profit`; products without cost_price are excluded from profit
- **Cart breakdown**: Nueva Venta cart footer now shows Subtotal / IVA (13%) / Total rows before the confirm button
- **Receipt breakdown**: SaleReceipt modal shows Subtotal, IVA (13%), and Total separately; also shows payment method
- **Historial columns**: Método and Estado columns added with color badges; expanded row footer shows Subtotal + IVA + Total
- **Dashboard Utilidad card**: third stat card shows today's estimated net profit (`todayProfit`) with purple accent

### Changed
- `SaleSchema` extended with nullable columns: `payment_method`, `status`, `subtotal`, `tax`, `profit` — existing records unaffected via `synchronize: true`
- `sales:create` IPC handler now receives `paymentMethod` and `status`; performs product lookup to compute per-item profit
- `preload.js` `sales.create` bridge updated to forward `paymentMethod` and `status`
- Dashboard top stat row changed from 2-column to 3-column grid

---

## [0.7.0] - 2026-03-05

### Added

#### Extended Product fields
- **SKU / Código**: optional, unique; auto-generated as `PRD-XXXXXX` (timestamp-based) if left blank
- **Código de barras**: optional, unique
- **Número de serie**: optional; important for refurbished items
- **Precio de costo**: optional decimal field
- **Precio de oferta**: optional; when set, shown in green with regular price struck through in ProductList and NewSale
- **Condición**: dropdown — Nuevo, Bueno, Regular, Para reparar (color-coded badges)
- **Estado**: dropdown — Disponible, Reservado, Vendido, En reparación (color-coded badges)
- **Notas técnicas**: textarea for repairs, technical details
- **Stock mínimo**: per-product configurable threshold (default 5)
- **Ubicación física**: shelf / warehouse text field

### Changed

- `price` DB column transparently renamed to `sale_price` in the entity using TypeORM `name: 'price'` mapping — existing data preserved with zero SQL migration
- `ProductForm` reorganized into collapsible sections: Identificación, Condición y Estado, Precios, Inventario y Ubicación, Descripción y Notas; modal is now scrollable (580px wide, 90vh max height)
- `ProductList` columns updated: Nombre/SKU, Condición badge, Estado badge, Precio venta (with cost price hint and offer price strikethrough), Stock (with per-product minimum hint)
- `NewSale` product search uses effective price (offer_price if set, else sale_price); shows offer price with strikethrough of regular price
- Dashboard low-stock alert now uses each product's `min_stock` instead of a hardcoded value of 5; stock badge shows `current / mín X`

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
