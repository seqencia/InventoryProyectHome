# Roadmap

Semantic versioning: `0.x.x` = pre-release (active development), `1.0.0` = stable production release.

---

## ✅ v0.33.0 — Estado actual (2026-03-13)

### Completado en esta versión

- **Ajuste manual de inventario** — tabla `inventory_adjustments`, modal con modos agregar/reducir/establecer, motivo, preview de stock, auditoría automática
- **Timeline de movimientos por producto** — agrega entradas, ventas, devoluciones y ajustes en cronología inversa; modal "📊 Historial" en Catálogo
- **Foto del producto** — campo `photo_path` en Product, dialog de selección, copia local en `userData/photos/`, base64 en renderer, modal de gestión
- **Alertas de stock bajo** — Electron `Notification` al iniciar app y tras ajustes manuales
- **Editar venta Pendiente** — handler `sales:edit` con restauración de stock, modal con búsqueda, edición de cantidades y recálculo de totales

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

## ✅ v0.32.0 — Audit Log & Activity Tracking (completado 2026-03-12)

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

## ✅ v0.33.0 — Inventario avanzado (completado 2026-03-13)

- [x] Ajuste de inventario manual (corrección de conteo físico) con motivo y log de auditoría
- [x] Vista de movimientos de stock por producto (entradas + salidas + devoluciones en una línea de tiempo)
- [x] Inventario con foto del producto (imagen local, opcional)
- [x] Alertas de stock bajo por notificación de sistema (Electron `Notification`)
- [x] Editar venta en estado `Pendiente` antes de confirmar (agregar/quitar ítems)

---

## 🔜 v0.34.0 — Reportes y analítica avanzada

- [ ] Reporte de rentabilidad por categoría (margen %)
- [ ] Reporte de productos sin movimiento (sin ventas en N días)
- [ ] Reporte de devoluciones: tasa por producto, razón más común
- [ ] Comparativa de períodos (este mes vs mes anterior)
- [ ] Gráfica de tendencia de utilidad diaria/semanal
- [ ] Export PDF de reportes (usando `window.print()` sobre la vista de reportes)

### Panel de Inteligencia de Inventario ("Tambor")

Dashboard analítico dedicado que cruza datos de ventas históricas con el stock actual para clasificar y priorizar el inventario.

#### Métricas por producto

| Métrica | Descripción |
|---|---|
| Promedio de ventas 3 meses | Unidades vendidas / 90 días |
| Promedio de ventas 6 meses | Unidades vendidas / 180 días |
| Tendencia | Comparación 3 m vs 6 m (↑ acelerando / ↓ desacelerando / → estable) |
| Días de cobertura | `stock_actual / promedio_diario_3m` |
| Peso % de stock | `stock_valor_producto / stock_valor_total × 100` |

#### Clasificación de productos (5 categorías)

| Clasificación | Criterio | Color |
|---|---|---|
| **Sobreventa** | Días de cobertura < umbral mínimo (ej. < 15 días) | 🔴 Rojo |
| **Target** | Días de cobertura dentro del rango óptimo | 🟢 Verde |
| **Subventa** | Días de cobertura > umbral máximo (ej. > 90 días) | 🟡 Amarillo |
| **Sin venta** | Stock > 0 pero sin ventas en los últimos 90 días | 🟠 Naranja |
| **Sin inventario** | Stock = 0 (independiente de la demanda) | ⚫ Gris |

#### Análisis Pareto 80/20

- Ranking de productos por ingresos acumulados en el período seleccionado
- Curva Pareto: línea que muestra qué % de productos genera el 80 % de los ingresos
- Identificación visual del corte 80/20 en la tabla

#### Ranking por quintil de velocidad de ventas

Divide los productos (con ventas > 0) en 5 quintiles según su promedio de ventas diario:

| Quintil | Descripción |
|---|---|
| Q1 (top 20 %) | Rotación muy alta |
| Q2 | Rotación alta |
| Q3 | Rotación media |
| Q4 | Rotación baja |
| Q5 (bottom 20 %) | Rotación muy baja |

#### UI del panel

