import React, { useState, useEffect } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Shared card shell ───────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div
      className="fl-card"
      style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title }) {
  return (
    <div style={{
      padding: '14px 18px',
      borderBottom: '1px solid #f0f0f0',
      fontWeight: '600',
      fontSize: '13px',
      color: '#5c5c5c',
      letterSpacing: '0.1px',
    }}>
      {title}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accentColor }) {
  return (
    <Card>
      <div style={{ borderTop: `3px solid ${accentColor}`, padding: '20px 22px' }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', color: '#9e9e9e',
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px',
        }}>
          {label}
        </div>
        <div style={{ fontSize: '30px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '6px' }}>{sub}</div>
        )}
      </div>
    </Card>
  );
}

// ── Low stock card ──────────────────────────────────────────────────────────

function LowStockCard({ items, onNavigate }) {
  return (
    <Card>
      <CardHeader title="⚠ Alertas de Stock Bajo" />
      {items.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#107c10', fontSize: '14px', fontWeight: '500' }}>
          ✓ Todo el inventario en orden
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((p) => (
            <li
              key={p.id}
              className="fl-tr"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
              onClick={() => onNavigate('catalog')}
              title="Ir al catálogo"
            >
              <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{p.name}</span>
              <span style={{
                background: p.stock === 0 ? '#ffebee' : '#fff8e1',
                color: p.stock === 0 ? '#a4262c' : '#8a5700',
                fontWeight: '700', fontSize: '12px', padding: '2px 10px', borderRadius: '12px',
              }}>
                {p.stock === 0 ? 'Sin stock' : `${p.stock} / mín ${p.min_stock ?? 5}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Top products card ───────────────────────────────────────────────────────

function TopProductsCard({ items }) {
  const max = items[0]?.total_sold || 1;

  return (
    <Card>
      <CardHeader title="★ Top 5 Más Vendidos" />
      {items.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#9e9e9e', fontSize: '14px' }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {items.map((p, i) => (
            <li key={p.product_id} style={{ padding: '9px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: '#9e9e9e', width: '16px' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>
                    {p.product_name}
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#5c5c5c' }}>
                  {p.total_sold} uds
                </span>
              </div>
              <div style={{ marginLeft: '26px', height: '4px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(p.total_sold / max) * 100}%`,
                  background: i === 0 ? '#0078d4' : '#a8d0f0',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Recent sales card ───────────────────────────────────────────────────────

function RecentSalesCard({ sales, onNavigate }) {
  const th = {
    padding: '10px 16px', textAlign: 'left', fontWeight: '600', fontSize: '11px',
    color: '#9e9e9e', background: '#fafafa', borderBottom: '1px solid #f0f0f0',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };
  const td = {
    padding: '11px 16px', borderBottom: '1px solid #f5f5f5',
    fontSize: '13px', color: '#1a1a1a', verticalAlign: 'middle',
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: '600', fontSize: '13px', color: '#5c5c5c' }}>Ventas Recientes</span>
        <button
          className="fl-btn-ghost"
          onClick={() => onNavigate('history')}
          style={{ background: 'none', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '13px', fontWeight: '500', borderRadius: '6px', padding: '4px 8px' }}
        >
          Ver todas →
        </button>
      </div>
      {sales.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#9e9e9e', fontSize: '14px' }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Fecha</th>
              <th style={th}>Cliente</th>
              <th style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="fl-tr">
                <td style={{ ...td, color: '#9e9e9e', width: '40px' }}>{sale.id}</td>
                <td style={td}>{formatDate(sale.created_at)}</td>
                <td style={{ ...td, color: sale.customer_name ? '#1a1a1a' : '#9e9e9e' }}>
                  {sale.customer_name || '—'}
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#0078d4' }}>
                  ${Number(sale.total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

const layout = {
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' },
  grid2Bottom: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px', letterSpacing: '-0.3px' },
  errorBox: {
    background: '#ffebee', color: '#a4262c', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '12px',
    height: '100px',
    animation: 'pulse 1.5s ease infinite',
  },
};

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.electron.dashboard
      .getSummary()
      .then(setData)
      .catch(() => setError('Error al cargar el dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div style={layout.title}>Dashboard</div>
        <div style={layout.grid3}>
          <div style={layout.skeleton} />
          <div style={layout.skeleton} />
          <div style={layout.skeleton} />
        </div>
        <div style={layout.grid2Bottom}>
          <div style={{ ...layout.skeleton, height: '200px' }} />
          <div style={{ ...layout.skeleton, height: '200px' }} />
        </div>
        <div style={{ ...layout.skeleton, height: '220px' }} />
      </>
    );
  }

  if (error) return <div style={layout.errorBox}>{error}</div>;

  return (
    <>
      <div style={layout.title}>Dashboard</div>

      <div style={layout.grid3}>
        <StatCard
          label="Ventas Hoy"
          value={data.todayCount}
          sub={data.todayCount === 1 ? '1 venta realizada' : `${data.todayCount} ventas realizadas`}
          accentColor="#0078d4"
        />
        <StatCard
          label="Ingresos Hoy"
          value={`$${data.todayTotal.toFixed(2)}`}
          sub={data.todayCount === 0 ? 'Sin movimiento hoy' : `Promedio $${(data.todayTotal / data.todayCount).toFixed(2)} por venta`}
          accentColor="#107c10"
        />
        <StatCard
          label="Utilidad Hoy"
          value={`$${data.todayProfit.toFixed(2)}`}
          sub="Ganancia neta estimada"
          accentColor="#7519b5"
        />
      </div>

      <div style={layout.grid2Bottom}>
        <LowStockCard items={data.lowStock} onNavigate={onNavigate} />
        <TopProductsCard items={data.topProducts} />
      </div>

      <RecentSalesCard sales={data.recentSales} onNavigate={onNavigate} />
    </>
  );
}
