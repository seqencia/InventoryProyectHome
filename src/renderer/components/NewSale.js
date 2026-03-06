import React, { useState, useEffect, useMemo } from 'react';
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
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontWeight: '600',
    fontSize: '15px',
    color: '#1e293b',
  },
  searchBox: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
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
    borderBottom: '1px solid #f8fafc',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  productRowDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #f8fafc',
    opacity: 0.45,
  },
  productName: { fontWeight: '500', fontSize: '14px', color: '#1e293b' },
  productMeta: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  productRight: { textAlign: 'right' },
  productPrice: { fontWeight: '600', fontSize: '14px', color: '#1e293b' },
  productStock: { fontSize: '12px', color: '#64748b' },
  addBtn: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#2563eb',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
  },
  inCartBadge: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
  },
  emptySearch: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#94a3b8',
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
    borderTop: '2px solid #f1f5f9',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  totalLabel: { fontWeight: '600', fontSize: '15px', color: '#1e293b' },
  totalAmount: { fontWeight: '700', fontSize: '20px', color: '#1e293b' },
  confirmBtn: {
    width: '100%',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
  },
  confirmBtnDisabled: {
    width: '100%',
    background: '#d1fae5',
    color: '#6ee7b7',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '15px',
    fontWeight: '600',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px 16px',
    fontSize: '13px',
    borderTop: '1px solid #fecaca',
  },
  // Customer selector
  customerSection: {
    padding: '10px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafafa',
  },
  customerLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
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
    fontSize: '17px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
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

  useEffect(() => {
    window.electron.products.getAll().then(setAllProducts);
    window.electron.customers.getAll().then(setAllCustomers);
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

  const cartQtyFor = (productId) => {
    const item = cart.find((c) => c.product_id === productId);
    return item ? item.quantity : 0;
  };

  const availableStock = (product) => product.stock - cartQtyFor(product.id);

  const addToCart = (product) => {
    if (availableStock(product) <= 0) return;
    const effectivePrice = product.offer_price
      ? Number(product.offer_price)
      : Number(product.sale_price);
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product_id === product.id
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unit_price }
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
          subtotal: effectivePrice,
        },
      ];
    });
  };

  const setQty = (productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
      return;
    }
    const product = allProducts.find((p) => p.id === productId);
    if (qty > product.stock) return;
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, quantity: qty, subtotal: qty * c.unit_price }
          : c
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const confirmSale = async () => {
    if (cart.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const savedSale = await window.electron.sales.create(
        cart,
        selectedCustomer?.id ?? null,
        selectedCustomer?.name ?? null,
        paymentMethod,
        'Completada'
      );
      setReceipt({ sale: savedSale, items: [...cart], subtotal, tax, total });
      setCart([]);
      setQuery('');
      setSelectedCustomer(null);
      setCustomerQuery('');
      setPaymentMethod('Efectivo');
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
                    onClick={() => !outOfStock && addToCart(product)}
                  >
                    <div>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productMeta}>
                        {product.category || 'Sin categoría'} · Stock: {avail}
                        {inCart > 0 && ` (${inCart} en carrito)`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={styles.productRight}>
                        <div style={styles.productPrice}>
                          {product.offer_price
                            ? <>${Number(product.offer_price).toFixed(2)} <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px' }}>${Number(product.sale_price).toFixed(2)}</span></>
                            : `$${Number(product.sale_price).toFixed(2)}`
                          }
                        </div>
                      </div>
                      {outOfStock ? (
                        <span style={{ ...styles.inCartBadge, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                          Sin stock
                        </span>
                      ) : inCart > 0 ? (
                        <span style={styles.inCartBadge}>+{inCart}</span>
                      ) : (
                        <span style={styles.addBtn}>Agregar</span>
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
              <p style={styles.emptyCart}>
                Haz clic en un producto para agregarlo.
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} style={styles.cartItem}>
                  <div style={styles.cartItemName}>
                    <span>{item.product_name}</span>
                    <button
                      style={styles.removeBtn}
                      onClick={() => setQty(item.product_id, 0)}
                      title="Quitar del carrito"
                    >
                      ×
                    </button>
                  </div>
                  <div style={styles.qtyRow}>
                    <div style={styles.qtyControls}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => setQty(item.product_id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span style={styles.qtyValue}>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => setQty(item.product_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span style={styles.itemSubtotal}>
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
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
            {/* Breakdown */}
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
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
              onClick={confirmSale}
              disabled={cart.length === 0 || saving}
            >
              {saving ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </div>
          {error && <div style={styles.errorBox}>{error}</div>}
        </div>
      </div>

      {receipt && (
        <SaleReceipt
          sale={receipt.sale}
          items={receipt.items}
          subtotal={receipt.subtotal}
          tax={receipt.tax}
          total={receipt.total}
          onClose={() => { setReceipt(null); onSaleComplete(); }}
        />
      )}
    </>
  );
}
