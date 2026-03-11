# UI Components

Catalog of reusable UI patterns used across the renderer. All components use **inline styles only**; hover/focus effects use CSS classes from `GLOBAL_CSS` in `app.js`.

See [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) for color tokens and spacing values.

---

## Botones

### Primario

```jsx
<button
  className="fl-btn-primary"
  style={{
    background: '#0078d4', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '8px 20px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  }}
  onClick={handleAction}
>
  Guardar
</button>
```

### Secundario

```jsx
<button
  className="fl-btn-secondary"
  style={{
    background: '#fff', color: '#1a1a1a',
    border: '1px solid #d1d1d1', borderRadius: 8,
    padding: '8px 20px', fontSize: 13,
    cursor: 'pointer',
  }}
  onClick={onCancel}
>
  Cancelar
</button>
```

### Peligro (Danger)

```jsx
<button
  className="fl-btn-danger"
  style={{
    background: '#fff', color: '#a4262c',
    border: '1px solid #ef9a9a', borderRadius: 8,
    padding: '8px 16px', fontSize: 13,
    cursor: 'pointer',
  }}
  onClick={handleDelete}
>
  Eliminar
</button>
```

### Confirmar venta (verde)

```jsx
<button
  className="fl-btn-primary"
  style={{
    background: '#107c10', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '12px 24px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', width: '100%',
  }}
  disabled={cart.length === 0}
  onClick={handleConfirmSale}
>
  Confirmar Venta
</button>
```

### Ghost (texto)

```jsx
<button
  className="fl-btn-ghost"
  style={{
    background: 'transparent', border: 'none',
    color: '#0078d4', fontSize: 13,
    cursor: 'pointer', padding: '4px 8px',
  }}
>
  Ver todas →
</button>
```

---

## Badges de estado

Patrón: `{ background, color }` del sistema de colores. Ver tabla completa en `DESIGN-SYSTEM.md`.

```jsx
// Función helper recomendada
function StatusBadge({ status }) {
  const styles = {
    Completada:    { bg: '#e8f5e9', color: '#2e7d32' },
    Cancelada:     { bg: '#ffebee', color: '#a4262c' },
    Pendiente:     { bg: '#fff8e1', color: '#8a5700' },
    Devuelta:      { bg: '#f3e5f5', color: '#6a1b9a' },
    Parcial:       { bg: '#fff3e0', color: '#e65100' },
    Disponible:    { bg: '#e8f5e9', color: '#2e7d32' },
    Reservado:     { bg: '#e3f2fd', color: '#1565c0' },
    Vendido:       { bg: '#ffebee', color: '#a4262c' },
    'En reparación': { bg: '#fff8e1', color: '#8a5700' },
  };
  const s = styles[status] || { bg: '#f5f5f5', color: '#5c5c5c' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: '2px 10px',
      fontSize: 12, fontWeight: 600,
    }}>
      {status}
    </span>
  );
}
```

### Badge de condición de producto

```jsx
function CondicionBadge({ condicion }) {
  const map = {
    Nuevo:            { bg: '#e8f5e9', color: '#2e7d32' },
    Bueno:            { bg: '#e3f2fd', color: '#1565c0' },
    Regular:          { bg: '#fff8e1', color: '#8a5700' },
    'Para reparar':   { bg: '#ffebee', color: '#a4262c' },
  };
  const s = map[condicion] || { bg: '#f5f5f5', color: '#5c5c5c' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
    }}>
      {condicion}
    </span>
  );
}
```

### Badge de método de pago

```jsx
function MetodoBadge({ metodo }) {
  const map = {
    Efectivo:      { bg: '#e8f5e9', color: '#2e7d32' },
    Tarjeta:       { bg: '#e3f2fd', color: '#1565c0' },
    Transferencia: { bg: '#ede7f6', color: '#6a1b9a' },
  };
  const s = map[metodo] || { bg: '#f5f5f5', color: '#5c5c5c' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {metodo}
    </span>
  );
}
```

