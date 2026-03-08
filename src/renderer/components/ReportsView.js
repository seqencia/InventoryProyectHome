import React, { useState } from 'react';

// ── Date helpers ─────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getRange(filter) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  switch (filter) {
    case 'today':
      return { from: todayStr(), to: todayStr() };
    case 'week': {
      const day = now.getDay();
      const monday = new Date(y, m, d - (day === 0 ? 6 : day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
    }
    case 'month': {
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
    }
    case 'year':
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    default:
      return { from: todayStr(), to: todayStr() };
  }
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function fmtMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

// ── CSV builder ───────────────────────────────────────────────────────────────

function buildCSV(data, from, to) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const row = (...cells) => cells.map(q).join(',');
  const lines = [];

  lines.push(row('REPORTE DE VENTAS — StarTecnology'));
  lines.push(row(`Período: ${fmtDate(from)} — ${fmtDate(to)}`));
  lines.push('');
  lines.push(row('RESUMEN'));
  lines.push(row('Indicador', 'Valor'));
  lines.push(row('Total ventas', data.summary.salesCount));
  lines.push(row('Ingreso bruto', data.summary.grossIncome.toFixed(2)));
  lines.push(row('IVA recaudado (13%)', data.summary.ivaCollected.toFixed(2)));
  lines.push(row('Devoluciones', data.summary.totalReturned.toFixed(2)));
  lines.push(row('Ingreso neto', data.summary.netIncome.toFixed(2)));
  lines.push(row('Utilidad estimada', data.summary.totalProfit.toFixed(2)));
  lines.push('');

  lines.push(row('POR MÉTODO DE PAGO'));
  lines.push(row('Método', 'Ventas', 'Monto', 'Porcentaje'));
  const gross = data.summary.grossIncome;
  for (const m of data.byPaymentMethod) {
    const pct = gross > 0 ? ((m.amount / gross) * 100).toFixed(1) : '0.0';
    lines.push(row(m.method, m.count, m.amount.toFixed(2), `${pct}%`));
  }
  lines.push('');

  lines.push(row('POR CATEGORÍA'));
  lines.push(row('Categoría', 'Unidades', 'Ingresos'));
  for (const c of data.byCategory) lines.push(row(c.category, c.units, c.income.toFixed(2)));
  lines.push('');

  lines.push(row('TOP 10 PRODUCTOS'));
  lines.push(row('Producto', 'Unidades vendidas', 'Ingresos', 'Utilidad'));
  for (const p of data.topProducts) {
    lines.push(row(p.product_name, p.units, p.income.toFixed(2), p.profit > 0 ? p.profit.toFixed(2) : ''));
  }
  lines.push('');

  lines.push(row('VENTAS DIARIAS'));
  lines.push(row('Fecha', 'Ventas', 'Total'));
  for (const ds of data.dailySales) lines.push(row(ds.date, ds.count, ds.total.toFixed(2)));

  return lines.join('\n');
}

// ── Shared UI atoms ───────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div className="fl-card" style={{
      background: 'white', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title }) {
  return (
    <div style={{
      padding: '13px 20px', borderBottom: '1px solid #f0f0f0',
      fontWeight: '600', fontSize: '13px', color: '#5c5c5c',
    }}>
      {title}
    </div>
  );
}