- Pestaña dedicada "Tambor" o sección dentro de Reportes (solo Admin)
- Selector de período de análisis (3 m / 6 m / personalizado)
- Umbrales de cobertura configurables (mínimo y máximo en días)
- Tabla principal con columnas: Producto, SKU, Stock, Ventas 3m, Ventas 6m, Tendencia, Días cobertura, Peso %, Quintil, Clasificación (badge con color)
- Filtros: por clasificación, por categoría, por quintil
- Resumen KPI en tarjetas: total SKUs por clasificación, valor de inventario en riesgo (Sobreventa + Sin inventario), valor inmovilizado (Subventa + Sin venta)
- Export CSV del análisis completo

---

## 🔜 v0.35.0 — Inteligencia Comercial Avanzada

Métricas analíticas profundas por producto, orientadas a la toma de decisiones de compra, pricing y gestión de obsolescencia. Complementa el panel Tambor de v0.34.0 con indicadores de rotación, rentabilidad, riesgo y comportamiento de demanda.

### Métricas de rotación

| Métrica | Descripción |
|---|---|
| Tasa de rotación de inventario | Veces que se vendió el stock completo en el período (`unidades_vendidas / stock_promedio`) |
| DSI — Days Sales of Inventory | Días estimados hasta agotar el stock actual (`stock_actual / ventas_diarias_promedio`) |
| Velocidad de ventas | Unidades/día promedio en el período seleccionado |

### Métricas de rentabilidad

| Métrica | Descripción |
|---|---|
| Margen bruto % | `(precio_venta - costo) / precio_venta × 100` por producto |
| Contribución al margen total % | Participación de cada SKU en la utilidad bruta total del período |
| ROI de inventario | `utilidad_generada / (costo × stock_promedio)` — retorno sobre la inversión en inventario |

### Métricas de riesgo

| Métrica | Descripción |
|---|---|
| Riesgo de quiebre de stock | Días hasta stockout con alerta si DSI < umbral configurable (ej. 15 días) |
| Stock óptimo sugerido | `ventas_diarias_promedio × (días_reposición + días_cobertura_objetivo)` |
| Riesgo de obsolescencia | Producto sin ventas en 60+ días con stock > 0; clasificado como crítico si > 120 días |

### Métricas de comportamiento

| Métrica | Descripción |
|---|---|
| Estacionalidad | Mes con mayor y menor venta histórica por producto; índice de estacionalidad mensual |
| Frecuencia de reabastecimiento | Conteo de entradas de stock en el período; intervalo promedio entre entradas |
| Coeficiente de variación | `desviación_estándar_ventas / media_ventas` — índice de estabilidad de la demanda (bajo = predecible, alto = errática) |

### Visualización

#### Matriz BCG simplificada

Clasifica productos en cuatro cuadrantes según participación en ingresos (eje X) y crecimiento de ventas (eje Y comparando períodos):

| Cuadrante | Criterio | Acción sugerida |
|---|---|---|
| ⭐ Estrella | Alta participación + alto crecimiento | Mantener stock, priorizar |
| 🐄 Vaca lechera | Alta participación + bajo crecimiento | Optimizar margen, no descuidar |
| ❓ Interrogante | Baja participación + alto crecimiento | Evaluar inversión, monitorear |
| 🐕 Perro | Baja participación + bajo crecimiento | Reducir stock, considerar descontinuar |

#### Mapa de calor de ventas

- Grilla mes × producto (o mes × categoría) con intensidad de color según unidades o ingresos
- Período configurable (últimos 6 m / 12 m)
- Permite identificar patrones estacionales de un vistazo

### UI del módulo

- Pestaña "Inteligencia" dentro de Reportes (solo Admin)
- Selector de período de análisis y umbral de días de reposición (configurable)
- Tabla principal con todas las métricas por SKU, ordenable por cualquier columna
- Filtros: por clasificación de riesgo, por cuadrante BCG, por categoría
- Tarjetas KPI: SKUs en riesgo de quiebre, valor inmovilizado en obsolescencia, margen promedio del catálogo
- Gráfico de dispersión para la matriz BCG (participación vs. crecimiento)
- Mapa de calor de ventas interactivo
- Export CSV con todas las métricas calculadas

---

## 🔜 v0.36.0 — Clientes y fidelización

- [ ] Historial de compras por cliente (ventas + montos + productos)
- [ ] Notas internas por cliente
- [ ] Búsqueda de cliente por teléfono en Nueva Venta (no solo nombre)
- [ ] Saldo pendiente por cliente (ventas en estado `Pendiente`)

---

## 🔜 v0.37.0 — Configuración avanzada

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

**Incluye todo lo de v0.32 – v0.37 más**:
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
