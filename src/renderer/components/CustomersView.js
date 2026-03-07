import React, { useState, useEffect, useCallback } from 'react';

const s = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' },
  btnPrimary: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500',
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
  empty: { textAlign: 'center', padding: '56px 32px', color: '#9e9e9e', fontSize: '15px' },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', padding: '28px',
    width: '440px', maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  modalTitle: { fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: '#1a1a1a' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '5px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '22px' },
  btnCancel: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c',
  },
  btnSave: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function CustomerModal({ customer, onSave, onCancel }) {
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    });
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Nombre *</label>
            <input className="fl-input" style={s.input} value={form.name} onChange={set('name')} placeholder="Nombre completo" required autoFocus />
          </div>
          <div style={s.field}>
            <label style={s.label}>Teléfono</label>
            <input className="fl-input" style={s.input} value={form.phone} onChange={set('phone')} placeholder="Ej: 555-1234" type="tel" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input className="fl-input" style={s.input} value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" type="email" />
          </div>
          <div style={s.actions}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave}>{isEdit ? 'Guardar cambios' : 'Crear cliente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setCustomers(await window.electron.customers.getAll());
      setError(null);
    } catch {
      setError('Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData) => {
    try {
      if (modal === 'create') {
        await window.electron.customers.create(formData);
      } else {
        await window.electron.customers.update(modal.customer.id, formData);
      }
      setModal(null);
      load();
    } catch {
      setError('Error al guardar el cliente.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await window.electron.customers.delete(id);
      load();
    } catch {
      setError('Error al eliminar el cliente.');
    }
  };

  return (
    <>
      <div style={s.toolbar}>
        <h2 style={s.sectionTitle}>Clientes</h2>
        <button className="fl-btn-primary" style={s.btnPrimary} onClick={() => setModal('create')}>
          + Nuevo Cliente
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={s.wrapper}>
          {customers.length === 0 ? (
            <p style={s.empty}>No hay clientes registrados. Agrega el primero.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Teléfono</th>
                  <th style={s.th}>Correo electrónico</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="fl-tr">
                    <td style={{ ...s.td, fontWeight: '600' }}>{customer.name}</td>
                    <td style={{ ...s.td, color: '#5c5c5c' }}>{customer.phone || '—'}</td>
                    <td style={{ ...s.td, color: '#5c5c5c' }}>{customer.email || '—'}</td>
                    <td style={s.td}>
                      <button className="fl-btn-secondary" style={s.btnEdit} onClick={() => setModal({ mode: 'edit', customer })}>Editar</button>
                      <button className="fl-btn-danger" style={s.btnDelete} onClick={() => handleDelete(customer.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <CustomerModal
          customer={modal !== 'create' ? modal.customer : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
