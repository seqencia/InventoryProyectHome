# Known Bugs

---

## [BUG-001] Devolución: same sale can be returned multiple times

**Module**: Historial de Ventas → ReturnModal (`SaleHistory.js` + `returns:create` in `main.js`)

**Description**: A sale with status `Completada` or `Parcial` always shows the "↩ Devolver" button. There is no check against previously returned quantities, so the same items can be returned multiple times. Each return restores stock and deducts income regardless of prior returns.

**Expected behavior**: The return modal should pre-compute already-returned quantities per product (by summing existing `ReturnDetail` records for that `sale_id`) and cap the returnable quantity to `original_qty − already_returned_qty`. If all items are fully returned the "Devolver" button should be disabled or hidden.

**Files to change**:
- `main.js`: `returns:create` — validate quantities against prior returns before saving
- `SaleHistory.js`: load returns alongside sales; pass already-returned quantities into `ReturnModal`; disable button when nothing left to return
- `ReturnModal`: cap each item's max quantity to `original_qty − already_returned`

**Priority**: Medium
