# Business Rules

All domain-specific rules enforced by this application. Violations must be rejected at the IPC handler level (server-side), not only in the UI.

---

## IVA (Impuesto al Valor Agregado)

- Tasa fija: **13%**
- Se aplica sobre el `subtotalNeto` de ítems regulares
- Formula: `tax = r2(subtotalNeto * 0.13)`; `total = subtotalNeto + tax`
- **Excluido de regalías**: ítems con `is_regalia = true` tienen `unit_price = 0`, `subtotal = 0`, `iva_amount = 0`, `line_total = 0`
- El IVA acumulado se almacena en `sales.tax` y por línea en `sale_details.iva_amount`
- Los reportes muestran IVA recaudado como métrica separada (no incluye regalías)

---

## Regalías y Bonificaciones

### Regalía propia (`regalia_type = 'propia'`)
- El negocio absorbe el costo del producto
- `unit_price = 0`, no suma a subtotal ni IVA
- **Resta costo al profit**: `profit -= precio_costo * quantity`
- Solo disponible para productos con `disponible_regalia = true`
- Badge 🎁 morado en UI

### Bonificación de proveedor (`regalia_type = 'bonificacion'`)
- El proveedor regala las unidades; sin costo para el negocio
- `unit_price = 0`, no suma a subtotal ni IVA
- **No afecta profit** (sin costo absorbido)
- Solo disponible para productos con `disponible_regalia = true`
- Badge 📦 azul en UI

### Ambas
- Decrementan stock normalmente (son unidades físicas entregadas)
- No se pueden aplicar a productos con `disponible_regalia = false`
- Aparecen en secciones separadas del recibo

---

## Descuentos

### Descuento por línea (por ítem en el carrito)
- Modos: monto fijo (`$`) o porcentaje (`%`)
- Precio efectivo = `precio_neto − descuento_linea`
- Subtotal de línea = `precioEfectivo × quantity`
- No puede dejar el precio de la línea en negativo (mínimo $0)

### Descuento global (sobre el subtotal del carrito)
- Se aplica sobre el subtotal post-descuento de línea: `subtotalPostLine`
- Modos: monto fijo o porcentaje
- `subtotalNeto = subtotalPostLine − globalDiscAmount`
- **Total nunca negativo**: `globalDiscAmount` se capea a `subtotalPostLine`
- Almacenado en `sales.global_discount`

### Stacking
- Ambos descuentos se aplican secuencialmente: primero por línea, luego global
- Desglose visible en el carrito y en el recibo

### Profit con descuentos
- Profit por ítem = `(unit_price − precio_costo) × quantity`
- `unit_price` = precio efectivo final (ya con descuento de línea aplicado)
- El descuento global no se descuenta del profit por línea; afecta el total de la venta pero no el cálculo de utilidad por producto

---

## Precios

### Modelo de precios (campos `decimal(16,6)`)
- `precio_costo` — precio de costo de adquisición
- `precio_venta_sin_iva` — precio base sin IVA; si está presente, es el campo canónico
- `precio_venta_con_iva` — derivado: `r6(sin_iva × 1.13)`; almacenado en DB
- `descuento_monto` — descuento fijo del catálogo (default 0)
- `descuento_porcentaje` — descuento porcentual del catálogo (default 0)
- `precio_neto` — precio efectivo de venta: `r6(sin_iva × (1 − %/100) − monto)` — nunca negativo; almacenado en DB
- `utilidad` — `r6(precio_neto − precio_costo)`; puede ser negativa

### Prioridad de precio en carrito (NewSale)
1. `precio_neto` (campo nuevo, si existe y es > 0)
2. `offer_price` (campo legacy)
3. `sale_price` / `price` (campo legacy base)

> Los productos creados antes de v0.19.0 pueden no tener `precio_venta_sin_iva` y ser vendidos usando `sale_price`. Ambos flujos son válidos.

### Precio de venta mínimo
- `precio_venta_sin_iva >= 0.01` — precio $0.00 bloqueado en ProductForm (`min="0.01"`) para productos nuevos/editados

### Campos legacy
- `cost_price`, `sale_price` (columna DB `price`), `offer_price` — mantenidos por compatibilidad
- Se sincronizan automáticamente desde los campos nuevos en cada save de producto

---

## Stock

### Incremento (StockEntry)
- `product.stock += quantity + bonus_quantity`
- `bonus_quantity` es opcional (default 0); representa unidades regalo del proveedor
- El costo unitario aplica **solo sobre `quantity`**, no sobre `bonus_quantity`
- `totalQty = quantity + bonus_quantity` debe ser > 0 (validado en UI y recomendado en IPC)

