# Testing

Manual test cases for every critical module. No automated test runner is configured — run these manually after changes.

---

## NewSale

### IVA 13%

| # | Escenario | Pasos | Resultado esperado |
|---|---|---|---|
| T-01 | IVA aplicado sobre ítems normales | Agregar 1 producto ($100 sin IVA) al carrito → revisar desglose | Subtotal $100.00 · IVA $13.00 · Total $113.00 |
| T-02 | IVA no aplicado a regalías | Agregar 1 ítem normal + 1 regalía → revisar desglose | IVA solo sobre el ítem normal; regalía muestra $0.00; IVA total sin incluir regalía |
| T-03 | IVA no aplicado a bonificaciones de proveedor | Agregar 1 bonif. proveedor → revisar desglose | Bonif. muestra $0.00 y no suma a IVA ni subtotal |
| T-04 | IVA con múltiples ítems | 3 ítems con precios distintos → revisar total | IVA = `r2(subtotalNeto * 0.13)`; Total = `subtotalNeto + IVA` |

### Precisión monetaria (punto flotante)

| # | Escenario | Resultado esperado |
|---|---|---|
| T-05 | Precio con decimales complejos (e.g. $33.33 × 3) | Total siempre redondeado a 2 decimales exactos; sin discrepancias `±$0.01` |
| T-06 | Descuentos encadenados (línea + global) | Cada resultado intermedio usa `r2()`; total final coherente con el desglose visible |

### Descuentos

| # | Escenario | Pasos | Resultado esperado |
|---|---|---|---|
| T-07 | Descuento por línea — monto fijo | Agregar producto $100; desc. línea $10 → revisar | Precio efectivo = $90; subtotal de línea = $90 |
| T-08 | Descuento por línea — porcentaje | Desc. línea 10% sobre $100 | Precio efectivo = $90 |
| T-09 | Descuento global — monto fijo | Subtotal $200; desc. global $20 | SubtotalNeto = $180; IVA sobre $180 |
| T-10 | Descuento global — porcentaje | Subtotal $200; desc. global 10% | SubtotalNeto = $180 |
| T-11 | Stacking: desc. línea + desc. global | Prod. $100; desc. línea 10% ($90); desc. global $10 | SubtotalNeto = $80; IVA sobre $80; Total = $90.40 |
| T-12 | Descuento no puede dejar total negativo | Desc. global mayor que subtotal | Total se capea a $0.00 (globalDiscAmount se limita automáticamente) |

### Prevención de total negativo

| # | Escenario | Resultado esperado |
|---|---|---|
| T-13 | Desc. global excede subtotal | Total = $0.00; no se puede confirmar una venta con total negativo |
| T-14 | Todos los ítems son regalías | Subtotal = $0.00 · IVA = $0.00 · Total = $0.00; venta válida |

### Regalías

| # | Escenario | Resultado esperado |
|---|---|---|
| T-15 | Botón "+ Regalía" solo visible si `disponible_regalia = true` | Producto sin marca: solo botón "Agregar" |
| T-16 | Regalía propia vs Bonif. proveedor | Badges diferenciados (🎁 morado / 📦 azul); desglose separado en carrito y recibo |
| T-17 | Regalía propia resta costo del profit | `sales.profit` reducido por `precio_costo` del ítem regalía propia |
| T-18 | Bonif. proveedor no afecta profit | `sales.profit` sin cambio por ítems bonificación |

---

## Inventario

### Actualización de stock tras venta

| # | Escenario | Resultado esperado |
|---|---|---|
| T-20 | Venta de 2 unidades de producto con stock 5 | `product.stock` = 3 después de confirmar |
| T-21 | Regalía decrementa stock igualmente | Regalía de 1 ud con stock 5 → stock = 4 |
| T-22 | Stock insuficiente | Si stock = 0, botón "Agregar" deshabilitado en NewSale |
| T-23 | Cap de cantidad en carrito | Suma normal + regalía no puede exceder stock disponible |

### Actualización de stock tras devolución

| # | Escenario | Resultado esperado |
|---|---|---|
| T-24 | Devolver 1 ud de venta de 2 | `product.stock` +1 (restaurado); sale status = `Parcial` |
| T-25 | Devolver todas las unidades | `product.stock` restaurado completamente; sale status = `Devuelta` |

### Entrada de stock (StockEntry)

| # | Escenario | Resultado esperado |
|---|---|---|
| T-26 | Entrada: 10 compradas + 2 bonificadas | `product.stock` += 12 |
| T-27 | Solo bonificadas (0 compradas) | Bloqueado — `totalQty` debe ser > 0 |
| T-28 | Entrada sin bonus_quantity | `product.stock` += quantity únicamente |

---