### Badge de regalía / bonificación

```jsx
// 🎁 Regalía propia
<span style={{
  background: '#f3e5f5', color: '#6a1b9a',
  borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700,
}}>
  🎁 REGALÍA
</span>

// 📦 Bonificación proveedor
<span style={{
  background: '#e3f2fd', color: '#1565c0',
  borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700,
}}>
  📦 BONIF.
</span>
```

---

## Inputs y Selects

```jsx
// Input de texto estándar
<input
  className="fl-input"
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Buscar..."
  style={{
    width: '100%', padding: '8px 12px',
    border: '1px solid #d1d1d1', borderRadius: 8,
    fontSize: 13, outline: 'none',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  }}
/>

// Select estándar
<select
  className="fl-select"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  style={{
    width: '100%', padding: '8px 12px',
    border: '1px solid #d1d1d1', borderRadius: 8,
    fontSize: 13, outline: 'none', background: '#fff',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  }}
>
  <option value="">Seleccionar...</option>
  <option value="a">Opción A</option>
</select>
```

### Input con label (forma compuesta)

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
  <label style={{ fontSize: 12, fontWeight: 600, color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
    Nombre <span style={{ color: '#a4262c' }}>*</span>
  </label>
  <input
    className="fl-input"
    type="text"
    required
    value={form.name}
    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
    style={{ padding: '8px 12px', border: '1px solid #d1d1d1', borderRadius: 8, fontSize: 13, outline: 'none' }}
  />
</div>
```

---

## Modal (overlay frosted glass)

```jsx
{showModal && (
  <div
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
  >
    <div style={{
      background: '#fff', borderRadius: 12,
      width: 480, maxHeight: '90vh',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Título del modal</h3>
      </div>

      {/* Body (scrollable) */}
      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
        {/* contenido */}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid #f0f0f0',
        display: 'flex', gap: 8, justifyContent: 'flex-end',
      }}>
        <button className="fl-btn-secondary" onClick={() => setShowModal(false)}
          style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #d1d1d1', background: '#fff', fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
        <button className="fl-btn-primary" onClick={handleConfirm}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0078d4', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
```

---

## Tarjeta (Card)

```jsx
<div style={{
  background: '#fff', borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 20,
}}>
  {/* contenido */}
}
</div>
```

### Tarjeta con acento de color (Dashboard KPI)

```jsx
<div style={{
  background: '#fff', borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 20,
  borderTop: '3px solid #0078d4',   // color del acento
}}>
  <div style={{ fontSize: 12, fontWeight: 600, color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Ventas Hoy
  </div>
  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', marginTop: 8 }}>
    {value}
  </div>
  <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 4 }}>
    subtexto opcional
  </div>
</div>
```

---

## Tabla estándar

```jsx
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      {['#', 'Nombre', 'Stock', 'Acciones'].map(col => (
        <th key={col} style={{
          padding: '8px 12px', textAlign: 'left',
          fontSize: 11, fontWeight: 700, color: '#9e9e9e',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          borderBottom: '2px solid #f0f0f0',
        }}>
          {col}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {rows.map(row => (
      <tr key={row.id} className="fl-tr">
        <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
          {row.id}
        </td>
        {/* más celdas */}
      </tr>
    ))}
  </tbody>
</table>
```

### Fila con alerta de stock bajo

```jsx
<tr key={product.id} className={product.stock <= product.min_stock ? 'fl-tr-amber' : 'fl-tr'}>
```

---

## Banner de error / éxito

```jsx
// Error
{error && (
  <div style={{
    background: '#ffebee', color: '#a4262c',
    border: '1px solid #ffcdd2',
    borderRadius: 8, padding: '10px 16px',
    fontSize: 13, marginBottom: 16,
  }}>
    {error}
  </div>
)}

// Éxito
{success && (
  <div style={{
    background: '#e8f5e9', color: '#2e7d32',
    border: '1px solid #c8e6c9',
    borderRadius: 8, padding: '10px 16px',
    fontSize: 13, marginBottom: 16,
  }}>
    {success}
  </div>
)}
```

---

## Estado vacío (empty state)

```jsx
{items.length === 0 && (
  <div style={{
    textAlign: 'center', padding: '48px 24px',
    color: '#9e9e9e', fontSize: 14,
  }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
    No hay registros aún.
  </div>
)}
```

---

## Loading state

```jsx
{loading && (
  <div style={{ padding: 32, textAlign: 'center', color: '#9e9e9e', fontSize: 14 }}>
    Cargando...
  </div>
)}
```

---

## Toggle switch

```jsx
function Toggle({ enabled, onChange }) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: enabled ? '#0078d4' : '#d1d1d1',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: enabled ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}
```

---

## Selector de cliente (type-to-search dropdown)

Patrón usado en `NewSale.js`:

```jsx
// Estado
const [customerQuery, setCustomerQuery] = useState('');
const [customerResults, setCustomerResults] = useState([]);
const [selectedCustomer, setSelectedCustomer] = useState(null);

// Render
{selectedCustomer ? (
  // Pill del cliente seleccionado
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{
      background: '#e3f2fd', color: '#1565c0',
      borderRadius: 20, padding: '4px 12px', fontSize: 13,
    }}>
      {selectedCustomer.name}
    </span>
    <button onClick={() => setSelectedCustomer(null)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9e9e', fontSize: 16 }}>
      ×
    </button>
  </div>
) : (
  <div style={{ position: 'relative' }}>
    <input
      className="fl-input"
      placeholder="Buscar cliente..."
      value={customerQuery}
      onChange={(e) => {
        setCustomerQuery(e.target.value);
        const q = e.target.value.toLowerCase();
        setCustomerResults(q.length >= 1
          ? customers.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q)).slice(0, 5)
          : []);
      }}
      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1', borderRadius: 8, fontSize: 13, outline: 'none' }}
    />
    {customerResults.length > 0 && (
      <div style={{
        position: 'absolute', top: '100%', left: 0, right: 0,
        background: '#fff', border: '1px solid #e0e0e0',
        borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 200, overflow: 'hidden',
      }}>
        {customerResults.map(c => (
          <div key={c.id} className="fl-option"
            onClick={() => { setSelectedCustomer(c); setCustomerQuery(''); setCustomerResults([]); }}
            style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13 }}>
            <strong>{c.name}</strong>
            {c.phone && <span style={{ color: '#9e9e9e', marginLeft: 8 }}>{c.phone}</span>}
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

---

## Desglose de totales (cart summary)

Patrón del carrito en `NewSale.js`:

```jsx
<div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 12, marginTop: 12 }}>
  {[
    ['Subtotal bruto',   `$${subtotalBruto.toFixed(2)}`],
    ['Desc. por línea',  `-$${lineDiscountsTotal.toFixed(2)}`, lineDiscountsTotal > 0],
    ['Desc. global',     `-$${globalDiscAmount.toFixed(2)}`,  globalDiscAmount > 0],
    ['Subtotal neto',    `$${subtotalNeto.toFixed(2)}`],
    ['Regalías',         '$0.00',                             regaliaCount > 0],
    ['IVA (13%)',        `$${tax.toFixed(2)}`],
  ].map(([label, value, show = true]) => show && (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5c5c5c', marginBottom: 4 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ))}
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#0078d4', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
    <span>Total</span>
    <span>${total.toFixed(2)}</span>
  </div>
</div>
```

---

## Sección de página (layout wrapper)

```jsx
<div style={{ padding: 24, background: '#f3f3f3', minHeight: '100vh' }}>
  {/* Header de página */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
      Título del módulo
    </h2>
    <button className="fl-btn-primary"
      style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0078d4', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      onClick={() => setShowModal(true)}>
      + Nuevo
    </button>
  </div>

  {/* Contenido */}
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
    {/* tabla u otro contenido */}
  </div>
</div>
```
