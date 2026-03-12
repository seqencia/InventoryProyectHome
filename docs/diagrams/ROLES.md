# ROLES — Admin vs Vendedor Permissions

## Module access by role

```mermaid
flowchart LR
    subgraph ADMIN["Admin"]
        A1[Dashboard - with profit and costs]
        A2[Catalogo - full CRUD]
        A3[Entradas - with unit cost]
        A4[Proveedores - full CRUD]
        A5[Nueva Venta]
        A6[Historial - full access and returns]
        A7[Categorias - full CRUD]
        A8[Clientes - full CRUD]
        A9[Reportes - with profit]
        A10[Configuracion - backup and user mgmt]
    end

    subgraph VENDEDOR["Vendedor"]
        V1[Dashboard - no profit, no costs]
        V3[Entradas - no unit cost shown]
        V5[Nueva Venta]
        V6[Historial - view and returns]
    end
```

## Permission matrix

| Module | Admin | Vendedor |
|---|---|---|
| Dashboard | Full — ventas, ingresos, utilidad, stock, top 5 | Partial — ventas e ingresos only, no profit |
| Catalogo | Full CRUD | No access |
| Entradas | Full — with unit cost | Add only — cost fields hidden |
| Proveedores | Full CRUD | No access |
| Nueva Venta | Full | Full |
| Historial | Full — view, returns, complete/cancel | Full — view, returns, complete/cancel |
| Categorias | Full CRUD | No access |
| Clientes | Full CRUD | No access |
| Reportes | Full — with profit and exports | No access |
| Configuracion | Full — backup and user management | No access |

## Detailed restrictions

```mermaid
flowchart TD
    LOGIN([User logs in]) --> ROLE{Role?}

    ROLE -- Admin --> ADMIN_ALL[Full access to all 10 tabs]
    ADMIN_ALL --> ADMIN_COST[Sees profit, costs and utilidad in all modules]
    ADMIN_ALL --> ADMIN_USERS[Can create, edit and delete users via Configuracion]

    ROLE -- Vendedor --> VEND_TABS[4 tabs only: Dashboard, Entradas, Nueva Venta, Historial]

    VEND_TABS --> VEND_DASH[Dashboard: Ventas Hoy, Ingresos Hoy, Stock Bajo, Top 5, Ventas Recientes. Utilidad Hoy is hidden]
    VEND_TABS --> VEND_STOCK[Entradas: Can add entries. Unit cost column and field are hidden]
    VEND_TABS --> VEND_SALE[Nueva Venta: Full sale creation with discounts and regalias]
    VEND_TABS --> VEND_HIST[Historial: View all sales, process returns, print receipts]
```

## What Vendedor cannot do

```mermaid
flowchart TD
    ROOT[Vendedor Restrictions]

    ROOT --> C1[View cost prices]
    C1 --> C1A[precio_costo on any product]
    C1 --> C1B[unit_cost in stock entries]
    C1 --> C1C[Utilidad Hoy on Dashboard]

    ROOT --> C2[Manage master data]
    C2 --> C2A[Create, edit or delete products]
    C2 --> C2B[Manage categories]
    C2 --> C2C[Manage suppliers]
    C2 --> C2D[Manage customers]

    ROOT --> C3[View reports]
    C3 --> C3A[Revenue analytics]
    C3 --> C3B[Profit by category]
    C3 --> C3C[Export Excel or CSV]

    ROOT --> C4[System administration]
    C4 --> C4A[Backup or restore database]
    C4 --> C4B[Create, edit or delete users]
```
