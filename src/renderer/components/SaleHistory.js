import React, { useState, useEffect } from 'react';
import SaleReceipt from './SaleReceipt';

const STATUS_STYLE = {
  'Completada': { background: '#e8f5e9', color: '#2e7d32' },
  'Cancelada':  { background: '#ffebee', color: '#a4262c' },
  'Pendiente':  { background: '#fff8e1', color: '#8a5700' },
  'Devuelta':   { background: '#f3e5f5', color: '#6a1b9a' },
  'Parcial':    { background: '#fff3e0', color: '#e65100' },
};

const PAYMENT_STYLE = {
  'Efectivo':      { background: '#e8f5e9', color: '#2e7d32' },
  'Tarjeta':       { background: '#e3f2fd', color: '#1565c0' },
  'Transferencia': { background: '#ede7f6', color: '#6a1b9a' },
};

const REASON_OPTIONS = [
  'Producto defectuoso',
  'Error en venta',
  'Cliente arrepentido',
  'Otro',
];

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

// ── Return Modal ─────────────────────────────────────────────────────────────

function ReturnModal({ sale, alreadyReturned, onClose, onConfirm }) {
  const [selected, setSelected] = useState(() =>
    sale.details.reduce((acc, d) => {
      const already = alreadyReturned[d.product_id] || 0;
      const maxQty = d.quantity - already;
      return { ...acc, [d.id]: { checked: false, qty: maxQty > 0 ? maxQty : 0 } };
    }, {})
  );
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const toggle = (id) =>
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], checked: !prev[id].checked } }));

  const setQty = (id, val, max) =>
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], qty: Math.min(max, Math.max(1, Number(val))) } }));

  const selectedItems = sale.details.filter((d) => {
    const maxQty = d.quantity - (alreadyReturned[d.product_id] || 0);
    return maxQty > 0 && selected[d.id].checked;
  });
  const totalRefunded = selectedItems.reduce(
    (sum, d) => sum + Number(d.unit_price) * selected[d.id].qty, 0
  );

  const handleConfirm = async () => {
    if (selectedItems.length === 0) { setErr('Selecciona al menos un producto.'); return; }
    if (!reason) { setErr('Selecciona un motivo.'); return; }
    setSaving(true);
    setErr('');
    try {
      const items = selectedItems.map((d) => ({
        product_id: d.product_id,
        product_name: d.product_name,
        quantity: selected[d.id].qty,
        unit_price: Number(d.unit_price),
        subtotal: Number(d.unit_price) * selected[d.id].qty,
      }));
      await onConfirm({ saleId: sale.id, items, reason, notes });
      onClose();
    } catch (e) {
      setErr('Error al procesar la devolución.');
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box',
  };
  const selectStyle = { ...inputStyle, background: 'white' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: '12px', width: '520px',
        maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            Devolver — Venta #{sale.id}
          </h2>
          {sale.customer_name && (
            <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>Cliente: {sale.customer_name}</div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Product selection */}
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
            Selecciona los productos a devolver
          </div>
          {sale.details.map((d) => {
            const alreadyQty = alreadyReturned[d.product_id] || 0;
            const maxQty = d.quantity - alreadyQty;
            const fullyReturned = maxQty <= 0;
            return (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
              background: fullyReturned ? '#f5f5f5' : selected[d.id].checked ? '#f0f7ff' : '#fafafa',
              border: `1px solid ${fullyReturned ? '#e5e5e5' : selected[d.id].checked ? '#0078d4' : '#e5e5e5'}`,
              cursor: fullyReturned ? 'default' : 'pointer',
              opacity: fullyReturned ? 0.55 : 1,
              transition: 'all 0.1s',
            }} onClick={() => !fullyReturned && toggle(d.id)}>
              <input
                type="checkbox"
                checked={!fullyReturned && selected[d.id].checked}
                onChange={() => !fullyReturned && toggle(d.id)}
                onClick={(e) => e.stopPropagation()}
                disabled={fullyReturned}
                style={{ width: '16px', height: '16px', cursor: fullyReturned ? 'default' : 'pointer', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>
                  {d.product_name}
                  {d.is_regalia && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: '700', color: '#6a1b9a', background: '#f3e5f5', padding: '1px 6px', borderRadius: '8px' }}>REGALÍA</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#9e9e9e' }}>
                  {d.is_regalia ? '$0.00' : `$${Number(d.unit_price).toFixed(2)}`} × {d.quantity} uds.
                  {alreadyQty > 0 && (
                    <span style={{ marginLeft: '6px', color: fullyReturned ? '#a4262c' : '#8a5700', fontWeight: '600' }}>
                      {fullyReturned ? '· Ya devuelto' : `· ${alreadyQty} ya devuelto`}
                    </span>
                  )}
                </div>
              </div>
              {!fullyReturned && selected[d.id].checked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: '12px', color: '#5c5c5c' }}>Cant:</span>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={selected[d.id].qty}
                    onChange={(e) => setQty(d.id, e.target.value, maxQty)}
                    className="fl-input"
                    style={{ width: '60px', padding: '4px 8px', border: '1px solid #d1d1d1', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '12px', color: '#9e9e9e' }}>/ {maxQty}</span>
                </div>
              )}
            </div>
            );
          })}

          {/* Reason */}
          <div style={{ marginTop: '16px', marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '4px' }}>
              Motivo *
            </label>
            <select
              className="fl-select"
              style={selectStyle}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Seleccionar motivo...</option>
              {REASON_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '4px' }}>
              Notas (opcional)
            </label>
            <textarea
              className="fl-input"
              style={{ ...inputStyle, resize: 'vertical', minHeight: '56px', fontFamily: 'inherit' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* Total refund preview */}
          {selectedItems.length > 0 && (
            <div style={{
              background: '#f3e5f5', borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#6a1b9a', fontWeight: '600',
            }}>
              Total a reembolsar: ${totalRefunded.toFixed(2)}
            </div>
          )}

          {err && (
            <div style={{ background: '#ffebee', color: '#a4262c', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', marginTop: '10px' }}>
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            className="fl-btn-ghost"
            style={{ background: 'white', border: '1px solid #d1d1d1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c' }}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="fl-btn-primary"
            style={{ background: '#6a1b9a', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? 'Procesando...' : 'Confirmar devolución'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
  returnBtn: {
    background: 'white', border: '1px solid #ce93d8',
    padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', color: '#6a1b9a', fontWeight: '500', marginLeft: '6px',
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

// ── Main Component ───────────────────────────────────────────────────────────

export default function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [returnsExpanded, setReturnsExpanded] = useState(null);
  const [returnModal, setReturnModal] = useState(null); // sale object
  const [showReturnsSection, setShowReturnsSection] = useState(false);
  const [ticketSale, setTicketSale] = useState(null);
  const [autoPrintSale, setAutoPrintSale] = useState(null);

  // Search/filter state
  const [searchText, setSearchText] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinTotal, setFilterMinTotal] = useState('');
  const [filterMaxTotal, setFilterMaxTotal] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      window.electron.sales.getAll(),
      window.electron.returns.getAll(),
    ])
      .then(([salesData, returnsData]) => {
        setSales(salesData);
        setReturns(returnsData);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el historial.');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));
  const toggleReturn = (id) => setReturnsExpanded((prev) => (prev === id ? null : id));

  const handleReturnConfirm = async (data) => {
    try {
      await window.electron.returns.create(data);
      loadData();
    } catch (e) {
      setError(`Error al procesar la devolución: ${e?.message || 'Intenta de nuevo.'}`);
    }
  };

  // Build already-returned quantities per product_id for a given sale
  const getAlreadyReturned = (saleId) => {
    const map = {};
    for (const ret of returns.filter((r) => r.sale_id === saleId)) {
      for (const d of ret.details) {
        map[d.product_id] = (map[d.product_id] || 0) + d.quantity;
      }
    }
    return map;
  };

  const handleUpdateStatus = async (saleId, status) => {
    try {
      await window.electron.sales.updateStatus(saleId, { status });
      loadData();
    } catch (e) {
      setError(`Error al actualizar estado: ${e?.message || 'Intenta de nuevo.'}`);
    }
  };

  // Filter logic
  const filteredSales = sales.filter((sale) => {
    const text = searchText.trim().toLowerCase();
    if (text) {
      const inClient = (sale.customer_name || '').toLowerCase().includes(text);
      const inProduct = sale.details.some(
        (d) => d.product_name.toLowerCase().includes(text) || (d.sku || '').toLowerCase().includes(text)
      );
      if (!inClient && !inProduct) return false;
    }
    if (filterPayment && (sale.payment_method || 'Efectivo') !== filterPayment) return false;
    if (filterStatus && (sale.status || 'Completada') !== filterStatus) return false;
    const total = Number(sale.total);
    if (filterMinTotal !== '' && total < Number(filterMinTotal)) return false;
    if (filterMaxTotal !== '' && total > Number(filterMaxTotal)) return false;
    return true;
  });

  const canReturn = (sale) => {
    if (sale.status !== 'Completada' && sale.status !== 'Parcial') return false;
    const already = getAlreadyReturned(sale.id);
    return sale.details.some((d) => (already[d.product_id] || 0) < d.quantity);
  };

  // Reconstruct SaleReceipt props from stored SaleDetail snapshot
  const buildReceiptProps = (sale) => {
    const regularDetails = sale.details.filter((d) => !d.is_regalia);
    const items = sale.details.map((d) => ({
      product_name: d.product_name,
      // unit_price in DB is the effective price; add back discount_amount to get original
      unit_price: Number(d.unit_price) + Number(d.discount_amount || 0),
      quantity: d.quantity,
      is_regalia: d.is_regalia,
      regalia_type: d.regalia_type ?? null,
      line_discount_mode: 'amount',
      line_discount_value: Number(d.discount_amount || 0),
    }));
    const subtotalBruto = regularDetails.reduce(
      (s, d) => s + (Number(d.unit_price) + Number(d.discount_amount || 0)) * d.quantity, 0
    );
    const lineDiscountsTotal = regularDetails.reduce(
      (s, d) => s + Number(d.discount_amount || 0) * d.quantity, 0
    );
    const globalDiscountAmount = Number(sale.global_discount || 0);
    const totalDescuentos = lineDiscountsTotal + globalDiscountAmount;
    return {
      sale,
      items,
      subtotalBruto,
      totalDescuentos,
      globalDiscountAmount,
      subtotalNeto: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
    };
  };

  return (
    <>
      <div style={styles.toolbar}>
        <h2 style={styles.sectionTitle}>Historial de Ventas</h2>
        {returns.length > 0 && (
          <button
            className="fl-btn-secondary"
            style={{
              background: 'white', border: '1px solid #ce93d8', padding: '6px 14px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#6a1b9a', fontWeight: '500',
            }}
            onClick={() => setShowReturnsSection((v) => !v)}
          >
            {showReturnsSection ? 'Ocultar devoluciones' : `Ver Devoluciones (${returns.length})`}
          </button>
        )}
      </div>

      {/* ── Search / Filter bar ── */}
      <div style={{
        background: 'white', borderRadius: '10px', padding: '12px 16px',
        marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          className="fl-input"
          type="text"
          placeholder="Buscar por cliente o producto..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            flex: '1 1 200px', padding: '7px 11px', border: '1px solid #d1d1d1',
            borderRadius: '7px', fontSize: '13px',
          }}
        />
        <select
          className="fl-select"
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          style={{
            padding: '7px 10px', border: '1px solid #d1d1d1', borderRadius: '7px',
            fontSize: '13px', background: 'white', minWidth: '130px',
          }}
        >
          <option value="">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>
        <select
          className="fl-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '7px 10px', border: '1px solid #d1d1d1', borderRadius: '7px',
            fontSize: '13px', background: 'white', minWidth: '130px',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Devuelta">Devuelta</option>
          <option value="Parcial">Parcial</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#9e9e9e', whiteSpace: 'nowrap' }}>Total:</span>
          <input
            className="fl-input"
            type="number"
            min="0"
            placeholder="Mín"
            value={filterMinTotal}
            onChange={(e) => setFilterMinTotal(e.target.value)}
            style={{ width: '72px', padding: '7px 8px', border: '1px solid #d1d1d1', borderRadius: '7px', fontSize: '13px' }}
          />
          <span style={{ fontSize: '12px', color: '#9e9e9e' }}>–</span>
          <input
            className="fl-input"
            type="number"
            min="0"
            placeholder="Máx"
            value={filterMaxTotal}
            onChange={(e) => setFilterMaxTotal(e.target.value)}
            style={{ width: '72px', padding: '7px 8px', border: '1px solid #d1d1d1', borderRadius: '7px', fontSize: '13px' }}
          />
        </div>
        {(searchText || filterPayment || filterStatus || filterMinTotal || filterMaxTotal) && (
          <button
            className="fl-btn-ghost"
            style={{ padding: '7px 12px', border: '1px solid #d1d1d1', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', color: '#5c5c5c', background: 'white' }}
            onClick={() => { setSearchText(''); setFilterPayment(''); setFilterStatus(''); setFilterMinTotal(''); setFilterMaxTotal(''); }}
          >
            Limpiar
          </button>
        )}
        {filteredSales.length !== sales.length && (
          <span style={{ fontSize: '12px', color: '#9e9e9e', marginLeft: 'auto' }}>
            {filteredSales.length} de {sales.length} ventas
          </span>
        )}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* ── Returns section ── */}
      {showReturnsSection && returns.length > 0 && (
        <div style={{ ...styles.wrapper, marginBottom: '20px' }}>
          <div style={{
            padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
            fontWeight: '600', fontSize: '13px', color: '#6a1b9a',
            background: '#fdf5ff',
          }}>
            ↩ Devoluciones registradas
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Venta #</th>
                <th style={styles.th}>Motivo</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Reembolso</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => (
                <React.Fragment key={ret.id}>
                  <tr className="fl-tr">
                    <td style={{ ...styles.td, color: '#9e9e9e' }}>{ret.id}</td>
                    <td style={styles.td}>{formatDate(ret.created_at)}</td>
                    <td style={{ ...styles.td, color: '#0078d4', fontWeight: '600' }}>#{ret.sale_id}</td>
                    <td style={styles.td}>{ret.reason}</td>
                    <td style={styles.td}>
                      <Badge map={STATUS_STYLE} value={ret.is_partial ? 'Parcial' : 'Devuelta'} />
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '700', color: '#6a1b9a' }}>
                        ${Number(ret.total_refunded).toFixed(2)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        className="fl-btn-secondary"
                        style={styles.toggleBtn}
                        onClick={() => toggleReturn(ret.id)}
                      >
                        {returnsExpanded === ret.id ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                  {returnsExpanded === ret.id && (
                    <tr style={styles.detailRow}>
                      <td colSpan={7} style={styles.detailCell}>
                        <table style={styles.detailTable}>
                          <thead>
                            <tr>
                              <th style={styles.detailTh}>Producto</th>
                              <th style={styles.detailTh}>P. Unit.</th>
                              <th style={styles.detailTh}>Cantidad</th>
                              <th style={styles.detailTh}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ret.details.map((d) => (
                              <tr key={d.id} className="fl-tr">
                                <td style={styles.detailTd}>{d.product_name}</td>
                                <td style={styles.detailTd}>${Number(d.unit_price).toFixed(2)}</td>
                                <td style={styles.detailTd}>{d.quantity}</td>
                                <td style={styles.detailTd}>${Number(d.subtotal).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {ret.notes && (
                          <div style={{ ...styles.detailTotal, textAlign: 'left', color: '#5c5c5c', fontWeight: '400' }}>
                            Notas: {ret.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sales table ── */}
      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={styles.wrapper}>
          {sales.length === 0 ? (
            <p style={styles.empty}>No hay ventas registradas aún.</p>
          ) : filteredSales.length === 0 ? (
            <p style={styles.empty}>No hay ventas que coincidan con los filtros.</p>
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
                {filteredSales.map((sale) => (
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
                        {sale.regalia_count > 0 && (
                          <span style={{ marginLeft: '5px', fontSize: '10px', fontWeight: '700', color: '#6a1b9a', background: '#f3e5f5', padding: '1px 6px', borderRadius: '8px' }}>
                            +{sale.regalia_count} reg.
                          </span>
                        )}
                      </td>
                      <td style={{ ...styles.td, color: '#5c5c5c' }}>
                        {sale.details.length} producto{sale.details.length !== 1 ? 's' : ''}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.totalBadge}>${Number(sale.total).toFixed(2)}</span>
                      </td>
                      <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                        <button
                          className="fl-btn-secondary"
                          style={styles.toggleBtn}
                          onClick={() => toggle(sale.id)}
                        >
                          {expanded === sale.id ? 'Ocultar' : 'Ver detalle'}
                        </button>
                        <button
                          className="fl-btn-secondary"
                          style={{ ...styles.toggleBtn, marginLeft: '6px', color: '#0078d4', borderColor: '#90caf9', background: '#f0f8ff' }}
                          onClick={() => setTicketSale(sale)}
                        >
                          🧾 Ver Ticket
                        </button>
                        <button
                          className="fl-btn-secondary"
                          style={{ ...styles.toggleBtn, marginLeft: '6px', color: '#107c10', borderColor: '#a5d6a7', background: '#f1f8f1' }}
                          onClick={() => setAutoPrintSale(sale)}
                        >
                          🖨 Imprimir
                        </button>
                        {(sale.status === 'Pendiente') && (
                          <>
                            <button
                              className="fl-btn-secondary"
                              style={{ ...styles.toggleBtn, marginLeft: '6px', color: '#107c10', borderColor: '#a5d6a7', background: '#f1f8f1' }}
                              onClick={() => handleUpdateStatus(sale.id, 'Completada')}
                            >
                              ✓ Completar
                            </button>
                            <button
                              className="fl-btn-secondary"
                              style={{ ...styles.toggleBtn, marginLeft: '6px', color: '#a4262c', borderColor: '#ef9a9a', background: '#fff5f5' }}
                              onClick={() => handleUpdateStatus(sale.id, 'Cancelada')}
                            >
                              ✗ Cancelar
                            </button>
                          </>
                        )}
                        {canReturn(sale) && (
                          <button
                            className="fl-btn-secondary"
                            style={styles.returnBtn}
                            onClick={() => setReturnModal({ sale, alreadyReturned: getAlreadyReturned(sale.id) })}
                          >
                            ↩ Devolver
                          </button>
                        )}
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
                                  <td style={styles.detailTd}>
                                    {d.product_name}
                                    {d.is_regalia && (
                                      <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: '700', color: '#6a1b9a', background: '#f3e5f5', padding: '1px 6px', borderRadius: '8px' }}>
                                        REGALÍA
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ ...styles.detailTd, color: d.is_regalia ? '#6a1b9a' : undefined }}>
                                    {d.is_regalia ? 'REGALÍA' : `$${Number(d.unit_price).toFixed(2)}`}
                                  </td>
                                  <td style={styles.detailTd}>{d.quantity}</td>
                                  <td style={{ ...styles.detailTd, color: d.is_regalia ? '#6a1b9a' : undefined }}>
                                    {d.is_regalia ? '$0.00' : `$${Number(d.subtotal).toFixed(2)}`}
                                  </td>
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

      {/* ── Return modal ── */}
      {returnModal && (
        <ReturnModal
          sale={returnModal.sale}
          alreadyReturned={returnModal.alreadyReturned}
          onClose={() => setReturnModal(null)}
          onConfirm={handleReturnConfirm}
        />
      )}

      {/* ── Ticket viewer ── */}
      {ticketSale && (
        <SaleReceipt
          {...buildReceiptProps(ticketSale)}
          onClose={() => setTicketSale(null)}
        />
      )}

      {/* ── Auto-print ticket ── */}
      {autoPrintSale && (
        <SaleReceipt
          {...buildReceiptProps(autoPrintSale)}
          autoPrint
          onClose={() => setAutoPrintSale(null)}
        />
      )}
    </>
  );
}
