# ROLES — Admin vs Vendedor Permissions

## Module access by role

```mermaid
graph LR
    subgraph ADMIN["🔑 Admin"]
        direction TB
        A1[Dashboard\nwith profit + costs]
        A2[Catálogo\nfull CRUD]
        A3[Entradas\nwith unit cost]
        A4[Proveedores\nfull CRUD]
        A5[Nueva Venta\nfull access]
        A6[Historial\nfull access + returns]
        A7[Categorías\nfull CRUD]
        A8[Clientes\nfull CRUD]
        A9[Reportes\nfull with profit]
        A10[Configuración\nbackup + user mgmt]
    end

    subgraph VENDEDOR["👤 Vendedor"]
        direction TB
        V1[Dashboard\nno profit · no costs]
        V3[Entradas\nno unit cost shown]
        V5[Nueva Venta\nfull access]
        V6[Historial\nview + returns]
    end
```

## Permission matrix

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd'}}}%%
quadrantChart
    title Module Access (Admin vs Vendedor)
    x-axis Low Sensitivity --> High Sensitivity
    y-axis Vendedor Only --> Both Roles
    quadrant-1 Admin Only
    quadrant-2 Both with restrictions
    quadrant-3 Vendedor (limited)
    quadrant-4 Admin Only (sensitive)
    Nueva Venta: [0.15, 0.85]
    Historial: [0.25, 0.80]
    Dashboard básico: [0.2, 0.65]
    Entradas sin costo: [0.3, 0.60]
    Dashboard con utilidad: [0.75, 0.55]
    Reportes: [0.8, 0.25]
    Configuración: [0.7, 0.20]
    Catálogo CRUD: [0.6, 0.30]
    Gestión Usuarios: [0.9, 0.15]
```

## Detailed restrictions

```mermaid
flowchart TD
    LOGIN([User logs in]) --> ROLE{Role?}

    ROLE -- Admin --> ADMIN_ALL[Full access to all 10 tabs]
    ADMIN_ALL --> ADMIN_COST[Sees: profit · costs · utilidad\nin all modules]
    ADMIN_ALL --> ADMIN_USERS[Can create/edit/delete users\nvia Configuración]

    ROLE -- Vendedor --> VEND_TABS[4 tabs only:\nDashboard · Entradas · Nueva Venta · Historial]

    VEND_TABS --> VEND_DASH[Dashboard:\n✅ Ventas Hoy\n✅ Ingresos Hoy\n❌ Utilidad Hoy hidden\n✅ Stock Bajo\n✅ Top 5 Vendidos\n✅ Ventas Recientes]

    VEND_TABS --> VEND_STOCK[Entradas:\n✅ Can add stock entries\n❌ Costo unit. column hidden\n❌ Costo field hidden in modal]

    VEND_TABS --> VEND_SALE[Nueva Venta:\n✅ Full sale creation\n✅ All payment methods\n✅ Discounts\n✅ Regalías]

    VEND_TABS --> VEND_HIST[Historial:\n✅ View all sales\n✅ Process returns\n✅ Print receipts\n✅ Complete/Cancel pending sales]
```

## What Vendedor CANNOT do

```mermaid
mindmap
    root((Vendedor\nCannot))
        View Costs
            producto precio_costo
            stock unit_cost column
            utilidad today on Dashboard
        Manage Master Data
            Create/edit/delete products
            Manage categories
            Manage suppliers
            Manage customers
        View Reports
            Revenue analytics
            Profit by category
            Export Excel/CSV
        System Admin
            Backup/restore database
            Create/edit/delete users
            View other users
```
