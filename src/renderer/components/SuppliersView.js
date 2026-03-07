import React, { useState, useEffect, useCallback } from 'react';

const s = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' },
  btnPrimary: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
  errorBox: {
    background: '#ffebee', color: '#a4262c', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  wrapper: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f7f7f7', padding: '10px 16px', textAlign: 'left',
    fontWeight: '700', fontSize: '11px', color: '#9e9e9e',
    borderBottom: '1px solid #e5e5e5', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '56px 32px', color: '#9e9e9e', fontSize: '15px' },
  btnEdit: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', marginRight: '6px', color: '#1a1a1a', fontWeight: '500',
  },
  btnDelete: {
    background: 'white', border: '1px solid #fad9d9',
    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', color: '#a4262c', fontWeight: '500',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '480px',
    maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden',
  },
  modalHeader: { padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
  modalTitle: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  modalBody: { padding: '18px 24px' },
  modalFooter: {
    padding: '14px 24px', borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
  },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '5px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', resize: 'vertical', minHeight: '64px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  btnCancel: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c',
  },
  btnSave: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function SupplierModal({ supplier, onSave, onCancel }) {
  const isEdit = Boolean(supplier);
  const [form, setForm] = useState({
    name: supplier?.name ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    notes: supplier?.notes ?? '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.modalBody}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input className="fl-input" style={s.input} value={form.name} onChange={set('name')} required autoFocus placeholder="Nombre del proveedor" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={s.field}>
                <label style={s.label}>Teléfono</label>
                <input className="fl-input" style={s.input} value={form.phone} onChange={set('phone')} placeholder="+506 0000-0000" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input className="fl-input" style={s.input} type="email" value={form.email} onChange={set('email')} placeholder="proveedor@ejemplo.com" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Dirección</label>
              <input className="fl-input" style={s.input} value={form.address} onChange={set('address')} placeholder="Dirección o zona" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Notas</label>
              <textarea className="fl-input" style={s.textarea} value={form.notes} onChange={set('notes')} placeholder="Observaciones, condiciones de pago, etc." />
            </div>
          </div>
          <div style={s.modalFooter}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave}>{isEdit ? 'Guardar cambios' : 'Crear proveedor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSuppliers(await window.electron.suppliers.getAll());
      setError(null);
    } catch {
      setError('Error al cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (modal === 'create') {
        await window.electron.suppliers.create(data);
      } else {
        await window.electron.suppliers.update(modal.supplier.id, data);
      }
      setModal(null);
      load();
    } catch {
      setError('Error al guardar el proveedor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await window.electron.suppliers.delete(id);
      load();
    } catch {
      setError('Error al eliminar el proveedor.');
    }
  };

  return (
    <>
      <div style={s.toolbar}>
        <h2 style={s.sectionTitle}>Proveedores</h2>
        <button className="fl-btn-primary" style={s.btnPrimary} onClick={() => setModal('create')}>+ Nuevo Proveedor</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={s.wrapper}>
          {suppliers.length === 0 ? (
            <p style={s.empty}>No hay proveedores registrados. Agrega el primero.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Teléfono</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Dirección</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="fl-tr">
                    <td style={{ ...s.td, fontWeight: '600' }}>{sup.name}</td>
                    <td style={{ ...s.td, color: sup.phone ? '#1a1a1a' : '#9e9e9e' }}>{sup.phone || '—'}</td>
                    <td style={{ ...s.td, color: sup.email ? '#1a1a1a' : '#9e9e9e' }}>{sup.email || '—'}</td>
                    <td style={{ ...s.td, color: sup.address ? '#1a1a1a' : '#9e9e9e' }}>{sup.address || '—'}</td>
                    <td style={s.td}>
                      <button className="fl-btn-secondary" style={s.btnEdit} onClick={() => setModal({ mode: 'edit', supplier: sup })}>Editar</button>
                      <button className="fl-btn-danger" style={s.btnDelete} onClick={() => handleDelete(sup.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <SupplierModal
          supplier={modal !== 'create' ? modal.supplier : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
