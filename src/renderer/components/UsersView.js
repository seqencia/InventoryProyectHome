import React, { useState, useEffect, useCallback } from 'react';

const ROLES = ['Admin', 'Vendedor'];

const ROLE_BADGE = {
  Admin:    { background: '#e3f2fd', color: '#1565c0' },
  Vendedor: { background: '#e8f5e9', color: '#2e7d32' },
};

const s = {
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
  empty: { textAlign: 'center', padding: '48px 32px', color: '#9e9e9e', fontSize: '14px' },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '420px',
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
  hint: { fontSize: '11px', color: '#9e9e9e', marginTop: '3px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', background: 'white', boxSizing: 'border-box',
  },
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
  btnCancel: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c',
  },
  btnSave: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function UserModal({ user, onSave, onCancel }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'Vendedor',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) return;
    if (!isEdit && !form.password) { setError('La contraseña es obligatoria.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err?.message || 'Error al guardar.');
      setSaving(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.modalBody}>
            <div style={s.field}>
              <label style={s.label}>Nombre completo *</label>
              <input className="fl-input" style={s.input} type="text" value={form.name}
                onChange={set('name')} placeholder="Nombre del usuario" required autoFocus disabled={saving} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nombre de usuario *</label>
              <input className="fl-input" style={s.input} type="text" value={form.username}
                onChange={set('username')} placeholder="login" required disabled={saving} />
            </div>
            <div style={s.field}>
              <label style={s.label}>{isEdit ? 'Nueva contraseña' : 'Contraseña *'}</label>
              <input className="fl-input" style={s.input} type="password" value={form.password}
                onChange={set('password')} placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                required={!isEdit} disabled={saving} />
              {isEdit && <div style={s.hint}>Dejar vacío para mantener la contraseña actual</div>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Rol *</label>
              <select className="fl-select" style={s.select} value={form.role} onChange={set('role')} disabled={saving}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {error && (
              <div style={{
                background: '#ffebee', color: '#a4262c', border: '1px solid #ef9a9a',
                borderRadius: '6px', padding: '8px 12px', fontSize: '13px',
              }}>
                {error}
              </div>
            )}
          </div>
          <div style={s.modalFooter}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', user }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setUsers(await window.electron.users.getAll());
      setError('');
    } catch {
      setError('Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    if (modal === 'create') {
      await window.electron.users.create(form);
    } else {
      await window.electron.users.update(modal.user.id, form);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar el usuario "${user.name}"?`)) return;
    try {
      await window.electron.users.delete(user.id);
      load();
    } catch (err) {
      setError(err?.message || 'Error al eliminar el usuario.');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>Usuarios del Sistema</div>
        <button
          className="fl-btn-primary"
          style={{
            background: '#0078d4', color: 'white', border: 'none',
            padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500',
          }}
          onClick={() => setModal('create')}
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#a4262c', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={s.wrapper}>
        {loading ? (
          <p style={s.empty}>Cargando...</p>
        ) : users.length === 0 ? (
          <p style={s.empty}>No hay usuarios registrados.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Usuario</th>
                <th style={s.th}>Rol</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="fl-tr">
                  <td style={{ ...s.td, fontWeight: '600' }}>{u.name}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px', color: '#5c5c5c' }}>
                    {u.username}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: '600',
                      ...ROLE_BADGE[u.role],
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button className="fl-btn-secondary" style={s.btnEdit} onClick={() => setModal({ mode: 'edit', user: u })}>
                      Editar
                    </button>
                    <button className="fl-btn-danger" style={s.btnDelete} onClick={() => handleDelete(u)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal.user}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
