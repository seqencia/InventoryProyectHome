# Code Patterns

Canonical patterns used throughout this project. Follow these exactly when adding new features.

---

## 1. Crear un handler IPC en `main.js`

### Paso 1 — Definir el `EntitySchema` (si es una nueva entidad)

```js
// En src/main/main.js, sección "── Schemas ──"

const WidgetSchema = new EntitySchema({
  name: 'Widget',
  tableName: 'widgets',
  columns: {
    id:         { type: Number, primary: true, generated: true },
    name:       { type: String },
    value:      { type: 'decimal', precision: 16, scale: 6, nullable: true },
    product_id: { type: Number, index: true },          // index en FK y fechas
    created_at: { type: 'datetime', createDate: true, index: true },
  },
});
```

Agregar al array `DataSource.entities[]`:
```js
entities: [..., WidgetSchema],
```

### Paso 2 — Registrar los handlers dentro de `setupIpcHandlers()`

```js
// Patrón estándar CRUD

ipcMain.handle('widgets:getAll', async () => {
  const repo = AppDataSource.getRepository('Widget');
  return repo.find({ order: { created_at: 'DESC' } });
});

ipcMain.handle('widgets:create', async (_event, data) => {
  const repo = AppDataSource.getRepository('Widget');
  const entity = repo.create(data);
  return repo.save(entity);
});

ipcMain.handle('widgets:update', async (_event, { id, ...data }) => {
  const repo = AppDataSource.getRepository('Widget');
  await repo.update(id, data);
  return repo.findOneBy({ id });
});

ipcMain.handle('widgets:delete', async (_event, id) => {
  const repo = AppDataSource.getRepository('Widget');
  await repo.delete(id);
  return { success: true };
});
```

### Patrón de transacción (operaciones multi-tabla)

```js
ipcMain.handle('widgets:createWithStock', async (_event, data) => {
  return AppDataSource.transaction(async (manager) => {
    const widget = manager.create('Widget', data);
    await manager.save(widget);

    await manager.increment('Product', { id: data.product_id }, 'stock', data.quantity);
    return widget;
  });
});
```

### Helper de precisión monetaria

```js
const r6 = (v) => parseFloat(Number(v).toFixed(6));   // 6 decimales — DB storage
const r2 = (v) => parseFloat(Number(v).toFixed(2));   // 2 decimales — display / totals
```

---

## 2. Exponer el canal en `preload.js`

Agregar el namespace al objeto único de `contextBridge.exposeInMainWorld`:

```js
// src/main/preload.js

contextBridge.exposeInMainWorld('electron', {
  // ... namespaces existentes ...

  widgets: {
    getAll:   ()           => ipcRenderer.invoke('widgets:getAll'),
    create:   (data)       => ipcRenderer.invoke('widgets:create', data),
    update:   (id, data)   => ipcRenderer.invoke('widgets:update', { id, ...data }),
    delete:   (id)         => ipcRenderer.invoke('widgets:delete', id),
  },
});
```

Reglas:
- El nombre del namespace en `window.electron` debe coincidir con el prefijo del canal IPC
- Un único `contextBridge.exposeInMainWorld` — no crear llamadas adicionales
- Nunca exponer módulos Node/Electron directamente (solo funciones que invocan IPC)

---

## 3. Consumir en un componente React

```jsx
// src/renderer/components/WidgetsView.js

import React, { useState, useEffect } from 'react';

export default function WidgetsView() {
  const [widgets, setWidgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    window.electron.widgets.getAll()
      .then(setWidgets)
      .catch(() => setError('Error al cargar los widgets.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────
  async function handleCreate(data) {
    try {
      const created = await window.electron.widgets.create(data);
      setWidgets(prev => [created, ...prev]);
    } catch (err) {
      setError(err.message || 'Error al crear el widget.');
    }
  }

  async function handleDelete(id) {
    try {
      await window.electron.widgets.delete(id);
      setWidgets(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar.');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) return <div style={{ padding: 32 }}>Cargando...</div>;

  return (
    <div style={{ padding: 24, background: '#f3f3f3', minHeight: '100vh' }}>
      {error && (
        <div style={{ color: '#a4262c', background: '#ffebee', padding: '8px 16px',
                      borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {/* tabla / contenido */}
    </div>
  );
}
```

Reglas:
- Siempre `try/catch` en handlers que modifican datos
- El error de IPC llega como `err.message` (texto de `throw new Error(...)` en `main.js`)
- Actualizar estado local optimísticamente o re-fetch según conveniencia
- Nunca `require()` ni `import` módulos Node/Electron en el renderer

---

## 4. Estructura estándar de componente

```
ComponentView.js
├── imports (solo React + otros componentes renderer)
├── constantes / estilos inline reusables al tope del archivo
├── export default function ComponentView()
│   ├── useState — datos, loading, error, modal state
│   ├── useEffect — carga inicial con .catch()
│   ├── handlers (handleCreate, handleUpdate, handleDelete, ...)
│   └── return JSX
│       ├── wrapper div (padding: 24, background: '#f3f3f3', minHeight: '100vh')
│       ├── header row (título + botón primario)
│       ├── error banner (condicional)
│       ├── tabla principal
│       └── modal (condicional, frosted overlay)
└── sub-componentes inline (Modal, Form) si son pequeños y solo se usan aquí
```

### Estilos — reglas

- **Solo `style={{...}}` inline** — sin archivos CSS, sin Tailwind
- Efectos hover/focus → usar `className` de las clases globales definidas en `app.js` (`GLOBAL_CSS`)
  - Botones: `.fl-btn-primary`, `.fl-btn-secondary`, `.fl-btn-ghost`, `.fl-btn-danger`
  - Inputs: `.fl-input`, `.fl-select`
  - Filas de tabla: `.fl-tr`, `.fl-tr-amber`
- Colores del sistema: `#0078d4` azul primario · `#f3f3f3` fondo · `#107c10` verde confirmación
- Modales: overlay `rgba(0,0,0,0.4)` + `backdropFilter: 'blur(8px)'`; tarjeta `borderRadius: 12`

### Añadir el componente como tab

En `src/renderer/app.js`, agregar al array `TABS`:
```js
{ id: 'widgets', label: '🔧 Widgets', component: WidgetsView },
```

---

## 5. Patrón de modal

```jsx
{showModal && (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: 12,
      padding: 24, width: 480, maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
        Título del modal
      </h3>
      {/* contenido */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="fl-btn-secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </button>
        <button className="fl-btn-primary" onClick={handleConfirm}>
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
```
