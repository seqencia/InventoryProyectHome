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

## Open Bugs

*(Sin bugs críticos abiertos)*
