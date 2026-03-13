import React, { useState, useEffect } from 'react';
import UsersView from './UsersView';
import AuditLogView from './AuditLogView';

function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Confirmation modal ───────────────────────────────────────────────────────

function ConfirmRestoreModal({ filePath, fileSize, onConfirm, onCancel }) {
  const [restoring, setRestoring] = useState(false);

  const handleConfirm = async () => {
    setRestoring(true);
    await onConfirm(filePath);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '440px', maxWidth: '95vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#a4262c', margin: 0 }}>
            ⚠ Restaurar base de datos
          </h2>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px',
            padding: '12px 14px', fontSize: '13px', color: '#8a5700', marginBottom: '16px', lineHeight: '1.5',
          }}>
            Esta acción reemplazará <strong>todos los datos actuales</strong> con los del archivo de respaldo. Esta operación no se puede deshacer.
          </div>
          <div style={{ fontSize: '13px', color: '#5c5c5c', marginBottom: '6px' }}>
            <strong>Archivo:</strong> {filePath.split(/[\\/]/).pop()}
          </div>
          <div style={{ fontSize: '13px', color: '#5c5c5c' }}>
            <strong>Tamaño:</strong> {formatBytes(fileSize)}
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            className="fl-btn-ghost"
            style={{ background: 'white', border: '1px solid #d1d1d1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#5c5c5c' }}
            onClick={onCancel}
            disabled={restoring}
          >
            Cancelar
          </button>
          <button
            className="fl-btn-danger"
            style={{ background: '#a4262c', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onClick={handleConfirm}
            disabled={restoring}
          >
            {restoring ? 'Restaurando...' : 'Sí, restaurar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card shell ───────────────────────────────────────────────────────────────

function Card({ children }) {
  return (
    <div className="fl-card" style={{
      background: 'white', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: '20px',
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, accent }) {
  return (
    <div style={{
      padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
      fontWeight: '600', fontSize: '14px', color: accent || '#5c5c5c',
    }}>
      {title}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: checked ? '#0078d4' : '#d1d1d1',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }} />
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────

function Alert({ type, children }) {
  const colors = {
    success: { background: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    error:   { background: '#ffebee', color: '#a4262c', border: '#ef9a9a' },
    info:    { background: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.background, color: c.color,
      border: `1px solid ${c.border}`, borderRadius: '8px',
      padding: '10px 14px', fontSize: '13px', marginTop: '12px',
    }}>
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ConfigView({ role }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // { type, msg }
  const [importStatus, setImportStatus] = useState(null);
  const [manualStatus, setManualStatus] = useState(null);
  const [restoreCandidate, setRestoreCandidate] = useState(null); // { filePath, size }
  const [restoreStatus, setRestoreStatus] = useState(null);

  const loadInfo = () => {
    window.electron.backup.getInfo().then((data) => {
      setInfo(data);
      setAutoBackup(data.autoBackup);
      setLoading(false);
    });
  };

  useEffect(() => { loadInfo(); }, []);

  // ── Auto-backup toggle ──
  const handleToggleAutoBackup = async (val) => {
    setSavingToggle(true);
    setAutoBackup(val);
    await window.electron.backup.setAutoBackup(val);
    setSavingToggle(false);
    loadInfo();
  };

  // ── Export ──
  const handleExport = async () => {
    setExportStatus(null);
    const result = await window.electron.backup.export();
    if (result.canceled) return;
    if (result.success) {
      setExportStatus({ type: 'success', msg: `Copia guardada (${formatBytes(result.size)})` });
    } else {
      setExportStatus({ type: 'error', msg: 'Error al exportar la copia.' });
    }
  };

  // ── Import (pick file, show confirm modal) ──
  const handleImport = async () => {
    setImportStatus(null);
    const result = await window.electron.backup.import();
    if (result.canceled) return;
    if (result.selected) {
      setRestoreCandidate({ filePath: result.filePath, size: result.size });
    }
  };

  // ── Restore confirmed ──
  const handleRestoreConfirm = async (filePath) => {
    try {
      await window.electron.backup.restore(filePath);
      setRestoreCandidate(null);
      setRestoreStatus({ type: 'success', msg: 'Base de datos restaurada correctamente. Los datos actualizados están disponibles.' });
      loadInfo();
    } catch {
      setRestoreCandidate(null);
      setRestoreStatus({ type: 'error', msg: 'Error al restaurar la base de datos.' });
    }
  };

  // ── Manual backup to auto folder ──
  const handleManualBackup = async () => {
    setManualStatus(null);
    try {
      const result = await window.electron.backup.manualBackup();
      if (result.success) {
        setManualStatus({ type: 'success', msg: `Copia creada en carpeta de respaldos (${formatBytes(result.size)})` });
        loadInfo();
      }
    } catch {
      setManualStatus({ type: 'error', msg: 'Error al crear la copia.' });
    }
  };

  const btnPrimary = {
    background: '#0078d4', color: 'white', border: 'none',
    padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
  };
  const btnSecondary = {
    background: 'white', border: '1px solid #d1d1d1', color: '#1a1a1a',
    padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  };
  const btnDanger = {
    background: 'white', border: '1px solid #ef9a9a', color: '#a4262c',
    padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  };

  return (
    <>
      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.3px', marginBottom: '20px' }}>
        Configuración
      </div>

      {/* ── Backup info card ── */}
      <Card>
        <CardHeader title="🗄 Estado de respaldo" />
        <div style={{ padding: '18px 20px' }}>
          {loading ? (
            <p style={{ color: '#9e9e9e', fontSize: '14px', margin: 0 }}>Cargando...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fafafa', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                  Último respaldo automático
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                  {info?.lastBackup ? formatDate(info.lastBackup.date) : 'Sin respaldos aún'}
                </div>
                {info?.lastBackup && (
                  <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>
                    {info.lastBackup.name} · {formatBytes(info.lastBackup.size)}
                  </div>
                )}
              </div>
              <div style={{ background: '#fafafa', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                  Respaldo automático diario
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Toggle checked={autoBackup} onChange={savingToggle ? () => {} : handleToggleAutoBackup} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: autoBackup ? '#0078d4' : '#9e9e9e' }}>
                    {autoBackup ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
                {autoBackup && (
                  <div style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '6px' }}>
                    Se guarda al iniciar la app si no hay copia del día
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Export card ── */}
      <Card>
        <CardHeader title="📤 Exportar copia de seguridad" />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: '13px', color: '#5c5c5c', margin: '0 0 14px' }}>
            Guarda la base de datos actual como archivo <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: '4px' }}>.sqlite</code> en la ubicación que elijas. El nombre del archivo incluye la fecha de hoy automáticamente.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="fl-btn-primary" style={btnPrimary} onClick={handleExport}>
              📤 Exportar copia de seguridad
            </button>
            <button className="fl-btn-secondary" style={btnSecondary} onClick={handleManualBackup}>
              💾 Guardar en carpeta de respaldos
            </button>
          </div>
          {exportStatus && <Alert type={exportStatus.type}>{exportStatus.msg}</Alert>}
          {manualStatus && <Alert type={manualStatus.type}>{manualStatus.msg}</Alert>}
        </div>
      </Card>

      {/* ── Import/Restore card ── */}
      <Card>
        <CardHeader title="📥 Restaurar desde copia de seguridad" accent="#a4262c" />
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px',
            padding: '10px 14px', fontSize: '13px', color: '#8a5700', marginBottom: '14px', lineHeight: '1.5',
          }}>
            ⚠ Restaurar un respaldo <strong>reemplazará todos los datos actuales</strong>. Se te pedirá confirmación antes de continuar.
          </div>
          <button className="fl-btn-danger" style={btnDanger} onClick={handleImport}>
            📥 Seleccionar archivo de respaldo...
          </button>
          {restoreStatus && <Alert type={restoreStatus.type}>{restoreStatus.msg}</Alert>}
        </div>
      </Card>

      {/* ── Users card (Admin only) ── */}
      {role === 'Admin' && (
        <Card>
          <CardHeader title="👥 Gestión de Usuarios" accent="#0078d4" />
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '13px', color: '#5c5c5c', margin: '0 0 4px' }}>
              Administra los usuarios del sistema. Solo los administradores pueden crear, editar o eliminar usuarios.
            </p>
            <UsersView />
          </div>
        </Card>
      )}

      {/* ── Audit Log card (Admin only) ── */}
      {role === 'Admin' && (
        <Card>
          <CardHeader title="📋 Registro de Actividad" accent="#0078d4" />
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '13px', color: '#5c5c5c', margin: '0 0 16px' }}>
              Historial completo de acciones: inicios de sesión, creación/edición/eliminación de productos, ventas, devoluciones y usuarios.
            </p>
            <AuditLogView />
          </div>
        </Card>
      )}

      {/* ── Restore confirmation modal ── */}
      {restoreCandidate && (
        <ConfirmRestoreModal
          filePath={restoreCandidate.filePath}
          fileSize={restoreCandidate.size}
          onConfirm={handleRestoreConfirm}
          onCancel={() => setRestoreCandidate(null)}
        />
      )}
    </>
  );
}
