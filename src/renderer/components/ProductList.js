import React from 'react';

const LOW_STOCK = 5;

const styles = {
  wrapper: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    background: '#f8fafc',
    padding: '11px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
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
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stockBadge: (stock) => ({
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '13px',
    background: stock <= LOW_STOCK ? '#fee2e2' : '#dcfce7',
    color: stock <= LOW_STOCK ? '#dc2626' : '#16a34a',
  }),
  lowStockLabel: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#dc2626',
  },
  rowLowStock: {
    background: '#fffbeb',
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
};

export default function ProductList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div style={styles.wrapper}>
        <p style={styles.empty}>No hay productos registrados. Agrega el primero.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>Descripción</th>
            <th style={styles.th}>Precio</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={product.stock <= LOW_STOCK ? styles.rowLowStock : undefined}>
              <td style={styles.td}>
                <strong>{product.name}</strong>
              </td>
              <td style={styles.td}>{product.category || '—'}</td>
              <td style={styles.tdMuted}>{product.description || '—'}</td>
              <td style={styles.td}>${Number(product.price).toFixed(2)}</td>
              <td style={styles.td}>
                <span style={styles.stockBadge(product.stock)}>{product.stock}</span>
                {product.stock <= LOW_STOCK && (
                  <span style={styles.lowStockLabel}>Stock bajo</span>
                )}
              </td>
              <td style={styles.td}>
                <button style={styles.btnEdit} onClick={() => onEdit(product)}>
                  Editar
                </button>
                <button style={styles.btnDelete} onClick={() => onDelete(product.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
