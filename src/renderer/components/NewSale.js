import React, { useState, useEffect, useRef, useMemo } from 'react';
import SaleReceipt from './SaleReceipt';

const styles = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '20px',
    alignItems: 'start',
  },
  panel: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    fontWeight: '700',
    fontSize: '14px',
    color: '#1a1a1a',
    letterSpacing: '-0.1px',
  },
  searchBox: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d1d1',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  productList: {
    maxHeight: '480px',
    overflowY: 'auto',
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
  },
  productRowDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #f5f5f5',
    opacity: 0.4,
  },
  productName: { fontWeight: '600', fontSize: '13px', color: '#1a1a1a' },
  productMeta: { fontSize: '12px', color: '#9e9e9e', marginTop: '2px' },
  productRight: { textAlign: 'right' },
  productPrice: { fontWeight: '700', fontSize: '13px', color: '#1a1a1a' },
  productStock: { fontSize: '12px', color: '#5c5c5c' },
  addBtn: {
    background: '#eff6fc',
    border: '1px solid #c7e0f4',
    color: '#0078d4',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
  },
  inCartBadge: {
    background: '#e8f5e9',
    border: '1px solid #c8e6c9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
  },
  emptySearch: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#9e9e9e',
    fontSize: '14px',
  },
  // Cart
  cartBody: {
    padding: '8px 0',
    minHeight: '120px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  cartItem: {
    padding: '10px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  cartItemName: {
    fontWeight: '500',
    fontSize: '13px',
    color: '#1e293b',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: '0 2px',
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    background: '#f1f5f9',
    border: 'none',
    width: '26px',
    height: '26px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontWeight: '600', fontSize: '14px', minWidth: '20px', textAlign: 'center' },
  itemSubtotal: { fontWeight: '600', fontSize: '14px', color: '#1e293b' },
  emptyCart: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
  },
  cartFooter: {
    padding: '14px 16px',
    borderTop: '1px solid #f0f0f0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  totalLabel: { fontWeight: '700', fontSize: '15px', color: '#1a1a1a' },
  totalAmount: { fontWeight: '700', fontSize: '22px', color: '#0078d4' },
  confirmBtn: {
    width: '100%',
    background: '#107c10',
    color: 'white',
    border: 'none',
    padding: '11px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
  },
  confirmBtnDisabled: {
    width: '100%',
    background: '#e8f5e9',
    color: '#a5d6a7',
    border: 'none',
    padding: '11px',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontSize: '15px',
    fontWeight: '600',
  },
  errorBox: {
    background: '#ffebee',
    color: '#a4262c',
    padding: '10px 16px',
    fontSize: '13px',
    borderTop: '1px solid #ffcdd2',
  },
  // Customer selector
  customerSection: {
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa',
  },
  customerLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  customerPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '6px 10px',
  },
  customerPillName: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#1d4ed8',
    flex: 1,
  },
  customerPillMeta: { fontSize: '12px', color: '#64748b' },
  customerClearBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    padding: '0 2px',
  },
  customerSearchWrap: { position: 'relative' },
  customerInput: {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  customerDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
    maxHeight: '160px',
    overflowY: 'auto',
  },
  customerOption: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f8fafc',
  },
  customerOptionName: { fontWeight: '500', fontSize: '13px', color: '#1e293b' },
  customerOptionMeta: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px',
    letterSpacing: '-0.3px',
  },
  barcodeSection: {
    padding: '10px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafafa',
  },
  barcodeLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  barcodeInput: {
    width: '100%',
    padding: '7px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
  },
  barcodeMsgOk: {
    fontSize: '11px',
    color: '#16a34a',
    marginTop: '4px',
    fontWeight: '500',
  },
  barcodeMsgErr: {
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '4px',
    fontWeight: '500',
  },
};

