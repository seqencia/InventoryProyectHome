import React, { useState, useEffect, useCallback } from 'react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

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
};

export default function InventoryView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', product }

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await window.electron.products.getAll());
      setError(null);
    } catch {
      setError('Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSave = async (formData) => {
    try {
      if (modal === 'create') {
        await window.electron.products.create(formData);
      } else {
        await window.electron.products.update(modal.product.id, formData);
      }
      setModal(null);
      loadProducts();
    } catch {
      setError('Error al guardar el producto.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await window.electron.products.delete(id);
      loadProducts();
    } catch {
      setError('Error al eliminar el producto.');
    }
  };

  return (
    <>
      <div style={styles.toolbar}>
        <h2 style={styles.sectionTitle}>Catálogo de Productos</h2>
        <button style={styles.btnPrimary} onClick={() => setModal('create')}>
          + Nuevo Producto
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <ProductList
          products={products}
          onEdit={(product) => setModal({ mode: 'edit', product })}
          onDelete={handleDelete}
        />
      )}

      {modal && (
        <ProductForm
          product={modal !== 'create' ? modal.product : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
