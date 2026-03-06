import React, { useState, useEffect } from 'react';

const CONDITIONS = ['Nuevo', 'Bueno', 'Regular', 'Para reparar'];
const STATUSES = ['Disponible', 'Reservado', 'Vendido', 'En reparación'];

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '580px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  title: { fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: 0 },
  body: { padding: '0 24px', overflowY: 'auto', flex: 1 },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  // Section
  section: { paddingTop: '16px', paddingBottom: '4px' },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '12px',
    paddingBottom: '6px',
    borderBottom: '1px solid #f1f5f9',
  },
  // Fields
  field: { marginBottom: '12px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '4px',
  },
  hint: { fontSize: '11px', color: '#94a3b8', marginTop: '3px' },
  input: {
    width: '100%',
    padding: '7px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '7px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    background: 'white',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '7px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    resize: 'vertical',
    minHeight: '64px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  grid4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' },
  // Buttons
  btnCancel: {
    background: '#f1f5f9',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
  },
  btnSave: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

function SectionTitle({ children }) {
  return <div style={s.sectionTitle}>{children}</div>;
}

export default function ProductForm({ product, onSave, onCancel }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    serial_number: product?.serial_number ?? '',
    condition: product?.condition ?? '',
    status: product?.status ?? 'Disponible',
    cost_price: product?.cost_price ?? '',
    sale_price: product?.sale_price ?? '',
    offer_price: product?.offer_price ?? '',
    stock: product?.stock ?? '',
    min_stock: product?.min_stock ?? 5,
    category: product?.category ?? '',
    location: product?.location ?? '',
    description: product?.description ?? '',
    technical_notes: product?.technical_notes ?? '',
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    window.electron.categories.getAll().then(setCategories).catch(() => {});
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      barcode: form.barcode.trim() || null,
      serial_number: form.serial_number.trim() || null,
      condition: form.condition || null,
      status: form.status || 'Disponible',
      cost_price: form.cost_price !== '' ? parseFloat(form.cost_price) : null,
      sale_price: parseFloat(form.sale_price),
      offer_price: form.offer_price !== '' ? parseFloat(form.offer_price) : null,
      stock: parseInt(form.stock, 10),
      min_stock: form.min_stock !== '' ? parseInt(form.min_stock, 10) : 5,
      category: form.category || null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      technical_notes: form.technical_notes.trim() || null,
    });
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div style={s.body}>

            {/* ── Identificación ──────────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Identificación</SectionTitle>

              <div style={s.field}>
                <label style={s.label}>Nombre *</label>
                <input
                  style={s.input}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Ej: Laptop Dell Latitude 5490"
                  required
                  autoFocus
                />
              </div>

              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>SKU / Código</label>
                  <input
                    style={s.input}
                    value={form.sku}
                    onChange={set('sku')}
                    placeholder="Ej: PRD-001"
                  />
                  <div style={s.hint}>Se genera automáticamente si se deja vacío</div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Código de barras</label>
                  <input
                    style={s.input}
                    value={form.barcode}
                    onChange={set('barcode')}
                    placeholder="Escanear o ingresar"
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Número de serie</label>
                <input
                  style={s.input}
                  value={form.serial_number}
                  onChange={set('serial_number')}
                  placeholder="Importante para equipos reacondicionados"
                />
              </div>
            </div>

            {/* ── Condición y estado ──────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Condición y Estado</SectionTitle>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Condición</label>
                  <select style={s.select} value={form.condition} onChange={set('condition')}>
                    <option value="">Sin especificar</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Estado</label>
                  <select style={s.select} value={form.status} onChange={set('status')}>
                    {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Precios ─────────────────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Precios</SectionTitle>
              <div style={s.grid3}>
                <div style={s.field}>
                  <label style={s.label}>Precio de costo ($)</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price}
                    onChange={set('cost_price')}
                    placeholder="0.00"
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Precio de venta ($) *</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={set('sale_price')}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Precio oferta ($)</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.offer_price}
                    onChange={set('offer_price')}
                    placeholder="Vacío = sin oferta"
                  />
                </div>
              </div>
            </div>

            {/* ── Inventario ──────────────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Inventario y Ubicación</SectionTitle>
              <div style={s.grid4}>
                <div style={s.field}>
                  <label style={s.label}>Stock *</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={set('stock')}
                    placeholder="0"
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Stock mínimo</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="1"
                    value={form.min_stock}
                    onChange={set('min_stock')}
                    placeholder="5"
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Categoría</label>
                  <select style={s.select} value={form.category} onChange={set('category')}>
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <div style={s.hint}>Gestiona categorías en la pestaña "Categorías"</div>
                  )}
                </div>
                <div style={s.field}>
                  <label style={s.label}>Ubicación física</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={set('location')}
                    placeholder="Ej: Estante A3"
                  />
                </div>
              </div>
            </div>

            {/* ── Notas ───────────────────────────────────────────── */}
            <div style={{ ...s.section, paddingBottom: '16px' }}>
              <SectionTitle>Descripción y Notas</SectionTitle>
              <div style={s.field}>
                <label style={s.label}>Descripción</label>
                <textarea
                  style={s.textarea}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Descripción general del producto"
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Notas técnicas</label>
                <textarea
                  style={{ ...s.textarea, minHeight: '56px' }}
                  value={form.technical_notes}
                  onChange={set('technical_notes')}
                  placeholder="Reparaciones, detalles técnicos, observaciones..."
                />
              </div>
            </div>

          </div>

          <div style={s.footer}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" style={s.btnSave}>
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
