# Roadmap

Semantic versioning: `0.x.x` = pre-release (active development), `1.0.0` = stable production release.

---

## ✅ v0.31.0 — Estado actual (2026-03-11)

### Completado en esta versión

- **Login y Roles** — pantalla de login al arrancar; roles Admin y Vendedor; sesión en memoria
- **Gestión de usuarios** — CRUD completo en Configuración (solo Admin); seed `admin/admin` en primer arranque
- **Restricciones Vendedor** — tabs ocultos (Catálogo, Categorías, Proveedores, Clientes, Reportes, Configuración); sin utilidad/costos en Dashboard; sin costo unitario en Entradas
- **Diagramas Mermaid** — ERD, flujos de venta/devolución/stock/login, arquitectura, roles en `docs/diagrams/`

### Completado en versiones anteriores

- **Catálogo** — CRUD completo de productos con SKU auto-generado, código de barras, número de serie, condición, estado
- **Entradas de inventario** — registro de stock comprado + bonificado por proveedor; precio de venta de unidades bonificadas con audit trail
- **Proveedores / Categorías / Clientes** — CRUD
- **Nueva Venta** — búsqueda por texto y scanner, carrito con regalías propias + bonificación proveedor, descuentos por línea y globales, modal de confirmación, recibo imprimible/PDF
- **Historial de Ventas** — tabla con filtros/búsqueda, detalle expandible, devoluciones parciales/totales, acciones sobre ventas Pendientes, impresión directa
- **Reportes** — filtros de fecha, 6 KPIs, desglose por método/categoría, top 10, gráfica diaria, export CSV + Excel (4 hojas)
- **Configuración** — backup manual/auto, export/import de BD
- **Dashboard** — KPIs del día, stock bajo, top 5 vendidos, ventas recientes
- **Modelo de precios** — 6 decimales, IVA 13%, descuentos catálogo, precio neto automático
- **Diseño** — Windows 11 Fluent Design (inline styles, frosted glass, pill tabs)
- **Documentación** — 11 archivos docs/ + diagramas Mermaid

---

## 🔜 v0.32.0 — Audit Log & Activity Tracking

### Objetivo

Registro completo de quién hizo qué y cuándo. Base legal y operativa para resolución de disputas entre Admin y Vendedor, y fundamento del panel de administración SaaS en v2.0.0.

### Schema

- Nueva tabla `audit_log`:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Number PK | auto-generated |
| `user_id` | Number | FK a `users.id` (snapshot del usuario activo) |
| `user_name` | String | snapshot del nombre al momento de la acción |
| `action` | String | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `entity` | String | nombre de la entidad afectada (ej. `Product`, `Sale`, `StockEntry`) |
| `entity_id` | Number? | id del registro afectado |
| `old_value` | String? | JSON serializado del estado anterior (solo en UPDATE/DELETE) |
| `new_value` | String? | JSON serializado del estado nuevo (solo en CREATE/UPDATE) |
| `created_at` | datetime | timestamp de la acción con precisión de segundos |

### Operaciones a registrar

- **Ventas**: creación de venta (`sales:create`) — quién vendió, qué productos, total
- **Precios**: cambio de precio en catálogo (`products:update`) — precio anterior vs nuevo
- **Stock**: nuevas entradas de inventario (`stockEntries:create`) — quién registró, producto, cantidades
- **Devoluciones**: procesamiento de devolución (`returns:create`) — quién devolvió, artículos, monto
- **Catálogo**: alta/baja/edición de productos — campos modificados con diff
- **Usuarios**: creación/edición/eliminación de usuarios (solo Admin) — sin loguear `password_hash`
- **Login / Logout**: registro de sesiones — user, timestamp, resultado (éxito o fallo)

### Timestamps de precisión en todas las tablas

Verificar que las siguientes entidades tengan `created_at` con precisión completa (datetime con segundos):
- `Sale.created_at` — ✅ ya existe
- `StockEntry.created_at` — ✅ ya existe
- `Return.created_at` — ✅ ya existe
- `BonificacionPriceLog.created_at` — ✅ ya existe
- `Product.created_at` / `updated_at` — ✅ ya existen
- `User.created_at` — ✅ ya existe
- `Category`, `Customer`, `Supplier` — verificar y añadir `updated_at` si falta

### Vista Admin — Timeline de actividad

- Pestaña "Auditoría" en Configuración (solo Admin)
- Timeline cronológico inverso con paginación
- Filtros: por usuario, por tipo de acción, por entidad, por rango de fechas
- Cada entrada muestra: fecha/hora, usuario, acción, entidad afectada, resumen del cambio
- Expandible para ver `old_value` → `new_value` diff en cambios de precio/producto
- Export CSV del log filtrado

### Motivaciones

1. **SaaS admin dashboard** — en v2.0.0, el dueño puede monitorear en tiempo real qué hacen los vendedores
2. **Trazabilidad legal** — ante una disputa o auditoría fiscal, se puede reconstruir el historial completo
3. **Resolución de disputas** — Admin vs Vendedor: quién modificó un precio, quién procesó una devolución
4. **Detección de anomalías** — ventas inusuales, cambios de precio frecuentes, devoluciones repetidas

---

## 🔜 v0.33.0 — Inventario avanzado

