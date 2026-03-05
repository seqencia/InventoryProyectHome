import React, { useState } from 'react';

const CATEGORIES = [
  'Computadoras',
  'Monitores',
  'Periféricos',
  'Accesorios',
  'Sillas de Oficina',
  'Otro',
];

const styles = {
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
    padding: '28px',
    width: '480px',
    maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '17px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1e293b',
  },
  field: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '8px 11px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '8px 11px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px 11px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '70px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '22px',
  },
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

export default function ProductForm({ product, onSave, onCancel }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    description: product?.description ?? '',
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      category: form.category || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      description: form.description.trim() || null,
    });
  };

  const closeOnBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div style={styles.overlay} onClick={closeOnBackdrop}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre *</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={set('name')}
              placeholder="Ej: Laptop Dell Latitude 5490"
              required
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Categoría</label>
            <select style={styles.select} value={form.category} onChange={set('category')}>
              <option value="">Seleccionar categoría...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Precio ($) *</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0.00"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Stock *</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={set('stock')}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <textarea
              style={styles.textarea}
              value={form.description}
              onChange={set('description')}
              placeholder="Detalles del producto (modelo, condición, etc.)"
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.btnCancel} onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnSave}>
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