## Devoluciones (Returns)

### Prevención de devolución duplicada

| # | Escenario | Resultado esperado |
|---|---|---|
| T-30 | Devolver una venta ya devuelta completamente | Botón "↩ Devolver" deshabilitado; `canReturn()` retorna false |
| T-31 | Intentar devolver más unidades de las originales vía IPC directo | `returns:create` lanza error server-side: "Cantidad excede original" |
| T-32 | Devolución parcial seguida de otra devolución | Segunda devolución solo permite las unidades restantes; ítems ya devueltos aparecen deshabilitados con badge "Ya devuelto" |
| T-33 | Devolución acumulada = total original | Sale status pasa a `Devuelta`; `is_partial = false` |

### Restauración de stock

| # | Escenario | Resultado esperado |
|---|---|---|
| T-34 | Confirmar devolución | Stock de cada producto devuelto incrementa exactamente en `quantity` devuelta |
| T-35 | Transaccionalidad de devolución | Si falla algún paso (DB error), toda la operación hace rollback; stock y sale status sin cambio |

---

## Reportes

### Filtrado de fechas

| # | Escenario | Resultado esperado |
|---|---|---|
| T-40 | Filtro "Hoy" | Solo ventas de la fecha actual UTC (YYYY-MM-DD) |
| T-41 | Filtro rango personalizado | `from` y `to` inclusivos; ventas del día `to` incluidas |
| T-42 | `from` o `to` vacío | `reports:getData` retorna error de validación; no ejecuta queries |
| T-43 | Rango sin ventas | Todos los KPIs en 0; tablas vacías; sin error |

### Integridad de exportación Excel

| # | Escenario | Resultado esperado |
|---|---|---|
| T-44 | Exportar Excel tras generar reporte | `.xlsx` con 4 hojas: Resumen, Por Categoría, Top 10 Productos, Ventas Diarias |
| T-45 | Hoja Resumen | 6 KPIs: total ventas, ingreso bruto, IVA recaudado, devoluciones, ingreso neto, utilidad |
| T-46 | Hoja Top 10 Productos | rank, nombre, unidades vendidas, ingreso, utilidad; profit solo cuando cost_price disponible |
| T-47 | Datos coinciden con UI | Totales en Excel = totales mostrados en pantalla para el mismo rango |

---

## Pricing

### Precisión de 6 decimales

| # | Campo | Verificar |
|---|---|---|
| T-50 | `precio_venta_con_iva` | = `r6(precio_venta_sin_iva * 1.13)` — exactamente 6 decimales en DB |
| T-51 | `precio_neto` | = `r6(sinIva * (1 - dPorc/100) - dMonto)` — nunca negativo |
| T-52 | `utilidad` | = `r6(precio_neto - precio_costo)` — puede ser negativa (se muestra en rojo) |
| T-53 | Legacy sync | Guardar producto actualiza también `sale_price` (columna `price`) y `cost_price` legacy |
| T-54 | Precio de venta $0.00 | Bloqueado por `min="0.01"` en ProductForm |
| T-55 | `precio_venta_con_iva` en venta | `unit_price` en `sale_details` = `precio_neto` del producto al momento de la venta |

### Campos derivados — live preview

| # | Escenario | Resultado esperado |
|---|---|---|
| T-56 | Modificar `precio_venta_sin_iva` | `precio_venta_con_iva` se actualiza instantáneamente en la UI |
| T-57 | Modificar `descuento_porcentaje` | `precio_neto` y `utilidad` se recalculan en tiempo real |

---

## Base de datos

### Integridad referencial (lógica, no ORM-enforced)

| # | Escenario | Comportamiento esperado |
|---|---|---|
| T-60 | Producto eliminado después de agregarse al carrito | `sales:create` detecta el `product_id` faltante y lanza error descriptivo antes de guardar |
| T-61 | Snapshot de nombre en `sale_details` | `product_name` almacenado en el detalle no cambia si se edita el producto después |
| T-62 | Snapshot de precios en `sale_details` | `cost_price`, `unit_price`, `discount_amount` inmutables en registros históricos |

### Índices

| # | Campo indexado | Query beneficiada |
|---|---|---|
| T-63 | `Sale.created_at` | Filtros de reportes por rango de fechas |
| T-64 | `SaleDetail.sale_id` | Carga de detalles por venta en Historial |
| T-65 | `Return.sale_id` | Validación de devoluciones previas en `returns:create` |
| T-66 | `StockEntry.product_id` | Carga de entradas por producto en `getBonificacionInfo` |

> Los índices son aplicados automáticamente por TypeORM con `synchronize: true`. Verificar que existen con un cliente SQLite (e.g. DB Browser for SQLite) después de la primera ejecución.
