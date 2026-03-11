import React, { useState, useEffect, useRef } from 'react';

const CONDITIONS = ['Nuevo', 'Bueno', 'Regular', 'Para reparar'];
const STATUSES = ['Disponible', 'Reservado', 'Vendido', 'En reparación'];

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '580px',
    maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  header: { padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 },
  title: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  body: { padding: '0 24px', overflowY: 'auto', flex: 1 },
  footer: {
    padding: '16px 24px', borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0,
  },
  section: { paddingTop: '16px', paddingBottom: '4px' },
  sectionTitle: {
    fontSize: '11px', fontWeight: '700', color: '#9e9e9e',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px',
    paddingBottom: '6px', borderBottom: '1px solid #f0f0f0',
  },
  field: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5c5c5c', marginBottom: '4px' },
  hint: { fontSize: '11px', color: '#9e9e9e', marginTop: '3px' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '13px', background: 'white', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d1d1',
    borderRadius: '6px', fontSize: '13px', resize: 'vertical', minHeight: '64px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  btnCancel: {
    background: 'white', border: '1px solid #d1d1d1',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c',
  },
  btnSave: {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  },
};

function SectionTitle({ children }) {
  return <div style={s.sectionTitle}>{children}</div>;
}

function BarcodeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px', opacity: 0.45 }}>
      <rect x="0"   y="0" width="1.5" height="12" />
      <rect x="3"   y="0" width="1"   height="12" />
      <rect x="5.5" y="0" width="2"   height="12" />
      <rect x="9"   y="0" width="1"   height="12" />
      <rect x="11"  y="0" width="1"   height="12" />
    </svg>
  );
}