- [ ] Ajuste de inventario manual (corrección de conteo físico) con motivo y log de auditoría
- [ ] Vista de movimientos de stock por producto (entradas + salidas + devoluciones en una línea de tiempo)
- [ ] Inventario con foto del producto (imagen local, opcional)
- [ ] Alertas de stock bajo por notificación de sistema (Electron `Notification`)
- [ ] Editar venta en estado `Pendiente` antes de confirmar (agregar/quitar ítems)

---

## 🔜 v0.34.0 — Reportes y analítica avanzada

- [ ] Reporte de rentabilidad por categoría (margen %)
- [ ] Reporte de productos sin movimiento (sin ventas en N días)
- [ ] Reporte de devoluciones: tasa por producto, razón más común
- [ ] Comparativa de períodos (este mes vs mes anterior)
- [ ] Gráfica de tendencia de utilidad diaria/semanal
- [ ] Export PDF de reportes (usando `window.print()` sobre la vista de reportes)

---

## 🔜 v0.35.0 — Clientes y fidelización

- [ ] Historial de compras por cliente (ventas + montos + productos)
- [ ] Notas internas por cliente
- [ ] Búsqueda de cliente por teléfono en Nueva Venta (no solo nombre)
- [ ] Saldo pendiente por cliente (ventas en estado `Pendiente`)

---

## 🔜 v0.36.0 — Configuración avanzada

- [ ] Nombre y logo de la tienda configurables (mostrado en recibo)
- [ ] Número de comprobante personalizable (prefijo + secuencia)
- [ ] Tasa de IVA configurable en ajustes (con confirmación explícita)
- [ ] Permisos granulares por rol (ampliar más allá de Admin/Vendedor)

---

## 🎯 v1.0.0 — Release estable

**Criterios de entrada a v1.0.0**:
- [ ] Sin bugs críticos abiertos
- [ ] Todos los módulos probados con los casos en `docs/TESTING.md`
- [ ] Backup/restore probado en producción real
- [ ] Documentación completa (`docs/`) actualizada
- [ ] Performance aceptable con ≥ 5 000 productos y ≥ 10 000 ventas
- [ ] Instalador empaquetado con `electron-builder` (`.exe` firmado)

**Incluye todo lo de v0.32 – v0.35 más**:
- [ ] Onboarding para nuevos usuarios (wizard de primera configuración)
- [ ] Pantalla de ayuda / shortcuts in-app
- [ ] Auto-updater (`electron-updater`) para nuevas versiones

---

## 🔮 v1.1.0 — DTE / Hacienda (Facturación electrónica)

> Requiere registro como emisor DTE ante el Ministerio de Hacienda de El Salvador.

- [ ] Integración con el ambiente de pruebas de Hacienda (API REST)
- [ ] Generación de DTE (Documento Tributario Electrónico): Factura, Comprobante de Crédito Fiscal, Nota de Crédito
- [ ] Firma electrónica del DTE (certificado `.p12`)
- [ ] Transmisión al MH y manejo de estado (Procesado / Rechazado / Contingencia)
- [ ] Código de generación (UUID v4) y sello de recepción almacenados en `sales`
- [ ] Recibo/ticket con código QR de verificación Hacienda
- [ ] Contingencia offline: emitir DTE en papel con correlativo especial; transmitir al reconectar
- [ ] Catálogo de actividades económicas y unidades de medida reglamentarias
- [ ] Reporte de DTE emitidos (filtrable por tipo, estado, período)

**Dependencias nuevas** (a evaluar): `node-forge` (firma), `xml-js` o `fast-xml-parser` (generación XML), `qrcode` (QR en recibo).

---

## 🚀 v2.0.0 — SaaS multi-tenant

> Cambio de arquitectura mayor: de desktop Electron a aplicación web en la nube.

### Arquitectura objetivo

```
Browser (React SPA)  ←→  API REST (Node.js / Express o Fastify)
                              │
                         PostgreSQL (por tenant)
                              │
                         Auth (JWT + refresh tokens)
```

### Hitos principales

- [ ] **Migración de BD**: SQLite → PostgreSQL; schemas TypeORM compatibles
- [ ] **Multi-tenancy**: cada empresa tiene su propia schema/BD; `tenant_id` en cada tabla o schema separation
- [ ] **Autenticación y roles**: Admin / Cajero / Supervisor; permisos por módulo (reutilizar `User` schema)
- [ ] **API REST**: todos los handlers IPC actuales convertidos a endpoints REST
- [ ] **Renderer desacoplado**: eliminar `window.electron.*`; reemplazar por `fetch` / `axios`
- [ ] **Sync offline opcional**: IndexedDB local + sync al reconectar (para negocios con internet inestable)
- [ ] **Panel de administración SaaS**: gestión de tenants, facturación, planes
- [ ] **Despliegue**: Docker + Railway / Render / AWS; backups automáticos en S3
- [ ] **Electron wrapper opcional**: envolver la SPA en Electron para usuarios que prefieran app de escritorio

### Consideraciones de migración

- Los datos existentes (SQLite) deben migrarse con un script `migrate-to-saas.js`
- Los snapshots en `sale_details` garantizan que los reportes históricos sean correctos post-migración
- La API DTE (v1.1.0) se integra más fácilmente en una arquitectura server-side
- El sistema de usuarios/roles de v0.31.0 es base directa del sistema multi-tenant
