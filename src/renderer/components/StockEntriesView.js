import React, { useState, useEffect, useCallback } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const s = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' },
  btnPrimary: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
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
  empty: { textAlign: 'center', padding: '56px 32px', color: '#9e9e9e', fontSize: '15px' },
  qtyBadge: {
    display: 'inline-block', background: '#e8f5e9', color: '#2e7d32',
    fontWeight: '700', fontSize: '12px', padding: '3px 9px', borderRadius: '12px',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '520px',
    maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden',
  },
  modalHeader: { padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
  modalTitle: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  modalBody: { padding: '18px 24px' },
  modalFooter: {
    padding: '14px 24px', borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
  },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '5px' },
  hint: { fontSize: '11px', color: '#9e9e9e', marginTop: '3px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', background: 'white', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '14px', resize: 'vertical', minHeight: '60px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btnCancel: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c',
  },
  btnSave: {
    background: '#107c10', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function StockEntryModal({ products, suppliers, onSave, onCancel }) {
  const [form, setForm] = useState({ product_id: '', quantity: '', bonus_quantity: '', unit_cost: '', supplier_id: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const qty = parseInt(form.quantity, 10) || 0;
  const bonus = parseInt(form.bonus_quantity, 10) || 0;
  const totalQty = qty + bonus;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      product_id: parseInt(form.product_id, 10),
      quantity: qty,
      bonus_quantity: bonus,
      unit_cost: form.unit_cost !== '' ? parseFloat(form.unit_cost) : null,
      supplier_id: form.supplier_id ? parseInt(form.supplier_id, 10) : null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>Nueva Entrada de Stock</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.modalBody}>
            <div style={s.field}>
              <label style={s.label}>Producto *</label>
              <select className="fl-select" style={s.select} value={form.product_id} onChange={set('product_id')} required autoFocus>
                <option value="">Seleccionar producto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.sku ? ` (${p.sku})` : ''} — Stock actual: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Cantidad comprada *</label>
                <input className="fl-input" style={s.input} type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} placeholder="0" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Cantidad bonificada</label>
                <input className="fl-input" style={s.input} type="number" min="0" step="1" value={form.bonus_quantity} onChange={set('bonus_quantity')} placeholder="0 (opcional)" />
                <div style={s.hint}>Unidades de regalo/bonus del proveedor</div>
              </div>
            </div>
            {(qty > 0 || bonus > 0) && (
              <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#2e7d32', marginBottom: '14px', fontWeight: '500' }}>
                Total a ingresar: <strong>{totalQty} unidades</strong>
                {bonus > 0 && (
                  <span style={{ fontWeight: '400', color: '#5c5c5c', marginLeft: '8px' }}>
                    ({qty} compradas + {bonus} bonificada{bonus !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            )}
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Costo unitario ($)</label>
                <input className="fl-input" style={s.input} type="number" min="0" step="0.01" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0.00" />
                {bonus > 0 && <div style={s.hint}>Solo sobre cantidad comprada ({qty} uds.)</div>}
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Proveedor</label>
              <select className="fl-select" style={s.select} value={form.supplier_id} onChange={set('supplier_id')}>
                <option value="">Sin proveedor / no aplica</option>
                {suppliers.map((sup) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
              </select>
              {suppliers.length === 0 && <div style={s.hint}>Registra proveedores en la pestaña "Proveedores"</div>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Notas</label>
              <textarea className="fl-input" style={s.textarea} value={form.notes} onChange={set('notes')} placeholder="Número de factura, lote, observaciones..." />
            </div>
          </div>
          <div style={s.modalFooter}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave} disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StockEntriesView() {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [e, p, sup] = await Promise.all([
        window.electron.stockEntries.getAll(),
        window.electron.products.getAll(),
        window.electron.suppliers.getAll(),
      ]);
      setEntries(e); setProducts(p); setSuppliers(sup);
      setError(null);
    } catch {
      setError('Error al cargar las entradas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      await window.electron.stockEntries.create(data);
      setModal(false);
      load();
    } catch {
      setError('Error al registrar la entrada de stock.');
    }
  };

  return (
    <>
      <div style={s.toolbar}>
        <h2 style={s.sectionTitle}>Entradas de Inventario</h2>
        <button className="fl-btn-primary" style={s.btnPrimary} onClick={() => setModal(true)}>+ Nueva Entrada</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={s.wrapper}>
          {entries.length === 0 ? (
            <p style={s.empty}>No hay entradas registradas. Registra la primera.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Producto</th>
                  <th style={s.th}>Ingresado</th>
                  <th style={s.th}>Costo unit.</th>
                  <th style={s.th}>Proveedor</th>
                  <th style={s.th}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="fl-tr">
                    <td style={{ ...s.td, color: '#9e9e9e' }}>{entry.id}</td>
                    <td style={s.td}>{formatDate(entry.created_at)}</td>
                    <td style={{ ...s.td, fontWeight: '600' }}>{entry.product_name}</td>
                    <td style={s.td}>
                      {(entry.bonus_quantity > 0) ? (
                        <span style={{ fontSize: '12px', color: '#1a1a1a' }}>
                          <span style={s.qtyBadge}>+{entry.quantity + entry.bonus_quantity}</span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9e9e9e', marginTop: '3px' }}>
                            {entry.quantity} comprada{entry.quantity !== 1 ? 's' : ''} + {entry.bonus_quantity} bonificada{entry.bonus_quantity !== 1 ? 's' : ''}
                          </span>
                        </span>
                      ) : (
                        <span style={s.qtyBadge}>+{entry.quantity}</span>
                      )}
                    </td>
                    <td style={{ ...s.td, color: entry.unit_cost ? '#1a1a1a' : '#9e9e9e' }}>
                      {entry.unit_cost ? `$${Number(entry.unit_cost).toFixed(2)}` : '—'}
                    </td>
                    <td style={{ ...s.td, color: entry.supplier_name ? '#1a1a1a' : '#9e9e9e' }}>
                      {entry.supplier_name || '—'}
                    </td>
                    <td style={{ ...s.td, color: entry.notes ? '#1a1a1a' : '#9e9e9e', maxWidth: '200px' }}>
                      {entry.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <StockEntryModal products={products} suppliers={suppliers} onSave={handleSave} onCancel={() => setModal(false)} />
      )}
    </>
  );
}
