import React, { useState, useEffect } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Shared card shell ──────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title }) {
  return (
    <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
      {title}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accentColor }) {
  return (
    <Card>
      <div style={{ borderTop: `3px solid ${accentColor}`, padding: '20px 22px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
          {label}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', lineHeight: 1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>{sub}</div>
        )}
      </div>
    </Card>
  );
}

// ── Low stock card ─────────────────────────────────────────────────────────

function LowStockCard({ items, onNavigate }) {
  return (
    <Card>
      <CardHeader title="⚠ Alertas de Stock Bajo" />
      {items.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#16a34a', fontSize: '14px', fontWeight: '500' }}>
          ✓ Todo el inventario en orden
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((p) => (
            <li
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
              onClick={() => onNavigate('inventory')}
              title="Ir al inventario"
            >
              <span style={{ fontSize: '14px', color: '#334155' }}>{p.name}</span>
              <span style={{
                background: p.stock === 0 ? '#fee2e2' : '#fef3c7',
                color: p.stock === 0 ? '#dc2626' : '#b45309',
                fontWeight: '700',
                fontSize: '13px',
                padding: '2px 10px',
                borderRadius: '12px',
              }}>
                {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Top products card ──────────────────────────────────────────────────────

function TopProductsCard({ items }) {
  const max = items[0]?.total_sold || 1;

  return (
    <Card>
      <CardHeader title="★ Top 5 Más Vendidos" />
      {items.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {items.map((p, i) => (
            <li key={p.product_id} style={{ padding: '9px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#94a3b8', width: '16px' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {p.product_name}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                  {p.total_sold} uds
                </span>
              </div>
              <div style={{ marginLeft: '26px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(p.total_sold / max) * 100}%`,
                  background: i === 0 ? '#3b82f6' : '#93c5fd',
                  borderRadius: '2px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Recent sales card ──────────────────────────────────────────────────────

function RecentSalesCard({ sales, onNavigate }) {
  const th = { padding: '10px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const td = { padding: '11px 16px', borderBottom: '1px solid #f8fafc', fontSize: '14px', color: '#334155', verticalAlign: 'middle' };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: '600', fontSize: '14px', color: '#475569' }}>Ventas Recientes</span>
        <button
          onClick={() => onNavigate('history')}
          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
        >
          Ver todas →
        </button>
      </div>
      {sales.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
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
              <tr key={sale.id}>
                <td style={{ ...td, color: '#94a3b8', width: '40px' }}>{sale.id}</td>
                <td style={td}>{formatDate(sale.created_at)}</td>
                <td style={{ ...td, color: sale.customer_name ? '#334155' : '#94a3b8' }}>
                  {sale.customer_name || '—'}
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
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

// ── Main component ─────────────────────────────────────────────────────────

const layout = {
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  grid2Bottom: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  title: { fontSize: '17px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  skeleton: { background: '#f1f5f9', borderRadius: '10px', height: '100px', animation: 'pulse 1.5s ease infinite' },
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
        <div style={layout.grid2}>
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

  if (error) {
    return <div style={layout.errorBox}>{error}</div>;
  }

  return (
    <>
      <div style={layout.title}>Dashboard</div>

      {/* Stat cards */}
      <div style={layout.grid2}>
        <StatCard
          label="Ventas Hoy"
          value={data.todayCount}
          sub={data.todayCount === 1 ? '1 venta realizada' : `${data.todayCount} ventas realizadas`}
          accentColor="#3b82f6"
        />
        <StatCard
          label="Ingresos Hoy"
          value={`$${data.todayTotal.toFixed(2)}`}
          sub={data.todayCount === 0 ? 'Sin movimiento hoy' : `Promedio $${data.todayCount > 0 ? (data.todayTotal / data.todayCount).toFixed(2) : '0.00'} por venta`}
          accentColor="#16a34a"
        />
      </div>

      {/* Middle cards */}
      <div style={layout.grid2Bottom}>
        <LowStockCard items={data.lowStock} onNavigate={onNavigate} />
        <TopProductsCard items={data.topProducts} />
      </div>

      {/* Recent sales */}
      <RecentSalesCard sales={data.recentSales} onNavigate={onNavigate} />
    </>
  );
}
