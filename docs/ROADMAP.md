# Roadmap

Semantic versioning: `0.x.x` = pre-release (active development), `1.0.0` = stable production release.

---

## ✅ v0.28.0 — Estado actual (2026-03-10)

Aplicación de escritorio completa para tienda de tecnología/reacondicionados. Single-user, offline-first.

### Completado

- **Catálogo** — CRUD completo de productos con SKU auto-generado, código de barras, número de serie, condición, estado
- **Entradas de inventario** — registro de stock comprado + bonificado por proveedor; precio de venta de unidades bonificadas con audit trail
- **Proveedores / Categorías / Clientes** — CRUD
- **Nueva Venta** — búsqueda por texto y scanner, carrito con regalías propias + bonificación proveedor, descuentos por línea y globales, modal de confirmación, recibo imprimible/PDF
- **Historial de Ventas** — tabla paginada, detalle expandible, devoluciones parciales/totales con restauración de stock
- **Reportes** — filtros de fecha, 6 KPIs, desglose por método/categoría, top 10, gráfica diaria, export CSV + Excel (4 hojas)
- **Configuración** — backup manual/auto, export/import de BD
- **Dashboard** — KPIs del día, stock bajo, top 5 vendidos, ventas recientes
- **Modelo de precios** — 6 decimales, IVA 13%, descuentos catálogo, precio neto automático
- **Diseño** — Windows 11 Fluent Design (inline styles, frosted glass, pill tabs)
- **Documentación** — ARCHITECTURE, DATABASE, MODULES, DESIGN-SYSTEM, BUGS, TESTING, BUSINESS-RULES, PATTERNS, DECISIONS, ROADMAP, UI-COMPONENTS

---

## 🔜 v0.29.0 — Estabilización y UX

- [ ] Búsqueda global en Historial (por cliente, producto, método, rango de monto)
- [ ] Editar venta pendiente antes de confirmar (agregar/quitar ítems)
- [ ] Indicador visual de "stock se agotará" si se venden todas las unidades disponibles
- [ ] Imprimir/PDF desde Historial sin abrir el ticket (botón directo)
- [ ] Validar `barcode` único al guardar producto (mostrar mensaje claro si ya existe)

---

## 🔜 v0.30.0 — Gestión avanzada de inventario

- [ ] Ajuste de inventario manual (corrección de conteo físico) con motivo y log de auditoría
- [ ] Transferencia de stock entre ubicaciones físicas
- [ ] Alertas configurables: email/notificación cuando `stock <= min_stock`
- [ ] Inventario con foto del producto (imagen local, opcional)
- [ ] Vista de movimientos de stock por producto (entradas + salidas + devoluciones en una línea de tiempo)

---

## 🔜 v0.31.0 — Reportes y analítica avanzada

- [ ] Reporte de rentabilidad por categoría (margen %)
- [ ] Reporte de productos sin movimiento (sin ventas en N días)
- [ ] Reporte de devoluciones: tasa por producto, razón más común
- [ ] Comparativa de períodos (este mes vs mes anterior)
- [ ] Gráfica de tendencia de utilidad diaria/semanal
- [ ] Export PDF de reportes (usando `window.print()` sobre la vista de reportes)

---

## 🔜 v0.32.0 — Clientes y fidelización

- [ ] Historial de compras por cliente (ventas + montos + productos)
- [ ] Notas internas por cliente
- [ ] Búsqueda de cliente por teléfono en Nueva Venta (no solo nombre)
- [ ] Saldo pendiente por cliente (ventas en estado `Pendiente`)

---

## 🔜 v0.33.0 — Configuración avanzada

- [ ] Nombre de la tienda configurable (mostrado en recibo)
- [ ] Logo de la tienda (imagen local, mostrado en recibo impreso)
- [ ] Número de comprobante personalizable (prefijo + secuencia)
- [ ] Tasa de IVA configurable en ajustes (con confirmación explícita)
- [ ] Múltiples cajas / puntos de venta (local, preparación para v1.x)

---

## 🎯 v1.0.0 — Release estable

**Criterios de entrada a v1.0.0**:
- [ ] Sin bugs críticos abiertos
- [ ] Todos los módulos probados con los casos en `docs/TESTING.md`
- [ ] Backup/restore probado en producción real
- [ ] Documentación completa (`docs/`) actualizada
- [ ] Performance aceptable con ≥ 5 000 productos y ≥ 10 000 ventas
- [ ] Instalador empaquetado con `electron-builder` (`.exe` firmado)

**Incluye todo lo de v0.29 – v0.33 más**:
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
- [ ] **Autenticación y roles**: Admin / Cajero / Supervisor; permisos por módulo
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