### Decremento (Venta)
- Cada ítem en el carrito (normal, regalía propia, bonif. proveedor) decrementa stock
- La suma de quantity normal + regalía para el mismo producto no puede exceder stock disponible
- Stock decrementado atómicamente en la transacción de `sales:create`

### Restauración (Devolución)
- `product.stock += quantity` por cada ítem devuelto
- Restauración atómica en la transacción de `returns:create`

### Alerta de stock bajo
- Umbral configurable por producto: `min_stock` (default 5)
- Filas resaltadas en ámbar cuando `stock <= min_stock`
- Dashboard muestra conteo de productos con stock bajo

---

## Devoluciones

### Elegibilidad
- Solo ventas con status `Completada` o `Parcial` pueden ser devueltas
- Una venta `Devuelta` no puede volver a devolverse

### Validación de cantidades (server-side en `returns:create`)
- Se cargan todas las devoluciones previas de la misma `sale_id`
- Se construye `alreadyReturnedMap`: `{ product_id → total_qty_ya_devuelta }`
- Por cada ítem a devolver: `qty_solicitada <= original_qty − already_returned` — error si excede

### Status de venta tras devolución
- **Devolución total** (todos los ítems completamente devueltos): status = `Devuelta`, `is_partial = false`
- **Devolución parcial** (al menos un ítem con saldo positivo): status = `Parcial`, `is_partial = true`

### Razones obligatorias
- Producto defectuoso / Error en venta / Cliente arrepentido / Otro

### Snapshot en devolución
- `return_details` guarda `product_name`, `unit_price`, `subtotal` al momento de la devolución

---

## Ventas (Sale)

### Proceso de `sales:create`
1. Validar que todos los `product_id` del carrito existan en DB
2. Separar ítems regulares de regalías
3. Calcular `lineSubtotal` = suma de `(unit_price × quantity)` de ítems regulares
4. Calcular `subtotalNeto` = `lineSubtotal − globalDiscountAmount`
5. Calcular `tax` = `subtotalNeto × 0.13`
6. Calcular `total` = `subtotalNeto + tax`
7. Calcular `profit` = Σ `(unit_price − costo) × qty` (regulares) − Σ `costo × qty` (regalías propias)
8. Guardar `Sale` + `SaleDetail[]` en transacción
9. Decrementar `product.stock` por cada ítem (todos, incluidas regalías)

### Snapshots inmutables en `sale_details`
Los siguientes campos se escriben una sola vez y nunca se recalculan:
- `product_name`, `unit_price`, `subtotal`
- `cost_price`, `discount_amount`, `discount_percentage`, `iva_amount`, `line_total`

### Status inicial
- Default `Completada`; puede ser `Pendiente` si el operador lo selecciona manualmente en el dropdown de estado

### Status válidos
| Status | Descripción | Quién lo asigna |
|---|---|---|
| `Completada` | Venta procesada y pagada | Default en `sales:create` |
| `Pendiente` | Venta registrada pero pago pendiente | Operador en Nueva Venta (dropdown) |
| `Devuelta` | Todos los ítems devueltos | `returns:create` automáticamente |
| `Parcial` | Devolución parcial | `returns:create` automáticamente |
| `Cancelada` | Venta anulada | No existe UI para crearlo actualmente; reservado para uso futuro o corrección manual |

---

## Bonificaciones de proveedor (StockEntry)

### Precio de venta de unidades bonificadas — dos rutas

**Ruta 1: `BonificacionPriceModal`** (después de registrar una entrada con `bonus_quantity > 0`)
- Handler: `stockEntries:updateBonificacion`
- Si se asigna precio: actualiza `StockEntry.precio_venta_bonificacion` y opcionalmente actualiza `precio_venta_sin_iva` del producto con todos los campos derivados
- Si se marca "Sin precio (decisión posterior)": `StockEntry.precio_bonificacion_pendiente = true`; producto sin cambio
- **No crea** registro en `bonificacion_price_logs`

**Ruta 2: Sección "Unidades Bonificadas" en ProductForm** (edición posterior del producto)
- Handler: `products:updateBonificacionPrice`
- Actualiza `precio_venta_sin_iva` del producto y todos los campos derivados
- **Sí crea** registro en `bonificacion_price_logs` con `previous_price` y `new_price`
- El historial de cambios de esta ruta es visible en ProductForm (últimos 10 registros)
