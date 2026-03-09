# Database

**Engine**: SQLite via TypeORM 0.3 using `EntitySchema` (plain JS, no decorators)
**Location**: `app.getPath('userData')/database.sqlite`
**Migration**: `synchronize: true` — schema auto-updated on every app start
**Pattern**: all schemas defined inline in `src/main/main.js`

---

## Schemas

### Product
Table: `products`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | auto-generated |
| `sku` | String? unique | auto-generated as `PRD-XXXXXX` if blank |
| `barcode` | String? unique | |
| `serial_number` | String? | |
| `name` | String | required |
| `description` | String? | |
| `technical_notes` | String? | |
| `category` | String? | denormalized name from categories |
| `condition` | String? | Nuevo / Bueno / Regular / Para reparar |
| `status` | String? | Disponible / Reservado / Vendido / En reparación |
| `disponible_regalia` | Boolean? | default false; shows "+ Regalía" in NewSale |
| `cost_price` | decimal(10,2)? | legacy; kept in sync with `precio_costo` |
| `sale_price` | decimal(10,2) | legacy; stored in DB column named `price`; kept in sync with `precio_venta_sin_iva` |
| `offer_price` | decimal(10,2)? | legacy; superseded by `precio_neto` |
| `precio_costo` | decimal(16,6)? | cost price — 6 decimal places |
| `precio_venta_sin_iva` | decimal(16,6)? | base sale price without IVA — 6 decimal places |
| `precio_venta_con_iva` | decimal(16,6)? | auto: `precio_venta_sin_iva × 1.13`; stored on save |
| `descuento_monto` | decimal(16,6)? | fixed discount amount; default 0 |
| `descuento_porcentaje` | decimal(16,6)? | discount percentage; default 0 |
| `precio_neto` | decimal(16,6)? | auto: `sin_iva × (1 − %/100) − monto`; stored on save |
| `utilidad` | decimal(16,6)? | auto: `precio_neto − precio_costo`; stored on save |
| `stock` | Number | managed via stock entries, never edited directly |
| `min_stock` | Number? | default 5; threshold for low-stock alert |
| `location` | String? | physical shelf/bin |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### Category
Table: `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `name` | String unique | |
| `description` | String? | default `''` |

### Customer
Table: `customers`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `name` | String | |
| `phone` | String? | |
| `email` | String? | |
| `created_at` | datetime | |

### Supplier
Table: `suppliers`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `name` | String | |
| `phone` | String? | |
| `email` | String? | |
| `address` | String? | |
| `notes` | String? | |
| `created_at` | datetime | |

### StockEntry
Table: `stock_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `product_id` | Number | FK to products (not enforced by ORM) |
| `product_name` | String | snapshot at entry time |
| `quantity` | Number | purchased quantity |
| `bonus_quantity` | Number? | gift/bonus units from supplier; default 0 |
| `unit_cost` | decimal(10,2)? | applies only to purchased qty |
| `supplier_id` | Number? | |
| `supplier_name` | String? | snapshot at entry time |
| `notes` | String? | |
| `created_at` | datetime | |

> Stock increment = `quantity + bonus_quantity`

### Sale
Table: `sales`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `payment_method` | String? | Efectivo / Tarjeta / Transferencia |
| `status` | String? | Completada / Cancelada / Pendiente / Devuelta / Parcial |
| `subtotal` | decimal(10,2)? | sum of regular (non-regalía) items |
| `tax` | decimal(10,2)? | subtotal × 0.13 |
| `total` | decimal(10,2) | subtotal + tax |
| `profit` | decimal(10,2)? | Σ (unit_price − cost_price) × qty for regular items |
| `regalia_count` | Number? | total regalía units in this sale |
| `customer_id` | Number? | |
| `customer_name` | String? | snapshot at sale time |
| `created_at` | datetime | |

### SaleDetail
Table: `sale_details`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `sale_id` | Number | |
| `product_id` | Number | |
| `product_name` | String | snapshot |
| `quantity` | Number | |
| `unit_price` | decimal(10,2) | effective price per unit (= `precio_neto`); 0 if regalía |
| `subtotal` | decimal(10,2) | `unit_price × quantity`; 0 if regalía |
| `is_regalia` | Boolean? | default false |
| `cost_price` | decimal(16,6)? | snapshot of `producto.precio_costo` at sale time |
| `discount_amount` | decimal(16,6)? | per-unit discount (`precio_venta_sin_iva − unit_price`); 0 if regalía |
| `discount_percentage` | decimal(16,6)? | snapshot of `producto.descuento_porcentaje`; 0 if regalía |
| `iva_amount` | decimal(16,6)? | `subtotal × 0.13`; 0 if regalía |
| `line_total` | decimal(16,6)? | `subtotal + iva_amount`; 0 if regalía |

> All `sale_details` snapshot fields are immutable after creation — historical reports always read stored values, never recalculate from current product prices.

### Return
Table: `returns`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `sale_id` | Number | |
| `reason` | String | Producto defectuoso / Error en venta / Cliente arrepentido / Otro |
| `notes` | String? | |
| `total_refunded` | decimal(10,2) | |
| `is_partial` | Boolean | true if not all items were returned |
| `created_at` | datetime | |

### ReturnDetail
Table: `return_details`

| Column | Type | Notes |
|---|---|---|
| `id` | Number PK | |
| `return_id` | Number | |
| `product_id` | Number | |
| `product_name` | String | snapshot |
| `quantity` | Number | |
| `unit_price` | decimal(10,2) | |
| `subtotal` | decimal(10,2) | |

---

## Relationships (logical, not ORM-enforced)

```
Category ←── Product ←── StockEntry
                │
                └──< SaleDetail >── Sale ──< Return ──< ReturnDetail
                                       │
                                    Customer
                                    Supplier (via StockEntry)
```

## Config file

`app.getPath('userData')/config.json` — stores `{ autoBackup: boolean }`
`app.getPath('userData')/backups/` — auto-backup destination folder
