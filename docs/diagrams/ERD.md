# ERD — Entity Relationship Diagram

All tables defined in `src/main/main.js` as TypeORM `EntitySchema` objects.
Relationships are logical (not ORM-enforced FK constraints — SQLite with `synchronize: true`).

```mermaid
erDiagram
    USER {
        int id PK
        string name
        string username UK
        string password_hash
        string role
        datetime created_at
    }

    CATEGORY {
        int id PK
        string name UK
        string description
    }

    PRODUCT {
        int id PK
        string sku UK
        string barcode UK
        string serial_number
        string name
        string description
        string technical_notes
        string category
        string condition
        string status
        boolean disponible_regalia
        decimal cost_price
        decimal sale_price
        decimal offer_price
        decimal precio_costo
        decimal precio_venta_sin_iva
        decimal precio_venta_con_iva
        decimal descuento_monto
        decimal descuento_porcentaje
        decimal precio_neto
        decimal utilidad
        int stock
        int min_stock
        string location
        datetime created_at
        datetime updated_at
    }

    SUPPLIER {
        int id PK
        string name
        string phone
        string email
        string address
        string notes
        datetime created_at
    }

    STOCK_ENTRY {
        int id PK
        int product_id FK
        string product_name
        int quantity
        int bonus_quantity
        decimal unit_cost
        int supplier_id FK
        string supplier_name
        string notes
        decimal precio_venta_bonificacion
        boolean precio_bonificacion_pendiente
        datetime created_at
    }

    BONIFICACION_PRICE_LOG {
        int id PK
        int product_id FK
        string product_name
        decimal previous_price
        decimal new_price
        string notes
        datetime created_at
    }

    CUSTOMER {
        int id PK
        string name
        string phone
        string email
        datetime created_at
    }

    SALE {
        int id PK
        string payment_method
        string status
        decimal subtotal
        decimal tax
        decimal total
        decimal profit
        decimal global_discount
        int regalia_count
        int customer_id FK
        string customer_name
        datetime created_at
    }

    SALE_DETAIL {
        int id PK
        int sale_id FK
        int product_id FK
        string product_name
        int quantity
        decimal unit_price
        decimal subtotal
        boolean is_regalia
        string regalia_type
        decimal cost_price
        decimal discount_amount
        decimal discount_percentage
        decimal iva_amount
        decimal line_total
    }

    RETURN {
        int id PK
        int sale_id FK
        string reason
        string notes
        decimal total_refunded
        boolean is_partial
        datetime created_at
    }

    RETURN_DETAIL {
        int id PK
        int return_id FK
        int product_id FK
        string product_name
        int quantity
        decimal unit_price
        decimal subtotal
    }

    PRODUCT }o--|| CATEGORY : "categorized by (denormalized)"
    STOCK_ENTRY }o--|| PRODUCT : "replenishes stock of"
    STOCK_ENTRY }o--o| SUPPLIER : "supplied by"
    BONIFICACION_PRICE_LOG }o--|| PRODUCT : "price history for"
    SALE_DETAIL }o--|| SALE : "belongs to"
    SALE_DETAIL }o--|| PRODUCT : "references"
    SALE }o--o| CUSTOMER : "placed by"
    RETURN }o--|| SALE : "reverses"
    RETURN_DETAIL }o--|| RETURN : "belongs to"
    RETURN_DETAIL }o--|| PRODUCT : "references"
```

## Notes

- `USER` has no FK to other tables — it is used only for authentication
- `PRODUCT.category` stores the category **name** (denormalized string), not an FK to `CATEGORY.id`
- `STOCK_ENTRY.supplier_name` and `SALE.customer_name` are **snapshots** taken at creation time
- `SALE_DETAIL` fields (`cost_price`, `unit_price`, `discount_*`, `iva_amount`, `line_total`) are **immutable snapshots** — historical reports always read stored values
- Legacy columns (`cost_price`, `sale_price`/`price`, `offer_price`) on `PRODUCT` are kept in sync with the `precio_*` fields for backward compatibility
