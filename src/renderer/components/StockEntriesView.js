import React, { useState, useEffect, useCallback } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const s = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b' },
  btnPrimary: {
    background: '#3b82f6', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
  errorBox: {
    background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
  },
  wrapper: { background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#f8fafc', padding: '10px 14px', textAlign: 'left',
    fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
  },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' },
  qtyBadge: {
    display: 'inline-block', background: '#dcfce7', color: '#16a34a',
    fontWeight: '700', fontSize: '12px', padding: '2px 9px', borderRadius: '12px',
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '520px',
    maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
  },
  modalHeader: { padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 },
  modalBody: { padding: '16px 22px' },
  modalFooter: {
    padding: '14px 22px', borderTop: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
  },
  field: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' },
  hint: { fontSize: '11px', color: '#94a3b8', marginTop: '3px' },
  input: {
    width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', background: 'white', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', resize: 'vertical', minHeight: '60px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btnCancel: {
    background: '#f1f5f9', border: 'none', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#475569',
  },
  btnSave: {
    background: '#16a34a', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function StockEntryModal({ products, suppliers, onSave, onCancel }) {
  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    unit_cost: '',
    supplier_id: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      product_id: parseInt(form.product_id, 10),
      quantity: parseInt(form.quantity, 10),
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
              <select style={s.select} value={form.product_id} onChange={set('product_id')} required autoFocus>
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
                <label style={s.label}>Cantidad *</label>
                <input
                  style={s.input}
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={set('quantity')}
                  placeholder="0"
                  required
                />
                <div style={s.hint}>Se suma al stock actual del producto</div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Costo unitario ($)</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_cost}
                  onChange={set('unit_cost')}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Proveedor</label>
              <select style={s.select} value={form.supplier_id} onChange={set('supplier_id')}>
                <option value="">Sin proveedor / no aplica</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
              {suppliers.length === 0 && (
                <div style={s.hint}>Registra proveedores en la pestaña "Proveedores"</div>
              )}
            </div>

            <div style={s.field}>
              <label style={s.label}>Notas</label>
              <textarea
                style={s.textarea}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Número de factura, lote, observaciones..."
              />
            </div>
          </div>
          <div style={s.modalFooter}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.btnSave} disabled={saving}>
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
      setEntries(e);
      setProducts(p);
      setSuppliers(sup);
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
        <button style={s.btnPrimary} onClick={() => setModal(true)}>+ Nueva Entrada</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
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
                  <th style={s.th}>Cantidad</th>
                  <th style={s.th}>Costo unit.</th>
                  <th style={s.th}>Proveedor</th>
                  <th style={s.th}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ ...s.td, color: '#94a3b8' }}>{entry.id}</td>
                    <td style={s.td}>{formatDate(entry.created_at)}</td>
                    <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>{entry.product_name}</td>
                    <td style={s.td}><span style={s.qtyBadge}>+{entry.quantity}</span></td>
                    <td style={{ ...s.td, color: entry.unit_cost ? '#334155' : '#94a3b8' }}>
                      {entry.unit_cost ? `$${Number(entry.unit_cost).toFixed(2)}` : '—'}
                    </td>
                    <td style={{ ...s.td, color: entry.supplier_name ? '#334155' : '#94a3b8' }}>
                      {entry.supplier_name || '—'}
                    </td>
                    <td style={{ ...s.td, color: entry.notes ? '#334155' : '#94a3b8', maxWidth: '200px' }}>
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
        <StockEntryModal
          products={products}
          suppliers={suppliers}
          onSave={handleSave}
          onCancel={() => setModal(false)}
        />
      )}
    </>
  );
}
