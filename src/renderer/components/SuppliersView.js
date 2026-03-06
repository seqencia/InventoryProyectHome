import React, { useState, useEffect, useCallback } from 'react';

const s = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b' },
  btnPrimary: {
    background: '#3b82f6', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
  errorBox: {
    background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
  },
  wrapper: { background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f8fafc', padding: '10px 14px', textAlign: 'left',
    fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
  },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' },
  btnEdit: {
    background: '#f1f5f9', border: 'none', padding: '5px 11px', borderRadius: '4px',
    cursor: 'pointer', fontSize: '12px', marginRight: '5px', color: '#334155',
  },
  btnDelete: {
    background: '#fee2e2', border: 'none', padding: '5px 11px',
    borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#dc2626',
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '480px',
    maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
  },
  modalHeader: { padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 },
  modalBody: { padding: '16px 22px' },
  modalFooter: {
    padding: '14px 22px', borderTop: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
  },
  field: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' },
  input: {
    width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', resize: 'vertical', minHeight: '64px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  btnCancel: {
    background: '#f1f5f9', border: 'none', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#475569',
  },
  btnSave: {
    background: '#3b82f6', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
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
              <input style={s.input} value={form.name} onChange={set('name')} required autoFocus placeholder="Nombre del proveedor" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={s.field}>
                <label style={s.label}>Teléfono</label>
                <input style={s.input} value={form.phone} onChange={set('phone')} placeholder="+506 0000-0000" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" value={form.email} onChange={set('email')} placeholder="proveedor@ejemplo.com" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Dirección</label>
              <input style={s.input} value={form.address} onChange={set('address')} placeholder="Dirección o zona" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Notas</label>
              <textarea style={s.textarea} value={form.notes} onChange={set('notes')} placeholder="Observaciones, condiciones de pago, etc." />
            </div>
          </div>
          <div style={s.modalFooter}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.btnSave}>{isEdit ? 'Guardar cambios' : 'Crear proveedor'}</button>
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
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', supplier }

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
        <button style={s.btnPrimary} onClick={() => setModal('create')}>+ Nuevo Proveedor</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
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
                  <tr key={sup.id}>
                    <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>{sup.name}</td>
                    <td style={{ ...s.td, color: sup.phone ? '#334155' : '#94a3b8' }}>{sup.phone || '—'}</td>
                    <td style={{ ...s.td, color: sup.email ? '#334155' : '#94a3b8' }}>{sup.email || '—'}</td>
                    <td style={{ ...s.td, color: sup.address ? '#334155' : '#94a3b8' }}>{sup.address || '—'}</td>
                    <td style={s.td}>
                      <button style={s.btnEdit} onClick={() => setModal({ mode: 'edit', supplier: sup })}>Editar</button>
                      <button style={s.btnDelete} onClick={() => handleDelete(sup.id)}>Eliminar</button>
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
