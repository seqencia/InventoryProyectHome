import React from 'react';

const CONDITION_STYLE = {
  'Nuevo':        { background: '#e8f5e9', color: '#2e7d32' },
  'Bueno':        { background: '#e3f2fd', color: '#1565c0' },
  'Regular':      { background: '#fff8e1', color: '#8a5700' },
  'Para reparar': { background: '#ffebee', color: '#a4262c' },
};

const STATUS_STYLE = {
  'Disponible':    { background: '#e8f5e9', color: '#2e7d32' },
  'Reservado':     { background: '#ede7f6', color: '#6a1b9a' },
  'Vendido':       { background: '#f5f5f5', color: '#5c5c5c' },
  'En reparación': { background: '#fff3e0', color: '#bf360c' },
};

const badge = (map, value) => {
  const col = map[value] || { background: '#f5f5f5', color: '#5c5c5c' };
  return {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '12px',
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
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f7f7f7',
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '11px',
    color: '#9e9e9e',
    borderBottom: '1px solid #e5e5e5',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 14px',
    borderBottom: '1px solid #f5f5f5',
    verticalAlign: 'middle',
  },
  skuText: { fontSize: '11px', color: '#9e9e9e', marginTop: '2px', fontFamily: 'monospace' },
  priceMain: { fontWeight: '700', color: '#1a1a1a' },
  priceOffer: { fontWeight: '700', color: '#107c10' },
  priceStrike: { textDecoration: 'line-through', color: '#9e9e9e', fontSize: '11px', marginLeft: '5px' },
  stockBadge: (p) => ({
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '12px',
    background: p.stock === 0 ? '#ffebee' : isLowStock(p) ? '#fff8e1' : '#e8f5e9',
    color: p.stock === 0 ? '#a4262c' : isLowStock(p) ? '#8a5700' : '#2e7d32',
  }),
  minStockHint: { fontSize: '11px', color: '#9e9e9e', marginTop: '2px' },
  btnEdit: {
    background: 'white',
    border: '1px solid #d1d1d1',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '6px',
    color: '#1a1a1a',
    fontWeight: '500',
  },
  btnDelete: {
    background: 'white',
    border: '1px solid #fad9d9',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#a4262c',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '56px 32px',
    color: '#9e9e9e',
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
            <tr
              key={p.id}
              className={isLowStock(p) ? 'fl-tr-amber' : 'fl-tr'}
              style={isLowStock(p) ? { background: '#fffdf5' } : undefined}
            >
              <td style={s.td}>
                <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{p.name}</div>
                {p.sku && <div style={s.skuText}>{p.sku}</div>}
              </td>
              <td style={s.td}>
                {p.condition
                  ? <span style={badge(CONDITION_STYLE, p.condition)}>{p.condition}</span>
                  : <span style={{ color: '#9e9e9e' }}>—</span>
                }
              </td>
              <td style={s.td}>
                {p.status
                  ? <span style={badge(STATUS_STYLE, p.status)}>{p.status}</span>
                  : <span style={{ color: '#9e9e9e' }}>—</span>
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
                  <div style={{ fontSize: '11px', color: '#9e9e9e', marginTop: '1px' }}>
                    Costo: ${Number(p.cost_price).toFixed(2)}
                  </div>
                )}
              </td>
              <td style={s.td}>
                <span style={s.stockBadge(p)}>{p.stock}</span>
                <div style={s.minStockHint}>mín {p.min_stock ?? 5}</div>
              </td>
              <td style={s.td}>
                <button className="fl-btn-secondary" style={s.btnEdit} onClick={() => onEdit(p)}>Editar</button>
                <button className="fl-btn-danger" style={s.btnDelete} onClick={() => onDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
