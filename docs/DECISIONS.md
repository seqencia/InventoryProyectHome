# Technical Decisions

Architecture choices made in this project, with rationale.

---

## SQLite como motor de base de datos

**Decisión**: SQLite embebido, sin servidor.

**Por qué**:
- Aplicación de escritorio single-user, offline-first. No hay concurrencia multi-proceso que requiera un servidor de BD.
- El archivo `.sqlite` es portable — backup = copiar un archivo.
- Integración nativa con TypeORM sin dependencias adicionales.
- Suficiente para miles de productos y años de historial de ventas en un negocio pequeño.

**Trade-off aceptado**: No escala a múltiples usuarios simultáneos. Si se necesita multi-usuario en el futuro, migrar a PostgreSQL requeriría cambiar solo el `DataSource` en `main.js`.

---

## TypeORM con `EntitySchema` (sin decoradores)

**Decisión**: Definir todos los schemas con `new EntitySchema({...})` en plain JS.

**Por qué**:
- El proceso principal de Electron (`main.js`) es CommonJS puro — no pasa por ningún compilador.
- Los decoradores TypeScript requieren `experimentalDecorators` + compilación. Usar `EntitySchema` elimina esa dependencia.
- Todo el acceso a BD en un solo archivo (`main.js`) facilita auditarlo y entender los datos de un vistazo.

**Trade-off aceptado**: Esquemas más verbosos que las clases con decoradores. Compensado por la simplicidad del pipeline de build.

---

## `synchronize: true` (auto-migración en startup)

**Decisión**: TypeORM aplica las diferencias de schema automáticamente al iniciar la app.

**Por qué**:
- Aplicación desktop de un solo usuario — no hay riesgo de migración coordinada entre instancias.
- Elimina la necesidad de escribir y gestionar archivos de migración para cada cambio de columna.
- Nuevas columnas con `nullable: true` o `default` se agregan sin romper datos existentes.

**Riesgo conocido**: Si se elimina una columna del schema, TypeORM **no** la elimina de la BD (SQLite no soporta `DROP COLUMN` en versiones antiguas). Datos huérfanos quedan en la BD sin problema funcional.

**Regla**: Al agregar columnas, siempre usar `nullable: true` o `default` para no romper registros existentes.

---

## esbuild como bundler del renderer

**Decisión**: JSX compilado con esbuild; sin webpack, sin Vite, sin CRA.

**Por qué**:
- esbuild es extremadamente rápido (sub-segundo para este proyecto).
- Configuración mínima: un solo comando en `package.json` (`build:renderer`).
- No se necesitan las features adicionales de Vite/webpack (HMR completo, code splitting, SSR) para una app Electron single-page sin rutas complejas.
- `npm run dev` combina `esbuild --watch` + Electron en un solo comando.

**Trade-off aceptado**: Sin HMR real (hot module replacement). Cambios en el renderer requieren recargar la ventana Electron (`Ctrl+R`). Aceptable en desarrollo activo.

---

## React 19 sin Create React App

**Decisión**: React instalado manualmente, renderizado con `createRoot`, sin CRA ni Next.js.

**Por qué**:
- CRA agrega ~1000 dependencias y una capa de configuración que no aporta en una app Electron.
- La app no necesita SSR, routing del lado servidor, ni optimización de assets estáticos.
- Control total sobre el pipeline: solo `index.html` + `bundle.js` + `preload.js`.

---

## Proceso único de acceso a BD (`main.js`)

**Decisión**: Todos los `EntitySchema`, el `DataSource` y los `ipcMain.handle` están en `main.js`.

**Por qué**:
- El renderer **nunca** accede directamente a Node.js o a la BD (`contextIsolation: true`).
- Mantener todo en un archivo evita la tentación de hacer queries desde el renderer.
- Facilita el audit de seguridad: solo hay un punto de entrada a los datos.

**Cuando crezca**: Si `main.js` supera las ~2000 líneas, extraer handlers a `src/main/handlers/` y schemas a `src/main/schemas/`, importándolos en `main.js`.

---

## `contextBridge` con un solo objeto `window.electron`

**Decisión**: Un único `contextBridge.exposeInMainWorld('electron', {...})` con todos los namespaces.

**Por qué**:
- Un solo punto de exposición hace que sea inmediatamente obvio qué capacidades tiene el renderer.
- Fácil de auditar: toda la superficie de API está en `preload.js` (~60 líneas).
- Namespaces (`products`, `sales`, `returns`, ...) organizan los canales sin ambigüedad.

---

## Inline styles en el renderer (sin CSS externo ni Tailwind)

**Decisión**: Solo `style={{...}}` en JSX; efectos hover/focus vía clases globales en `GLOBAL_CSS` (`app.js`).

**Por qué**:
- Evita el overhead de configurar PostCSS, Tailwind, o CSS Modules con esbuild.
- Los estilos están colocados junto al markup — sin buscar en archivos separados.
- Para pseudo-clases (`:hover`, `:focus`) se usa una hoja de estilos inline inyectada en `<head>` desde `app.js`, que sí soporta selectores CSS.

**Trade-off aceptado**: Código de componente más largo. Compensado por la ausencia de archivos CSS que mantener.

---

## Snapshots en `sale_details` y `return_details`

**Decisión**: `product_name`, `unit_price`, `cost_price`, `discount_amount`, etc. se copian al registro de venta/devolución en el momento de la transacción.

**Por qué**:
- Los reportes históricos deben reflejar lo que ocurrió realmente, no los precios actuales.
- Si un producto cambia de nombre o precio, las ventas pasadas no se alteran.
- Simplifica las queries de reportes: sin JOINs complejos ni lógica temporal.

**Regla**: Estos campos son inmutables después de la creación. Nunca recalcularlos desde los precios actuales del producto.

---

## Validación server-side en handlers IPC críticos

**Decisión**: Las reglas de negocio críticas (cantidades de devolución, existencia de productos, totalQty > 0) se validan en `main.js`, no solo en la UI.

**Por qué**:
- El renderer puede ser manipulado (DevTools, IPC directo). La BD debe quedar consistente independientemente del cliente.
- Un error de validación en el handler lanza `throw new Error(mensaje)` que llega al renderer como `err.message` y se muestra al usuario.

---

## Backup como copia de archivo

**Decisión**: Backup = `fs.copyFileSync(database.sqlite, destino)`.

**Por qué**:
- SQLite garantiza consistencia del archivo cuando no hay escrituras activas (WAL mode o en reposo).
- No se necesita pg_dump ni lógica especial — una copia del archivo es suficiente para restaurar completamente.
- Restauración atómica: destruir y reinicializar el `DataSource` asegura que TypeORM no mantenga handles al archivo antiguo.
