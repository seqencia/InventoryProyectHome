# Known Bugs

---

## [FIXED] BUG-001 — Devolución: misma venta devuelta múltiples veces

**Module**: Historial de Ventas → ReturnModal

**Fix applied** (2026-03-08):
- `main.js` `returns:create`: carga devoluciones previas por `sale_id`, construye mapa `alreadyReturnedMap`, valida que cada cantidad solicitada no exceda `original_qty - already_returned`. `isPartial` ahora considera el total acumulado de todas las devoluciones.
- `SaleHistory.js`: nueva función `getAlreadyReturned(saleId)` computa cantidades ya devueltas por `product_id` desde el estado `returns`. `canReturn(sale)` verifica que quede al menos un item con saldo positivo. `ReturnModal` recibe prop `alreadyReturned`, muestra items completamente devueltos en gris/deshabilitados con badge "Ya devuelto", limita el `max` del input a `original_qty - already`.

---

## [FIXED] BUG-002 — returns:create sin validación server-side de cantidades

**Module**: `main.js` → `returns:create`

**Fix applied** (2026-03-08): Ver BUG-001 — misma fix.

---

## [FIXED] BUG-006 — sales:create no valida que todos los productos existan en DB

**Module**: `main.js` → `sales:create`

**Fix applied** (2026-03-08): Después de construir `productMap`, se verifica que todos los `product_id` del carrito estén presentes. Si alguno no existe (producto eliminado después de agregarse al carrito), se lanza error antes de guardar.

---

## [FIXED] BUG-029 — Entrada de stock con cantidad total 0 permitida

**Module**: `StockEntriesView.js` → `StockEntryModal`

**Fix applied** (2026-03-08): Validación en `handleSubmit` que verifica `totalQty > 0` antes de llamar a `onSave`. Muestra mensaje de error inline si se intenta registrar con total 0.

---

## [FIXED] BUG-033 — Precio de venta $0.00 permitido en ProductForm

**Module**: `ProductForm.js`

**Fix applied** (2026-03-08): Cambiado `min="0"` a `min="0.01"` en el input de precio de venta.

---

## [FIXED] BUG-040 — Floating-point accumulation en cálculos monetarios del carrito

**Module**: `NewSale.js` — sección "Computed totals"

**Severity**: Alta (podría causar discrepancias entre el precio mostrado y el almacenado)

**Root cause**: Los totales del carrito (`subtotalBruto`, `lineDiscountsTotal`, `globalDiscAmount`, `tax`, `total`) se calculaban con aritmética JS nativa sin redondeo, acumulando errores de punto flotante que pueden llegar a ±$0.01 en ciertos valores.

**Fix applied** (2026-03-09):
- Añadida función auxiliar `r2(v)` = `parseFloat(v.toFixed(2))` en la sección de computed totals de `NewSale.js`.
- Todos los totales calculados aplican `r2()` para garantizar 2 decimales exactos: `subtotalBruto`, `lineDiscountsTotal`, `subtotalPostLine`, `globalDiscAmount`, `totalDescuentos`, `subtotalNeto`, `tax`, `total`.

---

## [FIXED] BUG-041 — Profit en sales:create sin precisión de 6 decimales

**Module**: `main.js` → `sales:create`

**Severity**: Media (el profit almacenado podía tener errores de punto flotante en su acumulación)

**Root cause**: El cálculo de `profit` acumulaba con `+=` y `-=` directamente sin aplicar `r6()`, lo que podía introducir imprecisiones en la suma.

**Fix applied** (2026-03-09):
- Cada iteración del loop de profit ahora aplica `r6()`: `profit = r6(profit + ...)` y `profit = r6(profit - ...)`.
- El acumulador de `lineSubtotal` también aplica `r6()` y coerce a Number con fallback a 0: `r6(regularItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0))`.

---

## [FIXED] BUG-042 — Falta de índices en claves foráneas y fechas

**Module**: `main.js` — EntitySchemas

**Severity**: Media (queries completas O(n) en tablas que crecen con el uso)

**Root cause**: Los campos `sale_id`, `product_id`, `return_id` en `SaleDetail`, `ReturnDetail` y `StockEntry` no tenían índices. Tampoco `Sale.created_at` y `Return.created_at` usados en filtros de rango de fechas en reportes.

**Fix applied** (2026-03-09): Añadido `index: true` a los siguientes campos:
- `SaleDetail.sale_id`, `SaleDetail.product_id`
- `Return.sale_id`, `Return.created_at`
- `ReturnDetail.return_id`, `ReturnDetail.product_id`
- `StockEntry.product_id`
- `Sale.created_at`

---

## [FIXED] BUG-043 — Sin manejo de error en useEffect de carga inicial (NewSale.js)

**Module**: `NewSale.js`

**Severity**: Baja (fallo silencioso al cargar productos/clientes)

**Root cause**: Las promesas `products.getAll()` y `customers.getAll()` en el `useEffect` inicial no tenían `.catch()`, causando que un error de IPC fuera ignorado y el usuario viera una lista vacía sin mensaje explicativo.

**Fix applied** (2026-03-09): Añadido `.catch(() => setError('Error al cargar el catálogo de productos.'))` en `products.getAll()` y `.catch(() => {})` en `customers.getAll()`.

---

## [FIXED] BUG-044 — handleReturnConfirm sin manejo de error en SaleHistory

**Module**: `SaleHistory.js`

**Severity**: Media (error en devolución era silencioso; UI no informaba al usuario)

**Root cause**: `handleReturnConfirm` hacía `await window.electron.returns.create(data)` sin try/catch; si el IPC lanzaba error (p.ej. validación de cantidades excedidas), la excepción no era capturada y `loadData()` se llamaba igualmente, ocultando el error.

**Fix applied** (2026-03-09): Envuelto en try/catch; en caso de error muestra `setError()` con el mensaje del servidor.

---

## Open Bugs

*(Sin bugs críticos abiertos)*
