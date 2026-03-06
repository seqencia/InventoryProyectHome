import React, { useState, useEffect } from 'react';

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b' },
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
  toggleBtn: {
    background: '#f1f5f9',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#334155',
  },
  detailRow: {
    background: '#f8fafc',
  },
  detailCell: {
    padding: '0',
    borderBottom: '1px solid #e2e8f0',
  },
  detailTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  detailTh: {
    padding: '8px 24px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    background: '#f1f5f9',
  },
  detailTd: {
    padding: '8px 24px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  detailTotal: {
    padding: '8px 24px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '13px',
    borderTop: '1px solid #e2e8f0',
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: '#94a3b8',
    fontSize: '15px',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  totalBadge: {
    fontWeight: '700',
    color: '#1e293b',
  },
};

const STATUS_STYLE = {
  'Completada': { background: '#dcfce7', color: '#16a34a' },
  'Cancelada':  { background: '#fee2e2', color: '#dc2626' },
  'Pendiente':  { background: '#fef3c7', color: '#b45309' },
};

const PAYMENT_STYLE = {
  'Efectivo':      { background: '#f0fdf4', color: '#15803d' },
  'Tarjeta':       { background: '#eff6ff', color: '#1d4ed8' },
  'Transferencia': { background: '#f5f3ff', color: '#7c3aed' },
};

function Badge({ map, value }) {
  const col = map[value] || { background: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', ...col }}>
      {value || '—'}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
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
                    <tr>
                      <td style={styles.td}>{sale.id}</td>
                      <td style={styles.td}>{formatDate(sale.created_at)}</td>
                      <td style={styles.td}>{sale.customer_name || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td style={styles.td}><Badge map={PAYMENT_STYLE} value={sale.payment_method || 'Efectivo'} /></td>
                      <td style={styles.td}><Badge map={STATUS_STYLE} value={sale.status || 'Completada'} /></td>
                      <td style={styles.td}>{sale.details.length} producto{sale.details.length !== 1 ? 's' : ''}</td>
                      <td style={styles.td}>
                        <span style={styles.totalBadge}>${Number(sale.total).toFixed(2)}</span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.toggleBtn} onClick={() => toggle(sale.id)}>
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
                                <tr key={d.id}>
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
                                <span style={{ fontWeight: '400', color: '#64748b', marginRight: '16px' }}>
                                  Subtotal: ${Number(sale.subtotal).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: '400', color: '#64748b', marginRight: '16px' }}>
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
