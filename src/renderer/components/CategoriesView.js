import React, { useState, useEffect, useCallback } from 'react';

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b' },
  btnPrimary: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  // Table
  wrapper: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    background: '#f8fafc',
    padding: '11px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '11px 16px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '11px 16px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    color: '#64748b',
  },
  btnEdit: {
    background: '#f1f5f9',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    marginRight: '6px',
    color: '#334155',
  },
  btnDelete: {
    background: '#fee2e2',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#dc2626',
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: '#94a3b8',
    fontSize: '15px',
  },
  // Modal
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
    width: '420px',
    maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1e293b',
  },
  field: { marginBottom: '14px' },
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

function CategoryModal({ category, onSave, onCancel }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: form.name.trim(), description: form.description.trim() || null });
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>
          {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre *</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={set('name')}
              placeholder="Ej: Computadoras"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <textarea
              style={styles.textarea}
              value={form.description}
              onChange={set('description')}
              placeholder="Descripción opcional de la categoría"
            />
          </div>
          <div style={styles.actions}>
            <button type="button" style={styles.btnCancel} onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnSave}>
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
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', category }

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
      <div style={styles.toolbar}>
        <h2 style={styles.sectionTitle}>Categorías</h2>
        <button style={styles.btnPrimary} onClick={() => setModal('create')}>
          + Nueva Categoría
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={styles.wrapper}>
          {categories.length === 0 ? (
            <p style={styles.empty}>No hay categorías. Agrega la primera.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={styles.td}>
                      <strong>{cat.name}</strong>
                    </td>
                    <td style={styles.tdMuted}>{cat.description || '—'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => setModal({ mode: 'edit', category: cat })}
                      >
                        Editar
                      </button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => handleDelete(cat.id)}
                      >
                        Eliminar
                      </button>
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
