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
    width: '420px', maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  modalTitle: { fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: '#1a1a1a' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '5px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', resize: 'vertical', minHeight: '70px',
    boxSizing: 'border-box', fontFamily: 'inherit',
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

function CategoryModal({ category, onSave, onCancel }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: form.name.trim(), description: form.description.trim() || null });
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Nombre *</label>
            <input
              className="fl-input"
              style={s.input}
              value={form.name}
              onChange={set('name')}
              placeholder="Ej: Computadoras"
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Descripción</label>
            <textarea
              className="fl-input"
              style={s.textarea}
              value={form.description}
              onChange={set('description')}
              placeholder="Descripción opcional de la categoría"
            />
          </div>
          <div style={s.actions}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave}>
              {isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setCategories(await window.electron.categories.getAll());
      setError(null);
    } catch {
      setError('Error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData) => {
    try {
      if (modal === 'create') {
        await window.electron.categories.create(formData);
      } else {
        await window.electron.categories.update(modal.category.id, formData);
      }
      setModal(null);
      load();
    } catch {
      setError('Error al guardar la categoría. El nombre podría estar duplicado.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await window.electron.categories.delete(id);
      load();
    } catch {
      setError('Error al eliminar la categoría.');
    }
  };

  return (
    <>
      <div style={s.toolbar}>
        <h2 style={s.sectionTitle}>Categorías</h2>
        <button className="fl-btn-primary" style={s.btnPrimary} onClick={() => setModal('create')}>
          + Nueva Categoría
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={s.wrapper}>
          {categories.length === 0 ? (
            <p style={s.empty}>No hay categorías. Agrega la primera.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Descripción</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="fl-tr">
                    <td style={{ ...s.td, fontWeight: '600' }}>{cat.name}</td>
                    <td style={{ ...s.td, color: '#5c5c5c' }}>{cat.description || '—'}</td>
                    <td style={s.td}>
                      <button className="fl-btn-secondary" style={s.btnEdit} onClick={() => setModal({ mode: 'edit', category: cat })}>Editar</button>
                      <button className="fl-btn-danger" style={s.btnDelete} onClick={() => handleDelete(cat.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal !== 'create' ? modal.category : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
