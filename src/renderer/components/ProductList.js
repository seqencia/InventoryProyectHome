import React from 'react';

const CONDITION_STYLE = {
  'Nuevo':        { background: '#dcfce7', color: '#16a34a' },
  'Bueno':        { background: '#dbeafe', color: '#1d4ed8' },
  'Regular':      { background: '#fef3c7', color: '#b45309' },
  'Para reparar': { background: '#fee2e2', color: '#dc2626' },
};

const STATUS_STYLE = {
  'Disponible':    { background: '#dcfce7', color: '#16a34a' },
  'Reservado':     { background: '#ede9fe', color: '#7c3aed' },
  'Vendido':       { background: '#f1f5f9', color: '#64748b' },
  'En reparación': { background: '#ffedd5', color: '#c2410c' },
};

const badge = (map, value) => {
  const col = map[value] || { background: '#f1f5f9', color: '#64748b' };
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    ...col,
  };
};

const isLowStock = (p) => p.stock <= (p.min_stock ?? 5);

const s = {
  wrapper: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f8fafc',
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  rowLowStock: { background: '#fffbeb' },
  skuText: { fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' },
  priceMain: { fontWeight: '700', color: '#1e293b' },
  priceOffer: { fontWeight: '700', color: '#16a34a' },
  priceStrike: { textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px', marginLeft: '4px' },
  stockBadge: (p) => ({
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '12px',
    background: p.stock === 0 ? '#fee2e2' : isLowStock(p) ? '#fef3c7' : '#dcfce7',
    color: p.stock === 0 ? '#dc2626' : isLowStock(p) ? '#b45309' : '#16a34a',
  }),
  minStockHint: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  btnEdit: {
    background: '#f1f5f9',
    border: 'none',
    padding: '5px 11px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px',
    color: '#334155',
  },
  btnDelete: {
    background: '#fee2e2',
    border: 'none',
    padding: '5px 11px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
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
      <div style={s.wrapper}>
        <p style={s.empty}>No hay productos registrados. Agrega el primero.</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Nombre / SKU</th>
            <th style={s.th}>Condición</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Precio venta</th>
            <th style={s.th}>Stock</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={isLowStock(p) ? s.rowLowStock : undefined}>
              <td style={s.td}>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.name}</div>
                {p.sku && <div style={s.skuText}>{p.sku}</div>}
              </td>
              <td style={s.td}>
                {p.condition
                  ? <span style={badge(CONDITION_STYLE, p.condition)}>{p.condition}</span>
                  : <span style={{ color: '#94a3b8' }}>—</span>
                }
              </td>
              <td style={s.td}>
                {p.status
                  ? <span style={badge(STATUS_STYLE, p.status)}>{p.status}</span>
                  : <span style={{ color: '#94a3b8' }}>—</span>
                }
              </td>
              <td style={s.td}>
                {p.offer_price ? (
                  <>
                    <span style={s.priceOffer}>${Number(p.offer_price).toFixed(2)}</span>
                    <span style={s.priceStrike}>${Number(p.sale_price).toFixed(2)}</span>
                  </>
                ) : (
                  <span style={s.priceMain}>${Number(p.sale_price).toFixed(2)}</span>
                )}
                {p.cost_price && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                    Costo: ${Number(p.cost_price).toFixed(2)}
                  </div>
                )}
              </td>
              <td style={s.td}>
                <span style={s.stockBadge(p)}>{p.stock}</span>
                <div style={s.minStockHint}>mín {p.min_stock ?? 5}</div>
              </td>
              <td style={s.td}>
                <button style={s.btnEdit} onClick={() => onEdit(p)}>Editar</button>
                <button style={s.btnDelete} onClick={() => onDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