export default function NewSale({ onSaleComplete }) {
  const [allProducts, setAllProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null); // { sale, items, total }
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [barcodeMsg, setBarcodeMsg] = useState(null); // { type: 'ok'|'err', text }
  const barcodeRef = useRef(null);
  const barcodeMsgTimerRef = useRef(null);
  const [globalDiscountMode, setGlobalDiscountMode] = useState('amount'); // 'amount' | 'percent'
  const [globalDiscountValue, setGlobalDiscountValue] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    window.electron.products.getAll().then(setAllProducts).catch(() => setError('Error al cargar el catálogo de productos.'));
    window.electron.customers.getAll().then(setAllCustomers).catch(() => {});
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.toLowerCase().trim();
    if (!q) return [];
    return allCustomers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
      )
      .slice(0, 5);
  }, [allCustomers, customerQuery]);

  // Products filtered by query, with available stock (product stock minus qty already in cart)
  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allProducts.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    );
  }, [allProducts, query]);

  // Total qty in cart for a product across ALL lines (normal + regalía)
  const cartQtyFor = (productId) =>
    cart.filter((c) => c.product_id === productId).reduce((s, c) => s + c.quantity, 0);

  const availableStock = (product) => product.stock - cartQtyFor(product.id);

  const showBarcodeMsg = (type, text) => {
    if (barcodeMsgTimerRef.current) clearTimeout(barcodeMsgTimerRef.current);
    setBarcodeMsg({ type, text });
    barcodeMsgTimerRef.current = setTimeout(() => setBarcodeMsg(null), 2000);
  };

  const handleBarcodeScan = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const code = barcodeQuery.trim();
    if (!code) return;

    const product = allProducts.find(
      (p) => p.barcode && p.barcode.trim() === code
    );

    if (!product) {
      showBarcodeMsg('err', `Sin resultados para "${code}"`);
    } else if (availableStock(product) <= 0) {
      showBarcodeMsg('err', `Sin stock: ${product.name}`);
    } else {
      addToCart(product);
      showBarcodeMsg('ok', `Agregado: ${product.name}`);
    }
    setBarcodeQuery('');
    barcodeRef.current?.focus();
  };

  // ── Per-line discount helpers ─────────────────────────────────────────────
  const getLineDiscount = (item) => {
    if (item.is_regalia) return 0;
    const v = parseFloat(item.line_discount_value) || 0;
    if (item.line_discount_mode === 'percent') return Math.min(item.unit_price * v / 100, item.unit_price);
    return Math.min(v, item.unit_price);
  };
  const getEffectivePrice = (item) => Math.max(0, item.unit_price - getLineDiscount(item));
  const getLineSubtotal   = (item) => item.is_regalia ? 0 : getEffectivePrice(item) * item.quantity;

  const setLineDiscount = (productId, regaliaType, field, value) =>
    setCart((prev) => prev.map((c) =>
      c.product_id === productId && c.regalia_type === regaliaType ? { ...c, [field]: value } : c
    ));

  const addToCart = (product, regaliaType = null) => {
    if (availableStock(product) <= 0) return;
    const isRegalia = regaliaType !== null;
    // Effective price priority: precio_neto → offer_price → sale_price
    const sinIva = Number(product.precio_venta_sin_iva) || Number(product.sale_price) || 0;
    const netoRaw = product.precio_neto != null
      ? Number(product.precio_neto)
      : (product.offer_price ? Number(product.offer_price) : sinIva);
    const effectivePrice = isRegalia ? 0 : netoRaw;
    const discountAmount = isRegalia ? 0 : parseFloat((sinIva - netoRaw).toFixed(6));
    const discountPct    = isRegalia ? 0 : parseFloat(Number(product.descuento_porcentaje || 0).toFixed(6));

    setCart((prev) => {
      // Each (product_id, regalia_type) pair is a separate line
      const existing = prev.find((c) => c.product_id === product.id && c.regalia_type === regaliaType);
      if (existing) {
        return prev.map((c) =>
          c.product_id === product.id && c.regalia_type === regaliaType
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          unit_price: effectivePrice,
          quantity: 1,
          is_regalia: isRegalia,
          regalia_type: regaliaType,         // null | 'propia' | 'bonificacion'
          line_discount_mode: 'amount',
          line_discount_value: 0,
          product_discount_amount: discountAmount,
          discount_percentage: discountPct,
        },
      ];
    });
  };

  const setQty = (productId, regaliaType, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => !(c.product_id === productId && c.regalia_type === regaliaType)));
      return;
    }
    const product = allProducts.find((p) => p.id === productId);
    // Cap: total of all lines for this product must not exceed stock
    const otherQty = cart
      .filter((c) => c.product_id === productId && c.regalia_type !== regaliaType)
      .reduce((s, c) => s + c.quantity, 0);
    if (qty + otherQty > product.stock) return;
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId && c.regalia_type === regaliaType ? { ...c, quantity: qty } : c
      )
    );
  };

  // ── Computed totals ──────────────────────────────────────────────────────
  const r2 = (v) => parseFloat(v.toFixed(2));
  const regularCart = cart.filter((i) => !i.is_regalia);
  const regaliaPropiaCount  = cart.filter((i) => i.regalia_type === 'propia').reduce((s, i) => s + i.quantity, 0);
  const bonificacionCount   = cart.filter((i) => i.regalia_type === 'bonificacion').reduce((s, i) => s + i.quantity, 0);
  const subtotalBruto      = r2(regularCart.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  const lineDiscountsTotal = r2(regularCart.reduce((s, i) => s + getLineDiscount(i) * i.quantity, 0));
  const subtotalPostLine   = r2(subtotalBruto - lineDiscountsTotal);
  const globalDiscRaw      = parseFloat(globalDiscountValue) || 0;
  const globalDiscAmount   = r2(globalDiscountMode === 'percent'
    ? subtotalPostLine * globalDiscRaw / 100
    : Math.min(globalDiscRaw, subtotalPostLine));
  const totalDescuentos = r2(lineDiscountsTotal + globalDiscAmount);
  const subtotalNeto    = r2(Math.max(0, subtotalPostLine - globalDiscAmount));
  const tax             = r2(subtotalNeto * 0.13);
  const total           = r2(subtotalNeto + tax);

  const confirmSale = async () => {
    if (cart.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      // Build final items with effective prices (after cart-level line discounts)
      const itemsForSale = cart.map((item) => {
        const discUnit = getLineDiscount(item);
        const effPrice = item.is_regalia ? 0 : getEffectivePrice(item);
        const lineSub  = item.is_regalia ? 0 : effPrice * item.quantity;
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          unit_price: effPrice,
          quantity: item.quantity,
          subtotal: lineSub,
          is_regalia: item.is_regalia,
          regalia_type: item.regalia_type ?? null,
          discount_amount: item.is_regalia ? 0 : discUnit,
          discount_percentage: (!item.is_regalia && item.line_discount_mode === 'percent')
            ? parseFloat(item.line_discount_value) || 0 : 0,
        };
      });

      const savedSale = await window.electron.sales.create(
        itemsForSale,
        selectedCustomer?.id ?? null,
        selectedCustomer?.name ?? null,
        paymentMethod,
        'Completada',
        globalDiscAmount
      );
      setReceipt({
        sale: savedSale,
        items: [...cart],
        subtotalBruto,
        totalDescuentos,
        globalDiscountAmount: globalDiscAmount,
        subtotalNeto,
        tax,
        total,
      });
      setCart([]);
      setQuery('');
      setSelectedCustomer(null);
      setCustomerQuery('');
      setPaymentMethod('Efectivo');
      setGlobalDiscountValue('');
    } catch {
      setError('Error al confirmar la venta. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2 style={styles.sectionTitle}>Nueva Venta</h2>
      <div style={styles.layout}>
        {/* Product search panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>Productos</div>

          {/* Barcode scanner input */}
          <div style={styles.barcodeSection}>
            <div style={styles.barcodeLabel}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.6 }}>
                <rect x="0"   y="0" width="1.5" height="12" />
                <rect x="3"   y="0" width="1"   height="12" />
                <rect x="5.5" y="0" width="2"   height="12" />
                <rect x="9"   y="0" width="1"   height="12" />
                <rect x="11" y="0" width="1"   height="12" />
              </svg>
              Escanear código de barras
            </div>
            <input
              ref={barcodeRef}
              style={styles.barcodeInput}
              placeholder="Escanea o escribe el código y presiona Enter"
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              onKeyDown={handleBarcodeScan}
            />
            {barcodeMsg && (
              <div style={barcodeMsg.type === 'ok' ? styles.barcodeMsgOk : styles.barcodeMsgErr}>
                {barcodeMsg.text}
              </div>
            )}
          </div>

          <div style={styles.searchBox}>
            <input
              style={styles.searchInput}
              placeholder="Buscar por nombre o categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div style={styles.productList}>
            {filteredProducts.length === 0 ? (
              <p style={styles.emptySearch}>Sin resultados para "{query}"</p>
            ) : (
              filteredProducts.map((product) => {
                const inCart = cartQtyFor(product.id);
                const avail = availableStock(product);
                const outOfStock = avail <= 0;

                return (
                  <div
                    key={product.id}
                    style={outOfStock ? styles.productRowDisabled : styles.productRow}
                  >
                    <div>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productMeta}>
                        {product.category || 'Sin categoría'} · Stock: {avail}
                        {inCart > 0 && ` (${inCart} en carrito)`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={styles.productRight}>
                        <div style={styles.productPrice}>
                          {(() => {
                            const sinIva = Number(product.precio_venta_sin_iva) || Number(product.sale_price) || 0;
                            const neto = product.precio_neto != null ? Number(product.precio_neto)
                              : (product.offer_price ? Number(product.offer_price) : sinIva);
                            const hasDiscount = neto < sinIva && sinIva > 0;
                            return hasDiscount
                              ? <>${neto.toFixed(2)} <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px' }}>${sinIva.toFixed(2)}</span></>
                              : `$${neto.toFixed(2)}`;
                          })()}
                        </div>
                      </div>
                      {outOfStock ? (
                        <span style={{ ...styles.inCartBadge, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                          Sin stock
                        </span>
                      ) : (
                        <>
                          <span
                            style={styles.addBtn}
                            onClick={() => addToCart(product)}
                          >
                            Agregar
                          </span>
                          {product.disponible_regalia && (
                            <>
                              <span
                                style={{ ...styles.addBtn, background: '#f3e5f5', border: '1px solid #ce93d8', color: '#6a1b9a', fontSize: '11px' }}
                                onClick={() => addToCart(product, 'propia')}
                                title="Regalía propia — costo absorbido por el negocio"
                              >
                                🎁 Regalía
                              </span>
                              <span
                                style={{ ...styles.addBtn, background: '#e3f2fd', border: '1px solid #90caf9', color: '#1565c0', fontSize: '11px' }}
                                onClick={() => addToCart(product, 'bonificacion')}
                                title="Bonificación de proveedor — sin costo para el negocio"
                              >
                                📦 Bonif.
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cart panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>Carrito</div>

          {/* Customer selector */}
          <div style={styles.customerSection}>
            <div style={styles.customerLabel}>
              Cliente <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </div>
            {selectedCustomer ? (
              <div style={styles.customerPill}>
                <span style={styles.customerPillName}>{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span style={styles.customerPillMeta}>{selectedCustomer.phone}</span>
                )}
                <button
                  style={styles.customerClearBtn}
                  onClick={() => setSelectedCustomer(null)}
                  title="Quitar cliente"
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={styles.customerSearchWrap}>
                <input
                  style={styles.customerInput}
                  placeholder="Buscar cliente por nombre o teléfono..."
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                />
                {filteredCustomers.length > 0 && (
                  <div style={styles.customerDropdown}>
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        style={styles.customerOption}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerQuery('');
                        }}
                      >
                        <div style={styles.customerOptionName}>{c.name}</div>
                        {c.phone && (
                          <div style={styles.customerOptionMeta}>{c.phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.cartBody}>
            {cart.length === 0 ? (
              <p style={styles.emptyCart}>Haz clic en un producto para agregarlo.</p>
            ) : (
              cart.map((item) => {
                const discUnit  = getLineDiscount(item);
                const effPrice  = getEffectivePrice(item);
                const lineSub   = getLineSubtotal(item);
                const hasDisc   = discUnit > 0;
                return (
                  <div
                    key={`${item.product_id}_${item.regalia_type ?? 'normal'}`}
                    style={{
                      ...styles.cartItem,
                      background: item.regalia_type === 'propia' ? '#fdf5ff'
                        : item.regalia_type === 'bonificacion' ? '#f0f8ff' : undefined,
                    }}
                  >
                    {/* Name row */}
                    <div style={styles.cartItemName}>
                      <div>
                        <span>{item.product_name}</span>
                        {item.regalia_type === 'propia' && (
                          <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '10px', fontWeight: '700', color: '#6a1b9a', background: '#ede7f6', padding: '1px 6px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                            🎁 REGALÍA
                          </span>
                        )}
                        {item.regalia_type === 'bonificacion' && (
                          <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '10px', fontWeight: '700', color: '#1565c0', background: '#e3f2fd', padding: '1px 6px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                            📦 BONIF.
                          </span>
                        )}
                      </div>
                      <button style={styles.removeBtn} onClick={() => setQty(item.product_id, item.regalia_type, 0)} title="Quitar">×</button>
                    </div>

                    {/* Discount row — only for non-regalía */}
                    {!item.is_regalia && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#9e9e9e' }}>${item.unit_price.toFixed(2)}/ud</span>
                        <span style={{ fontSize: '11px', color: '#9e9e9e' }}>Desc:</span>
                        {/* Mode toggle */}
                        <button
                          style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', border: '1px solid #d1d1d1', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', color: '#5c5c5c' }}
                          onClick={() => setLineDiscount(item.product_id, item.regalia_type, 'line_discount_mode', item.line_discount_mode === 'amount' ? 'percent' : 'amount')}
                          title="Cambiar tipo de descuento"
                        >
                          {item.line_discount_mode === 'amount' ? '$' : '%'}
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.line_discount_value || ''}
                          onChange={(e) => setLineDiscount(item.product_id, item.regalia_type, 'line_discount_value', e.target.value)}
                          placeholder="0"
                          style={{ width: '52px', padding: '2px 6px', border: '1px solid #d1d1d1', borderRadius: '4px', fontSize: '12px', textAlign: 'right' }}
                        />
                        {hasDisc && (
                          <span style={{ fontSize: '11px', color: '#0078d4', fontWeight: '700' }}>
                            → ${effPrice.toFixed(2)}/ud
                          </span>
                        )}
                      </div>
                    )}

                    {/* Qty + subtotal row */}
                    <div style={styles.qtyRow}>
                      <div style={styles.qtyControls}>
                        <button style={styles.qtyBtn} onClick={() => setQty(item.product_id, item.regalia_type, item.quantity - 1)}>−</button>
                        <span style={styles.qtyValue}>{item.quantity}</span>
                        <button style={styles.qtyBtn} onClick={() => setQty(item.product_id, item.regalia_type, item.quantity + 1)}>+</button>
                      </div>
                      <span style={{ ...styles.itemSubtotal, color: item.regalia_type === 'propia' ? '#6a1b9a' : item.regalia_type === 'bonificacion' ? '#1565c0' : undefined }}>
                        {item.is_regalia ? '$0.00' : `$${lineSub.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={styles.cartFooter}>
            {/* Payment method */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                Método de pago
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {/* Global discount */}
            {cart.length > 0 && regularCart.length > 0 && (
              <div style={{ marginBottom: '10px', padding: '8px 10px', background: '#fafafa', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Descuento global
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', border: '1px solid #d1d1d1', borderRadius: '4px', background: '#f0f0f0', cursor: 'pointer', color: '#5c5c5c', minWidth: '28px' }}
                    onClick={() => setGlobalDiscountMode((m) => m === 'amount' ? 'percent' : 'amount')}
                    title="Cambiar tipo"
                  >
                    {globalDiscountMode === 'amount' ? '$' : '%'}
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={globalDiscountValue}
                    onChange={(e) => setGlobalDiscountValue(e.target.value)}
                    placeholder="0"
                    style={{ flex: 1, padding: '4px 8px', border: '1px solid #d1d1d1', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  {globalDiscAmount > 0 && (
                    <span style={{ fontSize: '12px', color: '#e65100', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      −${globalDiscAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Breakdown */}
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Subtotal bruto</span>
                <span>${subtotalBruto.toFixed(2)}</span>
              </div>
              {totalDescuentos > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#e65100' }}>
                  <span>Descuentos (−)</span>
                  <span>−${totalDescuentos.toFixed(2)}</span>
                </div>
              )}
              {totalDescuentos > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '600', color: '#1a1a1a' }}>
                  <span>Subtotal neto</span>
                  <span>${subtotalNeto.toFixed(2)}</span>
                </div>
              )}
              {regaliaPropiaCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#6a1b9a' }}>
                  <span>🎁 Regalías propias ({regaliaPropiaCount} ud{regaliaPropiaCount !== 1 ? 's' : ''})</span>
                  <span>$0.00</span>
                </div>
              )}
              {bonificacionCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#1565c0' }}>
                  <span>📦 Bonif. proveedor ({bonificacionCount} ud{bonificacionCount !== 1 ? 's' : ''})</span>
                  <span>$0.00</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>IVA (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalAmount}>${total.toFixed(2)}</span>
            </div>
            <button
              style={cart.length === 0 || saving ? styles.confirmBtnDisabled : styles.confirmBtn}
              onClick={() => { if (cart.length > 0 && !saving) setShowConfirmModal(true); }}
              disabled={cart.length === 0 || saving}
            >
              Confirmar Venta
            </button>
          </div>
          {error && <div style={styles.errorBox}>{error}</div>}
        </div>
      </div>

      {/* ── Confirm Sale Modal ─────────────────────────────────────────── */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 900, padding: '24px',
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>Confirmar Venta</span>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}
              >×</button>
            </div>

            {/* Items table */}
            <div style={{ padding: '12px 20px', flex: 1 }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 72px 72px 72px', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>
                <span>Producto</span>
                <span style={{ textAlign: 'center' }}>Cant</span>
                <span style={{ textAlign: 'right' }}>P.Unit</span>
                <span style={{ textAlign: 'right' }}>Desc</span>
                <span style={{ textAlign: 'right' }}>Subtotal</span>
              </div>

              {/* Regular items */}
              {cart.map((item) => {
                const discUnit = getLineDiscount(item);
                const effPrice = getEffectivePrice(item);
                const lineSub  = getLineSubtotal(item);
                const badgeColor = item.regalia_type === 'propia' ? '#6a1b9a' : item.regalia_type === 'bonificacion' ? '#1565c0' : null;
                return (
                  <div key={`${item.product_id}_${item.regalia_type ?? 'normal'}`} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 72px 72px 72px', gap: '6px', fontSize: '13px', padding: '7px 0', borderBottom: '1px solid #f8fafc', alignItems: 'start' }}>
                    <span style={{ fontWeight: '500', color: badgeColor ?? '#1e293b', wordBreak: 'break-word' }}>
                      {item.product_name}
                      {item.regalia_type === 'propia' && <span style={{ marginLeft: '5px', fontSize: '10px' }}>🎁</span>}
                      {item.regalia_type === 'bonificacion' && <span style={{ marginLeft: '5px', fontSize: '10px' }}>📦</span>}
                    </span>
                    <span style={{ textAlign: 'center', color: '#5c5c5c' }}>{item.quantity}</span>
                    <span style={{ textAlign: 'right', color: '#5c5c5c' }}>${item.unit_price.toFixed(2)}</span>
                    <span style={{ textAlign: 'right', color: discUnit > 0 ? '#e65100' : '#c4c4c4', fontSize: '12px' }}>
                      {discUnit > 0 ? `−$${discUnit.toFixed(2)}` : '—'}
                    </span>
                    <span style={{ textAlign: 'right', fontWeight: '600', color: badgeColor ?? '#1e293b' }}>
                      {item.is_regalia ? '$0.00' : `$${lineSub.toFixed(2)}`}
                    </span>
                  </div>
                );
              })}

              {/* Totals breakdown */}
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}>
                  <span>Subtotal bruto</span><span>${subtotalBruto.toFixed(2)}</span>
                </div>
                {totalDescuentos > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e65100', marginBottom: '4px' }}>
                      <span>Descuentos (−)</span><span>−${totalDescuentos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a1a1a', fontWeight: '600', marginBottom: '4px' }}>
                      <span>Subtotal neto</span><span>${subtotalNeto.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {regaliaPropiaCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6a1b9a', marginBottom: '4px' }}>
                    <span>🎁 Regalías propias</span><span>$0.00</span>
                  </div>
                )}
                {bonificacionCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1565c0', marginBottom: '4px' }}>
                    <span>📦 Bonif. proveedor</span><span>$0.00</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}>
                  <span>IVA (13%)</span><span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1a1a1a', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>Total</span>
                  <span style={{ fontWeight: '700', fontSize: '20px', color: '#0078d4' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Método de pago</span>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a1a' }}>{paymentMethod}</span>
              </div>
              {selectedCustomer && (
                <div style={{ marginTop: '6px', padding: '8px 12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Cliente</span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#1d4ed8' }}>{selectedCustomer.name}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ margin: '0 20px', padding: '8px 12px', background: '#ffebee', color: '#a4262c', borderRadius: '6px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowConfirmModal(false); setError(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => { await confirmSale(); setShowConfirmModal(false); }}
                disabled={saving}
                style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: saving ? '#e8f5e9' : '#107c10', color: saving ? '#a5d6a7' : 'white', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <SaleReceipt
          sale={receipt.sale}
          items={receipt.items}
          subtotalBruto={receipt.subtotalBruto}
          totalDescuentos={receipt.totalDescuentos}
          globalDiscountAmount={receipt.globalDiscountAmount}
          subtotalNeto={receipt.subtotalNeto}
          tax={receipt.tax}
          total={receipt.total}
          onClose={() => { setReceipt(null); onSaleComplete(); }}
        />
      )}
    </>
  );
}
