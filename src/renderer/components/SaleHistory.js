import React, { useState, useEffect } from 'react';

const STATUS_STYLE = {
  'Completada': { background: '#e8f5e9', color: '#2e7d32' },
  'Cancelada':  { background: '#ffebee', color: '#a4262c' },
  'Pendiente':  { background: '#fff8e1', color: '#8a5700' },
};

const PAYMENT_STYLE = {
  'Efectivo':      { background: '#e8f5e9', color: '#2e7d32' },
  'Tarjeta':       { background: '#e3f2fd', color: '#1565c0' },
  'Transferencia': { background: '#ede7f6', color: '#6a1b9a' },
};

function Badge({ map, value }) {
  const col = map[value] || { background: '#f5f5f5', color: '#5c5c5c' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600', ...col,
    }}>
      {value || '—'}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const styles = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' },
  wrapper: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f7f7f7', padding: '10px 16px', textAlign: 'left',
    fontWeight: '700', fontSize: '11px', color: '#9e9e9e',
    borderBottom: '1px solid #e5e5e5', textTransform: 'uppercase',
    letterSpacing: '0.5px', whiteSpace: 'nowrap',
  },
  td: { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' },
  toggleBtn: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', color: '#1a1a1a', fontWeight: '500',
  },
  detailRow: { background: '#fafafa' },
  detailCell: { padding: 0, borderBottom: '1px solid #e5e5e5' },
  detailTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  detailTh: {
    padding: '8px 24px', textAlign: 'left', fontWeight: '600',
    color: '#9e9e9e', fontSize: '11px', borderBottom: '1px solid #e5e5e5',
    background: '#f5f5f5', textTransform: 'uppercase', letterSpacing: '0.4px',
  },
  detailTd: { padding: '8px 24px', borderBottom: '1px solid #f0f0f0', color: '#1a1a1a' },
  detailTotal: {
    padding: '10px 24px', textAlign: 'right', fontWeight: '600',
    color: '#1a1a1a', fontSize: '13px', borderTop: '1px solid #e5e5e5',
    background: '#f9f9f9',
  },
  empty: { textAlign: 'center', padding: '56px 32px', color: '#9e9e9e', fontSize: '15px' },
  errorBox: {
    background: '#ffebee', color: '#a4262c', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  totalBadge: { fontWeight: '700', color: '#0078d4' },
};

export default function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    window.electron.sales
      .getAll()
      .then((data) => { setSales(data); setLoading(false); })
      .catch(() => { setError('Error al cargar el historial.'); setLoading(false); });
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <>
      <div style={styles.toolbar}>
        <h2 style={styles.sectionTitle}>Historial de Ventas</h2>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={styles.wrapper}>
          {sales.length === 0 ? (
            <p style={styles.empty}>No hay ventas registradas aún.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Método</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Productos</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <tr className="fl-tr">
                      <td style={{ ...styles.td, color: '#9e9e9e' }}>{sale.id}</td>
                      <td style={styles.td}>{formatDate(sale.created_at)}</td>
                      <td style={{ ...styles.td, color: sale.customer_name ? '#1a1a1a' : '#9e9e9e' }}>
                        {sale.customer_name || '—'}
                      </td>
                      <td style={styles.td}>
                        <Badge map={PAYMENT_STYLE} value={sale.payment_method || 'Efectivo'} />
                      </td>
                      <td style={styles.td}>
                        <Badge map={STATUS_STYLE} value={sale.status || 'Completada'} />
                      </td>
                      <td style={{ ...styles.td, color: '#5c5c5c' }}>
                        {sale.details.length} producto{sale.details.length !== 1 ? 's' : ''}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.totalBadge}>${Number(sale.total).toFixed(2)}</span>
                      </td>
                      <td style={styles.td}>
                        <button
                          className="fl-btn-secondary"
                          style={styles.toggleBtn}
                          onClick={() => toggle(sale.id)}
                        >
                          {expanded === sale.id ? 'Ocultar' : 'Ver detalle'}
                        </button>
                      </td>
                    </tr>
                    {expanded === sale.id && (
                      <tr style={styles.detailRow}>
                        <td colSpan={8} style={styles.detailCell}>
                          <table style={styles.detailTable}>
                            <thead>
                              <tr>
                                <th style={styles.detailTh}>Producto</th>
                                <th style={styles.detailTh}>Precio unit.</th>
                                <th style={styles.detailTh}>Cantidad</th>
                                <th style={styles.detailTh}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sale.details.map((d) => (
                                <tr key={d.id} className="fl-tr">
                                  <td style={styles.detailTd}>{d.product_name}</td>
                                  <td style={styles.detailTd}>${Number(d.unit_price).toFixed(2)}</td>
                                  <td style={styles.detailTd}>{d.quantity}</td>
                                  <td style={styles.detailTd}>${Number(d.subtotal).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={styles.detailTotal}>
                            {sale.subtotal != null && (
                              <>
                                <span style={{ fontWeight: '400', color: '#9e9e9e', marginRight: '16px' }}>
                                  Subtotal: ${Number(sale.subtotal).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: '400', color: '#9e9e9e', marginRight: '16px' }}>
                                  IVA 13%: ${Number(sale.tax).toFixed(2)}
                                </span>
                              </>
                            )}
                            Total: ${Number(sale.total).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
