import React from 'react';

const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #sale-receipt, #sale-receipt * { visibility: visible !important; }
    #sale-receipt {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
      padding: 32px !important;
    }
    .receipt-no-print { display: none !important; }
  }
`;

function formatDate(dateStr) {
  return new Date(dateStr || Date.now()).toLocaleString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  btnPrint: {
    background: '#107c10',
    color: 'white',
    border: 'none',
    padding: '9px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnClose: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.35)',
    padding: '9px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    backdropFilter: 'blur(4px)',
  },
  receipt: {
    background: 'white',
    width: '360px',
    maxHeight: '80vh',
    overflowY: 'auto',
    borderRadius: '4px',
    padding: '28px 24px',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '13px',
    color: '#1a1a1a',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  // Header
  headerBlock: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  storeName: {
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '2px',
    margin: '0 0 4px',
    fontFamily: 'system-ui, sans-serif',
  },
  storeTagline: {
    fontSize: '11px',
    color: '#64748b',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    margin: 0,
  },
  // Dividers
  divider: {
    borderTop: '1px dashed #94a3b8',
    margin: '12px 0',
  },
  dividerSolid: {
    borderTop: '2px solid #1a1a1a',
    margin: '12px 0',
  },
  // Info rows
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: '12px',
  },
  infoLabel: { color: '#64748b' },
  infoValue: { fontWeight: '600' },
  // Items table
  itemsHeader: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#64748b',
    paddingBottom: '6px',
  },
  itemRow: {
    display: 'flex',
    gap: '8px',
    paddingBottom: '6px',
    alignItems: 'flex-start',
  },
  colName: { flex: 1, wordBreak: 'break-word' },
  colQty: { width: '28px', textAlign: 'center', flexShrink: 0 },
  colUnit: { width: '66px', textAlign: 'right', flexShrink: 0 },
  colSub: { width: '72px', textAlign: 'right', flexShrink: 0, fontWeight: '600' },
  // Total
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'system-ui, sans-serif',
  },
  // Footer
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
};

export default function SaleReceipt({ sale, items, subtotalBruto, totalDescuentos, globalDiscountAmount, subtotalNeto, tax, total, onClose }) {
  const regularItems      = items.filter((i) => !i.is_regalia);
  const regaliaPropiaItems = items.filter((i) => i.regalia_type === 'propia');
  const bonificacionItems  = items.filter((i) => i.regalia_type === 'bonificacion');
  const hasDiscounts = totalDescuentos > 0;
  const lineDiscounts = totalDescuentos - (globalDiscountAmount || 0);

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div style={s.overlay}>
        {/* Buttons — hidden on print */}
        <div style={s.actions} className="receipt-no-print">
          <button style={s.btnPrint} onClick={() => window.print()}>
            🖨 Imprimir
          </button>
          <button style={{ ...s.btnPrint, background: '#0078d4' }} onClick={() => window.print()}>
            📄 Exportar PDF
          </button>
          <button style={s.btnClose} onClick={onClose}>
            Cerrar
          </button>
        </div>

        {/* Receipt */}
        <div id="sale-receipt" style={s.receipt}>
          {/* Store header */}
          <div style={s.headerBlock}>
            <h1 style={s.storeName}>StarTecnology</h1>
            <p style={s.storeTagline}>Comprobante de Venta</p>
          </div>

          <div style={s.dividerSolid} />

          {/* Sale metadata */}
          <div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Venta #</span>
              <span style={s.infoValue}>{sale.id}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Fecha</span>
              <span style={s.infoValue}>{formatDate(sale.created_at)}</span>
            </div>
            {sale.customer_name && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>Cliente</span>
                <span style={s.infoValue}>{sale.customer_name}</span>
              </div>
            )}
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Pago</span>
              <span style={s.infoValue}>{sale.payment_method || 'Efectivo'}</span>
            </div>
          </div>

          <div style={s.divider} />

          {/* Items header */}
          <div style={s.itemsHeader}>
            <span style={s.colName}>Producto</span>
            <span style={s.colQty}>Cant</span>
            <span style={s.colUnit}>P.Unit</span>
            <span style={s.colSub}>Subtotal</span>
          </div>

          <div style={s.divider} />

          {/* Regular items */}
          {regularItems.map((item, i) => {
            const discUnit = item.line_discount_value > 0
              ? (item.line_discount_mode === 'percent'
                  ? item.unit_price * item.line_discount_value / 100
                  : item.line_discount_value)
              : 0;
            const effPrice = Math.max(0, item.unit_price - discUnit);
            const lineSub  = effPrice * item.quantity;
            return (
              <React.Fragment key={i}>
                <div style={s.itemRow}>
                  <span style={s.colName}>{item.product_name}</span>
                  <span style={s.colQty}>{item.quantity}</span>
                  <span style={s.colUnit}>${effPrice.toFixed(2)}</span>
                  <span style={s.colSub}>${lineSub.toFixed(2)}</span>
                </div>
                {discUnit > 0 && (
                  <div style={{ ...s.itemRow, paddingTop: 0, paddingBottom: '4px' }}>
                    <span style={{ ...s.colName, fontSize: '11px', color: '#e65100' }}>
                      &nbsp;&nbsp;Desc. {item.line_discount_mode === 'percent' ? `${item.line_discount_value}%` : `$${discUnit.toFixed(2)}/ud`}
                    </span>
                    <span style={{ ...s.colQty }}></span>
                    <span style={{ ...s.colUnit, fontSize: '11px', color: '#e65100' }}></span>
                    <span style={{ ...s.colSub, fontSize: '11px', color: '#e65100' }}>−${(discUnit * item.quantity).toFixed(2)}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Regalía propia items */}
          {regaliaPropiaItems.length > 0 && (
            <>
              <div style={{ ...s.divider, borderTopStyle: 'dotted', margin: '6px 0 4px' }} />
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1px', color: '#6a1b9a', textTransform: 'uppercase', marginBottom: '4px' }}>
                🎁 Regalías propias
              </div>
              {regaliaPropiaItems.map((item, i) => (
                <div key={i} style={s.itemRow}>
                  <span style={{ ...s.colName, color: '#6a1b9a' }}>{item.product_name}</span>
                  <span style={s.colQty}>{item.quantity}</span>
                  <span style={{ ...s.colUnit, color: '#6a1b9a', fontSize: '10px' }}>REGALÍA</span>
                  <span style={{ ...s.colSub, color: '#6a1b9a' }}>$0.00</span>
                </div>
              ))}
            </>
          )}

          {/* Bonificación proveedor items */}
          {bonificacionItems.length > 0 && (
            <>
              <div style={{ ...s.divider, borderTopStyle: 'dotted', margin: '6px 0 4px' }} />
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1px', color: '#1565c0', textTransform: 'uppercase', marginBottom: '4px' }}>
                📦 Bonificaciones proveedor
              </div>
              {bonificacionItems.map((item, i) => (
                <div key={i} style={s.itemRow}>
                  <span style={{ ...s.colName, color: '#1565c0' }}>{item.product_name}</span>
                  <span style={s.colQty}>{item.quantity}</span>
                  <span style={{ ...s.colUnit, color: '#1565c0', fontSize: '10px' }}>BONIF.</span>
                  <span style={{ ...s.colSub, color: '#1565c0' }}>$0.00</span>
                </div>
              ))}
            </>
          )}

          <div style={s.dividerSolid} />

          {/* Totals breakdown */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ ...s.infoRow, marginBottom: '4px' }}>
              <span style={s.infoLabel}>{hasDiscounts ? 'Subtotal bruto' : 'Subtotal'}</span>
              <span style={s.infoValue}>${Number(subtotalBruto ?? sale.subtotal ?? total).toFixed(2)}</span>
            </div>
            {hasDiscounts && lineDiscounts > 0 && (
              <div style={{ ...s.infoRow, marginBottom: '4px' }}>
                <span style={{ ...s.infoLabel, color: '#e65100' }}>Desc. por línea</span>
                <span style={{ ...s.infoValue, color: '#e65100' }}>−${lineDiscounts.toFixed(2)}</span>
              </div>
            )}
            {hasDiscounts && globalDiscountAmount > 0 && (
              <div style={{ ...s.infoRow, marginBottom: '4px' }}>
                <span style={{ ...s.infoLabel, color: '#e65100' }}>Desc. global</span>
                <span style={{ ...s.infoValue, color: '#e65100' }}>−${Number(globalDiscountAmount).toFixed(2)}</span>
              </div>
            )}
            {hasDiscounts && (
              <div style={{ ...s.infoRow, marginBottom: '4px', fontWeight: '700' }}>
                <span style={s.infoLabel}>Subtotal neto</span>
                <span style={s.infoValue}>${Number(subtotalNeto ?? sale.subtotal).toFixed(2)}</span>
              </div>
            )}
            {regaliaPropiaItems.length > 0 && (
              <div style={{ ...s.infoRow, marginBottom: '4px' }}>
                <span style={{ ...s.infoLabel, color: '#6a1b9a' }}>🎁 Regalías propias</span>
                <span style={{ ...s.infoValue, color: '#6a1b9a' }}>$0.00</span>
              </div>
            )}
            {bonificacionItems.length > 0 && (
              <div style={{ ...s.infoRow, marginBottom: '4px' }}>
                <span style={{ ...s.infoLabel, color: '#1565c0' }}>📦 Bonif. proveedor</span>
                <span style={{ ...s.infoValue, color: '#1565c0' }}>$0.00</span>
              </div>
            )}
            <div style={{ ...s.infoRow, marginBottom: '4px' }}>
              <span style={s.infoLabel}>IVA (13%)</span>
              <span style={s.infoValue}>${Number(tax ?? sale.tax ?? 0).toFixed(2)}</span>
            </div>
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Total</span>
            <span style={s.totalAmount}>${Number(total).toFixed(2)}</span>
          </div>

          <div style={s.divider} />

          {/* Footer */}
          <p style={s.footer}>¡Gracias por su compra!</p>
        </div>
      </div>
    </>
  );
}
