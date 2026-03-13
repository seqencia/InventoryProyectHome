import React, { useState, useEffect, useCallback } from 'react';

const ACTION_COLORS = {
  CREATE: { background: '#e8f5e9', color: '#2e7d32' },
  UPDATE: { background: '#e3f2fd', color: '#1565c0' },
  DELETE: { background: '#ffebee', color: '#a4262c' },
  LOGIN:  { background: '#f3e5f5', color: '#6a1b9a' },
  LOGOUT: { background: '#f5f5f5', color: '#5c5c5c' },
};

const ENTITY_LABELS = {
  product:     'Producto',
  sale:        'Venta',
  return:      'Devolución',
  stock_entry: 'Entrada',
  user:        'Usuario',
  category:    'Categoría',
  supplier:    'Proveedor',
  customer:    'Cliente',
};

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
const ENTITIES = Object.keys(ENTITY_LABELS);
const PAGE_SIZE = 50;

function formatTS(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatDetail(log) {
  try {
    const nv = log.new_value ? JSON.parse(log.new_value) : null;
    const ov = log.old_value ? JSON.parse(log.old_value) : null;

    if (log.action === 'LOGIN')  return `Inicio de sesión${nv?.username ? ` — ${nv.username}` : ''}`;
    if (log.action === 'LOGOUT') return `Cierre de sesión${nv?.userName ? ` — ${nv.userName}` : ''}`;

    if (log.entity === 'product') {
      if (log.action === 'CREATE') return `Creado: ${nv?.name || `ID ${log.entity_id}`}${nv?.stock != null ? ` (stock: ${nv.stock})` : ''}`;
      if (log.action === 'DELETE') return `Eliminado: ${ov?.name || `ID ${log.entity_id}`}`;
      if (log.action === 'UPDATE') {
        const parts = [];
        if (ov?.precio_venta_sin_iva !== nv?.precio_venta_sin_iva && (ov?.precio_venta_sin_iva != null || nv?.precio_venta_sin_iva != null))
          parts.push(`precio ${ov?.precio_venta_sin_iva ?? '—'} → ${nv?.precio_venta_sin_iva ?? '—'}`);
        if (ov?.precio_costo !== nv?.precio_costo && (ov?.precio_costo != null || nv?.precio_costo != null))
          parts.push(`costo ${ov?.precio_costo ?? '—'} → ${nv?.precio_costo ?? '—'}`);
        if (ov?.stock !== nv?.stock && (ov?.stock != null || nv?.stock != null))
          parts.push(`stock ${ov?.stock ?? '—'} → ${nv?.stock ?? '—'}`);
        if (ov?.status !== nv?.status && nv?.status)
          parts.push(`estado ${ov?.status ?? '—'} → ${nv?.status}`);
        const name = nv?.name || ov?.name || `ID ${log.entity_id}`;
        return parts.length ? `${name} (${parts.join(', ')})` : `Actualizado: ${name}`;
      }
    }

    if (log.entity === 'sale') {
      if (log.action === 'CREATE') {
        const cust = nv?.customer_name ? ` — ${nv.customer_name}` : '';
        return `Total: $${Number(nv?.total || 0).toFixed(2)}${cust} · ${nv?.items_count ?? '?'} ítem(s)`;
      }
      if (log.action === 'UPDATE') {
        const parts = [];
        if (ov?.status !== nv?.status) parts.push(`estado: ${ov?.status ?? '—'} → ${nv?.status ?? '—'}`);
        if (ov?.payment_method !== nv?.payment_method) parts.push(`pago: ${ov?.payment_method ?? '—'} → ${nv?.payment_method ?? '—'}`);
        return parts.length ? parts.join(', ') : `Venta #${log.entity_id} actualizada`;
      }
    }

    if (log.entity === 'return') {
      return `Venta #${nv?.sale_id ?? log.entity_id} — $${Number(nv?.total_refunded || 0).toFixed(2)}${nv?.is_partial ? ' (parcial)' : ''}`;
    }

    if (log.entity === 'stock_entry') {
      const qty = nv?.bonus_quantity > 0 ? `${nv.quantity}+${nv.bonus_quantity}b` : `+${nv?.quantity ?? '?'}`;
      return `${nv?.product_name || `ID ${log.entity_id}`} ${qty}${nv?.supplier_name ? ` · ${nv.supplier_name}` : ''}`;
    }

    if (log.entity === 'user') {
      if (log.action === 'CREATE') return `Creado: ${nv?.name || ''} (${nv?.username || ''}) — ${nv?.role || ''}`;
      if (log.action === 'DELETE') return `Eliminado: ${ov?.name || ''} (${ov?.username || ''})`;
      if (log.action === 'UPDATE') {
        const parts = [];
        if (ov?.name !== nv?.name) parts.push(`nombre: ${nv?.name}`);
        if (ov?.role !== nv?.role) parts.push(`rol: ${ov?.role} → ${nv?.role}`);
        if (nv?.password_changed) parts.push('contraseña cambiada');
        return parts.length ? `${nv?.name || `ID ${log.entity_id}`} (${parts.join(', ')})` : `Actualizado: ${nv?.name || `ID ${log.entity_id}`}`;
      }
    }

    return nv ? JSON.stringify(nv).slice(0, 80) : '—';
  } catch {
    return '—';
  }
}

const inputStyle = {
  padding: '7px 10px', border: '1px solid #d1d1d1', borderRadius: '7px',
  fontSize: '13px', background: 'white', color: '#1a1a1a',
};
const labelStyle = { fontSize: '11px', fontWeight: '600', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' };
const thStyle = { padding: '9px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' };
const tdStyle = { padding: '9px 12px', fontSize: '13px', color: '#1a1a1a', borderTop: '1px solid #f0f0f0', verticalAlign: 'middle' };

export default function AuditLogView() {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers]   = useState([]);

  const [filterUserId,   setFilterUserId]   = useState('');
  const [filterAction,   setFilterAction]   = useState('');
  const [filterEntity,   setFilterEntity]   = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadLogs = useCallback(async (p) => {
    setLoading(true);
    try {
      const result = await window.electron.auditLog.getAll({
        page:      p,
        pageSize:  PAGE_SIZE,
        userId:    filterUserId   || undefined,
        action:    filterAction   || undefined,
        entity:    filterEntity   || undefined,
        dateFrom:  filterDateFrom || undefined,
        dateTo:    filterDateTo   || undefined,
      });
      setLogs(result.items);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [filterUserId, filterAction, filterEntity, filterDateFrom, filterDateTo]);

  // Reset page to 1 when filters change, then load
  useEffect(() => {
    setPage(1);
  }, [filterUserId, filterAction, filterEntity, filterDateFrom, filterDateTo]);

  useEffect(() => {
    loadLogs(page);
  }, [page, loadLogs]);

  useEffect(() => {
    window.electron.users.getAll().then(setUsers).catch(() => {});
  }, []);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const clearFilters = () => {
    setFilterUserId('');
    setFilterAction('');
    setFilterEntity('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasFilters = filterUserId || filterAction || filterEntity || filterDateFrom || filterDateTo;

  return (
    <div>
      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Usuario</label>
          <select className="fl-select" style={inputStyle} value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Acción</label>
          <select className="fl-select" style={inputStyle} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="">Todas</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Entidad</label>
          <select className="fl-select" style={inputStyle} value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}>
            <option value="">Todas</option>
            {ENTITIES.map((e) => <option key={e} value={e}>{ENTITY_LABELS[e]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Desde</label>
          <input className="fl-input" type="date" style={inputStyle} value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Hasta</label>
          <input className="fl-input" type="date" style={inputStyle} value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
        </div>
        {hasFilters && (
          <button
            className="fl-btn-ghost"
            style={{ background: 'white', border: '1px solid #d1d1d1', color: '#5c5c5c', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-end' }}
            onClick={clearFilters}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      <div style={{ fontSize: '12px', color: '#9e9e9e', marginBottom: '10px' }}>
        {loading ? 'Cargando...' : `${total} registro${total !== 1 ? 's' : ''}${total > 0 ? ` · Página ${page} de ${totalPages}` : ''}`}
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={thStyle}>Fecha y hora</th>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Acción</th>
              <th style={thStyle}>Entidad</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>ID</th>
              <th style={{ ...thStyle, minWidth: '280px' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#9e9e9e', padding: '32px' }}>
                  No hay registros para los filtros seleccionados
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const ac = ACTION_COLORS[log.action] || { background: '#f5f5f5', color: '#5c5c5c' };
              return (
                <tr key={log.id} className="fl-tr">
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#5c5c5c', fontSize: '12px' }}>{formatTS(log.timestamp)}</td>
                  <td style={tdStyle}>{log.user_name || <span style={{ color: '#bdbdbd' }}>—</span>}</td>
                  <td style={tdStyle}>
                    <span style={{ ...ac, padding: '2px 9px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={tdStyle}>{ENTITY_LABELS[log.entity] || log.entity || <span style={{ color: '#bdbdbd' }}>—</span>}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#9e9e9e', fontSize: '12px' }}>{log.entity_id ?? '—'}</td>
                  <td style={{ ...tdStyle, color: '#5c5c5c', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatDetail(log)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', justifyContent: 'center' }}>
          <button
            className="fl-btn-ghost"
            style={{ border: '1px solid #d1d1d1', background: 'white', padding: '5px 12px', borderRadius: '7px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '13px' }}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ‹ Anterior
          </button>
          <span style={{ fontSize: '13px', color: '#5c5c5c', padding: '0 8px' }}>
            {page} / {totalPages}
          </span>
          <button
            className="fl-btn-ghost"
            style={{ border: '1px solid #d1d1d1', background: 'white', padding: '5px 12px', borderRadius: '7px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '13px' }}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}