const th = {
  background: '#f7f7f7', padding: '9px 16px', textAlign: 'left',
  fontWeight: '700', fontSize: '11px', color: '#9e9e9e',
  borderBottom: '1px solid #e5e5e5', textTransform: 'uppercase',
  letterSpacing: '0.5px', whiteSpace: 'nowrap',
};
const td = {
  padding: '10px 16px', borderBottom: '1px solid #f5f5f5',
  fontSize: '13px', color: '#1a1a1a', verticalAlign: 'middle',
};

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ summary }) {
  const items = [
    { label: 'Total ventas',       value: summary.salesCount,                     color: '#0078d4', fmt: (v) => v },
    { label: 'Ingreso bruto',      value: summary.grossIncome,                    color: '#107c10', fmt: fmtMoney },
    { label: 'IVA recaudado (13%)',value: summary.ivaCollected,                   color: '#8a5700', fmt: fmtMoney },
    { label: 'Devoluciones',       value: summary.totalReturned,                  color: '#a4262c', fmt: fmtMoney },
    { label: 'Ingreso neto',       value: summary.netIncome,                      color: '#107c10', fmt: fmtMoney },
    { label: 'Utilidad estimada',  value: summary.totalProfit,                    color: '#7519b5', fmt: fmtMoney },
  ];
  return (
    <Card style={{ marginBottom: '16px' }}>
      <CardHeader title="Resumen del período" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: '18px 16px',
            borderRight: i < items.length - 1 ? '1px solid #f5f5f5' : 'none',
            borderTop: `3px solid ${it.color}`,
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              {it.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1 }}>
              {it.fmt(it.value)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Payment method card ───────────────────────────────────────────────────────

function PaymentCard({ data, grossIncome }) {
  const COLORS = { 'Efectivo': '#107c10', 'Tarjeta': '#0078d4', 'Transferencia': '#7519b5' };
  return (
    <Card>
      <CardHeader title="Por método de pago" />
      {data.length === 0 ? (
        <div style={{ padding: '24px', color: '#9e9e9e', fontSize: '13px', textAlign: 'center' }}>Sin datos</div>
      ) : (
        <div style={{ padding: '16px 20px' }}>
          {data.map((m) => {
            const pct = grossIncome > 0 ? (m.amount / grossIncome) * 100 : 0;
            const color = COLORS[m.method] || '#5c5c5c';
            return (
              <div key={m.method} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{m.method}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color }}>{fmtMoney(m.amount)}</span>
                    <span style={{ fontSize: '12px', color: '#9e9e9e', marginLeft: '8px' }}>{pct.toFixed(1)}%</span>
                    <span style={{ fontSize: '12px', color: '#9e9e9e', marginLeft: '8px' }}>{m.count} venta{m.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '6px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({ data }) {
  const maxIncome = data[0]?.income || 1;
  return (
    <Card>
      <CardHeader title="Por categoría" />
      {data.length === 0 ? (
        <div style={{ padding: '24px', color: '#9e9e9e', fontSize: '13px', textAlign: 'center' }}>Sin datos</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={th}>Categoría</th>
              <th style={{ ...th, textAlign: 'right' }}>Unidades</th>
              <th style={{ ...th, textAlign: 'right' }}>Ingresos</th>
              <th style={{ ...th, width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.category} className="fl-tr">
                <td style={td}>{c.category}</td>
                <td style={{ ...td, textAlign: 'right', color: '#5c5c5c' }}>{c.units}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#0078d4' }}>{fmtMoney(c.income)}</td>
                <td style={{ ...td, paddingRight: '20px' }}>
                  <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.income / maxIncome) * 100}%`, background: '#0078d4', borderRadius: '4px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ── Top 10 products table ─────────────────────────────────────────────────────

function TopProductsTable({ data }) {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <CardHeader title="Top 10 productos más vendidos" />
      {data.length === 0 ? (
        <div style={{ padding: '24px', color: '#9e9e9e', fontSize: '13px', textAlign: 'center' }}>Sin datos en el período</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Producto</th>
              <th style={{ ...th, textAlign: 'right' }}>Unidades</th>
              <th style={{ ...th, textAlign: 'right' }}>Ingresos</th>
              <th style={{ ...th, textAlign: 'right' }}>Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={p.product_id} className="fl-tr">
                <td style={{ ...td, color: '#9e9e9e', width: '40px' }}>{i + 1}</td>
                <td style={{ ...td, fontWeight: '500' }}>{p.product_name}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                    {p.units}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#0078d4' }}>{fmtMoney(p.income)}</td>
                <td style={{ ...td, textAlign: 'right', color: p.profit > 0 ? '#2e7d32' : '#9e9e9e' }}>
                  {p.profit > 0 ? fmtMoney(p.profit) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ── Daily bar chart ───────────────────────────────────────────────────────────

function DailyChart({ data }) {
  if (data.length === 0) {
    return (
      <Card style={{ marginBottom: '16px' }}>
        <CardHeader title="Ventas diarias" />
        <div style={{ padding: '32px', color: '#9e9e9e', fontSize: '13px', textAlign: 'center' }}>Sin datos en el período</div>
      </Card>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const BAR_MAX_HEIGHT = 100;
  const barWidth = Math.max(16, Math.min(48, Math.floor(600 / data.length) - 6));

  return (
    <Card style={{ marginBottom: '16px' }}>
      <CardHeader title="Ventas diarias" />
      <div style={{ padding: '20px 20px 8px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', minWidth: data.length * (barWidth + 4), paddingBottom: '4px' }}>
          {data.map((d) => {
            const h = Math.max(4, (d.total / maxTotal) * BAR_MAX_HEIGHT);
            return (
              <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '0 0 auto', width: barWidth }}>
                <div style={{ fontSize: '10px', color: '#5c5c5c', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {fmtMoney(d.total)}
                </div>
                <div
                  title={`${fmtDate(d.date)}: ${d.count} venta${d.count !== 1 ? 's' : ''} · ${fmtMoney(d.total)}`}
                  style={{
                    width: '100%', height: `${h}px`,
                    background: 'linear-gradient(180deg, #0078d4 0%, #a8d0f0 100%)',
                    borderRadius: '4px 4px 0 0', cursor: 'default', transition: 'opacity 0.1s',
                  }}
                />
                <div style={{ fontSize: '10px', color: '#9e9e9e', textAlign: 'center', whiteSpace: 'nowrap', transform: data.length > 15 ? 'rotate(-45deg)' : 'none', transformOrigin: 'top center' }}>
                  {fmtDate(d.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const QUICK_FILTERS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week',  label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'year',  label: 'Este año' },
];

export default function ReportsView() {
  const [activeQuick, setActiveQuick] = useState('month');
  const initial = getRange('month');
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [xlsxStatus, setXlsxStatus] = useState(null);

  const applyQuick = (id) => {
    setActiveQuick(id);
    const range = getRange(id);
    setFrom(range.from);
    setTo(range.to);
  };

  const handleFromChange = (v) => { setFrom(v); setActiveQuick(null); };
  const handleToChange = (v) => { setTo(v); setActiveQuick(null); };

  const loadReport = async () => {
    if (!from || !to || from > to) {
      setError('Rango de fechas inválido.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setExportStatus(null);
    setXlsxStatus(null);
    try {
      const result = await window.electron.reports.getData({ from, to });
      setData(result);
    } catch {
      setError('Error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportXLSX = async () => {
    if (!data) return;
    setXlsxStatus(null);
    const result = await window.electron.reports.exportXLSX({ data, from, to });
    if (result.canceled) return;
    if (result.success) setXlsxStatus({ type: 'success', msg: 'Archivo Excel guardado correctamente.' });
    else setXlsxStatus({ type: 'error', msg: 'Error al exportar Excel.' });
  };

  const handleExport = async () => {
    if (!data) return;
    setExportStatus(null);
    const today = todayStr();
    const csv = buildCSV(data, from, to);
    const result = await window.electron.reports.exportCSV({
      content: csv,
      filename: `reporte-${from}_${to}.csv`,
    });
    if (result.canceled) return;
    if (result.success) setExportStatus({ type: 'success', msg: 'Reporte exportado correctamente.' });
    else setExportStatus({ type: 'error', msg: 'Error al exportar.' });
  };

  const btnQuick = (active) => ({
    background: active ? '#0078d4' : 'white',
    color: active ? 'white' : '#5c5c5c',
    border: `1px solid ${active ? '#0078d4' : '#d1d1d1'}`,
    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
    fontSize: '13px', fontWeight: active ? '600' : '400',
    transition: 'all 0.15s',
  });

  const inputStyle = {
    padding: '7px 12px', border: '1px solid #d1d1d1', borderRadius: '6px',
    fontSize: '13px', boxSizing: 'border-box',
  };

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px' }}>Reportes</div>
        {data && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="fl-btn-primary"
              style={{ background: '#107c10', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              onClick={handleExportXLSX}
            >
              📊 Exportar Excel
            </button>
            <button
              className="fl-btn-secondary"
              style={{ background: 'white', border: '1px solid #d1d1d1', color: '#5c5c5c', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
              onClick={handleExport}
            >
              📄 Exportar CSV
            </button>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '16px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      }}>
        {/* Quick filters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {QUICK_FILTERS.map((q) => (
            <button key={q.id} className="fl-tab" style={btnQuick(activeQuick === q.id)} onClick={() => applyQuick(q.id)}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: '#e5e5e5' }} />

        {/* Custom range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600' }}>Desde</label>
          <input className="fl-input" type="date" style={inputStyle} value={from} onChange={(e) => handleFromChange(e.target.value)} max={to} />
          <label style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600' }}>Hasta</label>
          <input className="fl-input" type="date" style={inputStyle} value={to} onChange={(e) => handleToChange(e.target.value)} min={from} />
        </div>

        {/* Generate */}
        <button
          className="fl-btn-primary"
          style={{ background: '#0078d4', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginLeft: 'auto' }}
          onClick={loadReport}
          disabled={loading}
        >
          {loading ? 'Generando...' : '📊 Generar reporte'}
        </button>
      </div>

      {/* ── XLSX status ── */}
      {xlsxStatus && (
        <div style={{
          background: xlsxStatus.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: xlsxStatus.type === 'success' ? '#2e7d32' : '#a4262c',
          borderRadius: '8px', padding: '10px 16px', fontSize: '13px', marginBottom: '16px',
        }}>
          {xlsxStatus.msg}
        </div>
      )}

      {/* ── Export status ── */}
      {exportStatus && (
        <div style={{
          background: exportStatus.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: exportStatus.type === 'success' ? '#2e7d32' : '#a4262c',
          borderRadius: '8px', padding: '10px 16px', fontSize: '13px', marginBottom: '16px',
        }}>
          {exportStatus.msg}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#ffebee', color: '#a4262c', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9e9e9e', fontSize: '14px' }}>
          Generando reporte...
        </div>
      )}

      {/* ── Empty hint ── */}
      {!loading && !data && !error && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9e9e9e', fontSize: '14px' }}>
          Selecciona un período y pulsa "Generar reporte"
        </div>
      )}

      {/* ── Report content ── */}
      {data && !loading && (
        <>
          <SummaryCard summary={data.summary} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <PaymentCard data={data.byPaymentMethod} grossIncome={data.summary.grossIncome} />
            <CategoryCard data={data.byCategory} />
          </div>

          <TopProductsTable data={data.topProducts} />
          <DailyChart data={data.dailySales} />
        </>
      )}
    </>
  );
}
