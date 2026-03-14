import React, { useState, useEffect, useCallback } from 'react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

const ADJUST_REASONS = ['Conteo físico', 'Merma', 'Error de registro', 'Daño o pérdida', 'Devolución interna', 'Otro'];

const MOVEMENT_STYLE = {
  entrada:   { background: '#e8f5e9', color: '#2e7d32',  label: 'Entrada' },
  venta:     { background: '#fff8e1', color: '#8a5700',  label: 'Venta' },
  devolucion:{ background: '#ede7f6', color: '#6a1b9a',  label: 'Devolución' },
  ajuste:    { background: '#e3f2fd', color: '#1565c0',  label: 'Ajuste' },
};

// ── Adjustment Modal ──────────────────────────────────────────────────────────

function AdjustmentModal({ product, onClose, onConfirm }) {
  const [type, setType] = useState('add'); // 'add' | 'sub' | 'set'
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const currentStock = product.stock;
  const numAmount = parseInt(amount, 10) || 0;
  const adjustAmount = type === 'set'
    ? numAmount - currentStock
    : type === 'add' ? Math.abs(numAmount) : -Math.abs(numAmount);
  const newStock = currentStock + adjustAmount;

  const handleConfirm = async () => {
    if (!amount || !reason) { setErr('Completa todos los campos requeridos.'); return; }
    if (newStock < 0) { setErr('El ajuste resultaría en stock negativo.'); return; }
    if (adjustAmount === 0) { setErr('El ajuste no cambia el stock actual.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onConfirm({ product_id: product.id, adjustment_amount: adjustAmount, reason, notes: notes || null });
      onClose();
    } catch (e) {
      setErr(e?.message || 'Error al aplicar el ajuste.');
      setSaving(false);
    }
  };

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '4px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '12px', width: '440px', maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Ajuste de Inventario</h2>
          <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>{product.name}</div>
        </div>

        <div style={{ padding: '16px 24px' }}>
          <div style={{ background: '#f7f7f7', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#9e9e9e', marginBottom: '4px' }}>Stock actual</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>{currentStock}</div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Tipo de ajuste</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[{ value: 'add', label: '+ Agregar' }, { value: 'sub', label: '– Reducir' }, { value: 'set', label: '= Establecer' }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => { setType(opt.value); setAmount(''); }} style={{
                  padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  border: type === opt.value ? '2px solid #0078d4' : '1px solid #d1d1d1',
                  background: type === opt.value ? '#f0f7ff' : 'white',
                  color: type === opt.value ? '#0078d4' : '#5c5c5c',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>{type === 'set' ? 'Stock objetivo' : 'Cantidad'} *</label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={type === 'set' ? `Ej: ${currentStock}` : 'Ej: 5'}
              style={inp} className="fl-input" />
          </div>

          {amount && (
            <div style={{
              background: adjustAmount === 0 ? '#f5f5f5' : adjustAmount > 0 ? '#e8f5e9' : newStock < 0 ? '#ffebee' : '#fff8e1',
              borderRadius: '8px', padding: '10px', textAlign: 'center', marginBottom: '12px', fontSize: '13px',
              color: adjustAmount === 0 ? '#9e9e9e' : adjustAmount > 0 ? '#2e7d32' : newStock < 0 ? '#a4262c' : '#8a5700',
            }}>
              {currentStock} → <strong>{newStock}</strong> unidades
              {adjustAmount !== 0 && ` (${adjustAmount > 0 ? '+' : ''}${adjustAmount})`}
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Motivo *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="fl-select"
              style={{ ...inp, background: 'white' }}>
              <option value="">Seleccionar motivo...</option>
              {ADJUST_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '4px' }}>
            <label style={lbl}>Notas (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..." className="fl-input"
              style={{ ...inp, resize: 'vertical', minHeight: '56px', fontFamily: 'inherit' }} />
          </div>

          {err && <div style={{ background: '#ffebee', color: '#a4262c', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', marginTop: '10px' }}>{err}</div>}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="fl-btn-ghost" onClick={onClose} disabled={saving}
            style={{ background: 'white', border: '1px solid #d1d1d1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c' }}>
            Cancelar
          </button>
          <button type="button" className="fl-btn-primary" onClick={handleConfirm} disabled={saving}
            style={{ background: '#0078d4', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {saving ? 'Aplicando...' : 'Aplicar ajuste'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stock Movement Modal ──────────────────────────────────────────────────────

function StockMovementModal({ product, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.electron.stockMovement.getByProduct(product.id)
      .then((data) => { setMovements(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [product.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '12px', width: '560px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Movimientos de Stock</h2>
          <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>
            {product.name} · Stock actual: <strong>{product.stock}</strong>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Cargando...</p>
          ) : movements.length === 0 ? (
            <p style={{ color: '#9e9e9e', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
              Sin movimientos registrados.
            </p>
          ) : (
            movements.map((m, idx) => {
              const st = MOVEMENT_STYLE[m.type] || { background: '#f5f5f5', color: '#5c5c5c', label: m.type };
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', marginBottom: '12px', borderBottom: idx < movements.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                  <span style={{ ...st, display: 'inline-block', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' }}>
                    {st.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#1a1a1a', marginBottom: '2px' }}>{m.description}</div>
                    {m.supplier && <div style={{ fontSize: '11px', color: '#9e9e9e' }}>Proveedor: {m.supplier}</div>}
                    <div style={{ fontSize: '11px', color: '#9e9e9e' }}>
                      {new Date(m.date).toLocaleString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: m.amount > 0 ? '#2e7d32' : '#a4262c', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {m.amount > 0 ? '+' : ''}{m.amount}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="fl-btn-ghost" onClick={onClose}
            style={{ background: 'white', border: '1px solid #d1d1d1', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Photo Modal ───────────────────────────────────────────────────────────────

function PhotoModal({ product, onClose, onRefresh }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.electron.products.getPhoto(product.id)
      .then((url) => { setPhotoUrl(url); setLoading(false); })
      .catch(() => setLoading(false));
  }, [product.id]);

  const handleChange = async () => {
    setSaving(true);
    try {
      const result = await window.electron.products.savePhoto(product.id);
      if (!result.canceled) { setPhotoUrl(result.photoUrl); onRefresh(); }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar la foto de este producto?')) return;
    await window.electron.products.deletePhoto(product.id);
    setPhotoUrl(null);
    onRefresh();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '12px', width: '400px', maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Foto del producto</h2>
          <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>{product.name}</div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9e9e9e', padding: '32px 0' }}>Cargando...</div>
          ) : photoUrl ? (
            <img src={photoUrl} alt={product.name} style={{ width: '100%', borderRadius: '8px', objectFit: 'contain', maxHeight: '280px' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#9e9e9e', padding: '32px 0', border: '2px dashed #e5e5e5', borderRadius: '8px', fontSize: '14px' }}>
              Sin foto asignada
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="fl-btn-primary" onClick={handleChange} disabled={saving}
              style={{ background: '#0078d4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              {saving ? 'Guardando...' : photoUrl ? 'Cambiar foto' : 'Agregar foto'}
            </button>
            {photoUrl && (
              <button type="button" className="fl-btn-danger" onClick={handleDelete}
                style={{ background: 'white', border: '1px solid #fad9d9', color: '#a4262c', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                Eliminar
              </button>
            )}
          </div>
          <button type="button" className="fl-btn-ghost" onClick={onClose}
            style={{ background: 'white', border: '1px solid #d1d1d1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#5c5c5c' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const styles = {
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' },
  btnPrimary: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500',
  },
  errorBox: {
    background: '#ffebee', color: '#a4262c', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
};

export default function InventoryView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', product }
  const [adjustModal, setAdjustModal] = useState(null); // null | product
  const [movementModal, setMovementModal] = useState(null); // null | product
  const [photoModal, setPhotoModal] = useState(null); // null | product

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
      setSaveError(null);
      setModal(null);
      loadProducts();
    } catch (e) {
      setSaveError(e?.message || 'Error al guardar el producto.');
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

  const handleAdjust = async (data) => {
    await window.electron.adjustments.create(data);
    loadProducts();
  };

  return (
    <>
      <div style={styles.toolbar}>
        <h2 style={styles.sectionTitle}>Catálogo de Productos</h2>
        <button className="fl-btn-primary" style={styles.btnPrimary} onClick={() => setModal('create')}>
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
          onAdjust={(product) => setAdjustModal(product)}
          onMovements={(product) => setMovementModal(product)}
          onPhoto={(product) => setPhotoModal(product)}
        />
      )}

      {modal && (
        <ProductForm
          product={modal !== 'create' ? modal.product : null}
          saveError={saveError}
          onSave={handleSave}
          onCancel={() => { setModal(null); setSaveError(null); }}
        />
      )}

      {adjustModal && (
        <AdjustmentModal
          product={adjustModal}
          onClose={() => setAdjustModal(null)}
          onConfirm={handleAdjust}
        />
      )}

      {movementModal && (
        <StockMovementModal
          product={movementModal}
          onClose={() => setMovementModal(null)}
        />
      )}

      {photoModal && (
        <PhotoModal
          product={photoModal}
          onClose={() => setPhotoModal(null)}
          onRefresh={loadProducts}
        />
      )}
    </>
  );
}