export default function ProductForm({ product, saveError, onSave, onCancel }) {
  const isEdit = Boolean(product);
  const serialNumberRef = useRef(null);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    serial_number: product?.serial_number ?? '',
    condition: product?.condition ?? '',
    status: product?.status ?? 'Disponible',
    disponible_regalia: product?.disponible_regalia ?? false,
    // New pricing model (6 decimal places). Fall back to legacy fields for existing products.
    precio_costo:         product?.precio_costo         ?? product?.cost_price  ?? '',
    precio_venta_sin_iva: product?.precio_venta_sin_iva ?? product?.sale_price  ?? '',
    descuento_monto:      product?.descuento_monto      ?? '',
    descuento_porcentaje: product?.descuento_porcentaje ?? '',
    category: product?.category ?? '',
    location: product?.location ?? '',
    description: product?.description ?? '',
    technical_notes: product?.technical_notes ?? '',
  });
  const [categories, setCategories] = useState([]);
  const [bonifInfo, setBonifInfo] = useState(null);
  const [bonifPrice, setBonifPrice] = useState('');
  const [bonifSaving, setBonifSaving] = useState(false);
  const [bonifMsg, setBonifMsg] = useState(null); // { type: 'ok'|'err', text }

  useEffect(() => {
    window.electron.categories.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit && product?.id) {
      window.electron.products.getBonificacionInfo(product.id)
        .then((info) => {
          setBonifInfo(info);
          if (info.currentPrice != null) setBonifPrice(String(info.currentPrice));
        })
        .catch(() => {});
    }
  }, [isEdit, product?.id]);

  const handleUpdateBonifPrice = async () => {
    const price = parseFloat(bonifPrice);
    if (!price || price <= 0) return;
    setBonifSaving(true);
    setBonifMsg(null);
    try {
      await window.electron.products.updateBonificacionPrice({
        productId: product.id,
        productName: product.name,
        newPrice: price,
      });
      const info = await window.electron.products.getBonificacionInfo(product.id);
      setBonifInfo(info);
      setBonifMsg({ type: 'ok', text: 'Precio actualizado correctamente.' });
    } catch {
      setBonifMsg({ type: 'err', text: 'Error al actualizar el precio.' });
    } finally {
      setBonifSaving(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Live-computed pricing values (6 decimal places stored, 2 displayed)
  const sinIva = parseFloat(form.precio_venta_sin_iva) || 0;
  const costo  = parseFloat(form.precio_costo) || 0;
  const dMonto = parseFloat(form.descuento_monto) || 0;
  const dPorc  = parseFloat(form.descuento_porcentaje) || 0;
  const conIva = sinIva * 1.13;
  const neto   = Math.max(0, sinIva * (1 - dPorc / 100) - dMonto);
  const util   = neto - costo;

  const p6 = (v) => parseFloat(v.toFixed(6));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      barcode: form.barcode.trim() || null,
      serial_number: form.serial_number.trim() || null,
      condition: form.condition || null,
      status: form.status || 'Disponible',
      disponible_regalia: form.disponible_regalia,
      // New pricing fields (6 decimal precision)
      precio_costo:         form.precio_costo !== ''         ? p6(parseFloat(form.precio_costo))         : null,
      precio_venta_sin_iva: form.precio_venta_sin_iva !== '' ? p6(parseFloat(form.precio_venta_sin_iva)) : null,
      precio_venta_con_iva: sinIva > 0 ? p6(conIva) : null,
      descuento_monto:      dMonto > 0 ? p6(dMonto) : 0,
      descuento_porcentaje: dPorc > 0  ? p6(dPorc)  : 0,
      precio_neto:          sinIva > 0 ? p6(neto)   : null,
      utilidad:             (sinIva > 0 || costo > 0) ? p6(util) : null,
      // Legacy fields kept in sync for backward compat (sale_price DB column is NOT NULL)
      sale_price: sinIva > 0 ? p6(sinIva) : (parseFloat(form.precio_venta_sin_iva) || 0.01),
      cost_price: form.precio_costo !== '' ? p6(parseFloat(form.precio_costo)) : null,
      offer_price: null,
      category: form.category || null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      technical_notes: form.technical_notes.trim() || null,
    });
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div style={s.body}>

            {/* ── Identificación ──────────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Identificación</SectionTitle>

              <div style={s.field}>
                <label style={s.label}>Nombre *</label>
                <input
                  className="fl-input"
                  style={s.input}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Ej: Laptop Dell Latitude 5490"
                  required
                  autoFocus
                />
              </div>

              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>SKU / Código</label>
                  <input
                    className="fl-input"
                    style={s.input}
                    value={form.sku}
                    onChange={set('sku')}
                    placeholder="Ej: PRD-001"
                  />
                  <div style={s.hint}>Se genera automáticamente si se deja vacío</div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Código de barras <BarcodeIcon /></label>
                  <input
                    className="fl-input"
                    style={s.input}
                    value={form.barcode}
                    onChange={set('barcode')}
                    placeholder="Escanear o ingresar"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        serialNumberRef.current?.focus();
                      }
                    }}
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Número de serie</label>
                <input
                  ref={serialNumberRef}
                  className="fl-input"
                  style={s.input}
                  value={form.serial_number}
                  onChange={set('serial_number')}
                  placeholder="Importante para equipos reacondicionados"
                />
              </div>
            </div>

            {/* ── Condición y estado ──────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Condición y Estado</SectionTitle>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Condición</label>
                  <select className="fl-select" style={s.select} value={form.condition} onChange={set('condition')}>
                    <option value="">Sin especificar</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Estado</label>
                  <select className="fl-select" style={s.select} value={form.status} onChange={set('status')}>
                    {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            </div>

              <div style={{ ...s.field, marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={form.disponible_regalia}
                    onChange={(e) => setForm((prev) => ({ ...prev, disponible_regalia: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6a1b9a' }}
                  />
                  <span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>¿Disponible como regalía?</span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#9e9e9e', marginTop: '1px' }}>
                      Muestra el botón "+ Regalía" en Nueva Venta para agregar a precio $0.00
                    </span>
                  </span>
                </label>
              </div>

            {/* ── Precios ─────────────────────────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Precios</SectionTitle>

              {/* Row 1: costo | sin IVA | con IVA (auto) */}
              <div style={s.grid3}>
                <div style={s.field}>
                  <label style={s.label}>Precio de costo ($)</label>
                  <input className="fl-input" style={s.input} type="number" min="0" step="0.01"
                    value={form.precio_costo} onChange={set('precio_costo')} placeholder="0.00" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Precio venta s/IVA ($) *</label>
                  <input className="fl-input" style={s.input} type="number" min="0.01" step="0.01"
                    value={form.precio_venta_sin_iva} onChange={set('precio_venta_sin_iva')} placeholder="0.00" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Precio venta c/IVA (auto)</label>
                  <div style={{ ...s.input, background: '#f7f7f7', color: sinIva > 0 ? '#1a1a1a' : '#9e9e9e', display: 'flex', alignItems: 'center' }}>
                    {sinIva > 0 ? `$${conIva.toFixed(2)}` : '—'}
                  </div>
                  <div style={s.hint}>Precio venta s/IVA × 1.13</div>
                </div>
              </div>

              {/* Row 2: descuento monto | descuento % | precio neto (auto) | utilidad (auto) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div style={s.field}>
                  <label style={s.label}>Descuento monto ($)</label>
                  <input className="fl-input" style={s.input} type="number" min="0" step="0.01"
                    value={form.descuento_monto} onChange={set('descuento_monto')} placeholder="0.00" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Descuento %</label>
                  <input className="fl-input" style={s.input} type="number" min="0" max="100" step="0.01"
                    value={form.descuento_porcentaje} onChange={set('descuento_porcentaje')} placeholder="0.00" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Precio neto (auto)</label>
                  <div style={{ ...s.input, background: '#f7f7f7', color: sinIva > 0 ? '#0078d4' : '#9e9e9e', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    {sinIva > 0 ? `$${neto.toFixed(2)}` : '—'}
                  </div>
                  <div style={s.hint}>s/IVA − descuentos</div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Utilidad (auto)</label>
                  <div style={{
                    ...s.input, background: '#f7f7f7', fontWeight: '600', display: 'flex', alignItems: 'center',
                    color: (sinIva > 0 || costo > 0) ? (util >= 0 ? '#107c10' : '#a4262c') : '#9e9e9e',
                  }}>
                    {(sinIva > 0 || costo > 0) ? `$${util.toFixed(2)}` : '—'}
                  </div>
                  <div style={s.hint}>Neto − costo</div>
                </div>
              </div>
            </div>

            {/* ── Unidades Bonificadas ────────────────────────────── */}
            {isEdit && bonifInfo && (bonifInfo.totalBonifiedUnits > 0 || bonifInfo.priceHistory.length > 0) && (
              <div style={s.section}>
                <SectionTitle>Unidades Bonificadas</SectionTitle>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1, background: '#e3f2fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#1565c0' }}>{bonifInfo.totalBonifiedUnits}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Unidades bonificadas totales</div>
                  </div>
                  <div style={{ flex: 1, background: '#f0f7ff', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#0078d4' }}>
                      {bonifInfo.currentPrice != null ? `$${Number(bonifInfo.currentPrice).toFixed(2)}` : '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Último precio asignado</div>
                  </div>
                </div>

                {/* Update price */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <div style={{ flex: 1, ...s.field, marginBottom: 0 }}>
                    <label style={s.label}>Nuevo precio de venta sin IVA ($)</label>
                    <input
                      className="fl-input"
                      style={s.input}
                      type="number"
                      min="0"
                      step="0.01"
                      value={bonifPrice}
                      onChange={(e) => setBonifPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateBonifPrice}
                    disabled={bonifSaving || !bonifPrice || parseFloat(bonifPrice) <= 0}
                    style={{
                      background: '#0078d4', color: 'white', border: 'none',
                      padding: '8px 14px', borderRadius: '6px', cursor: bonifSaving ? 'not-allowed' : 'pointer',
                      fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                      opacity: (!bonifPrice || parseFloat(bonifPrice) <= 0) ? 0.5 : 1,
                    }}
                  >
                    {bonifSaving ? 'Actualizando...' : 'Actualizar precio bonificados'}
                  </button>
                </div>

                {bonifMsg && (
                  <div style={{
                    padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '10px',
                    background: bonifMsg.type === 'ok' ? '#e8f5e9' : '#ffebee',
                    color: bonifMsg.type === 'ok' ? '#2e7d32' : '#a4262c',
                  }}>
                    {bonifMsg.text}
                  </div>
                )}

                {/* Audit trail */}
                {bonifInfo.priceHistory.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Historial de precios
                    </div>
                    {bonifInfo.priceHistory.map((log) => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5', fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>
                          {new Date(log.created_at).toLocaleString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>
                          {log.previous_price != null && (
                            <span style={{ color: '#9e9e9e', textDecoration: 'line-through', marginRight: '6px' }}>
                              ${Number(log.previous_price).toFixed(2)}
                            </span>
                          )}
                          <span style={{ fontWeight: '700', color: '#0078d4' }}>→ ${Number(log.new_price).toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Clasificación y Ubicación ───────────────────────── */}
            <div style={s.section}>
              <SectionTitle>Clasificación y Ubicación</SectionTitle>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Categoría</label>
                  <select className="fl-select" style={s.select} value={form.category} onChange={set('category')}>
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                  {categories.length === 0 && <div style={s.hint}>Gestiona categorías en la pestaña "Categorías"</div>}
                </div>
                <div style={s.field}>
                  <label style={s.label}>Ubicación física</label>
                  <input className="fl-input" style={s.input} value={form.location} onChange={set('location')} placeholder="Ej: Estante A3" />
                </div>
              </div>
            </div>

            {/* ── Notas ───────────────────────────────────────────── */}
            <div style={{ ...s.section, paddingBottom: '16px' }}>
              <SectionTitle>Descripción y Notas</SectionTitle>
              <div style={s.field}>
                <label style={s.label}>Descripción</label>
                <textarea className="fl-input" style={s.textarea} value={form.description} onChange={set('description')} placeholder="Descripción general del producto" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Notas técnicas</label>
                <textarea className="fl-input" style={{ ...s.textarea, minHeight: '56px' }} value={form.technical_notes} onChange={set('technical_notes')} placeholder="Reparaciones, detalles técnicos, observaciones..." />
              </div>
            </div>

          </div>

          {saveError && (
            <div style={{ background: '#ffebee', color: '#a4262c', padding: '10px 24px', fontSize: '13px', borderTop: '1px solid #ffcdd2' }}>
              {saveError}
            </div>
          )}

          <div style={s.footer}>
            <button type="button" className="fl-btn-ghost" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="fl-btn-primary" style={s.btnSave}>
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
