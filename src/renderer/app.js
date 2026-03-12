import React, { useState } from 'react';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import StockEntriesView from './components/StockEntriesView';
import SuppliersView from './components/SuppliersView';
import NewSale from './components/NewSale';
import SaleHistory from './components/SaleHistory';
import CategoriesView from './components/CategoriesView';
import CustomersView from './components/CustomersView';
import ConfigView from './components/ConfigView';
import ReportsView from './components/ReportsView';
import LoginScreen from './components/LoginScreen';

const ALL_TABS = [
  { id: 'dashboard',     label: 'Dashboard',      icon: '📊', roles: ['Admin', 'Vendedor'] },
  { id: 'catalog',       label: 'Catálogo',        icon: '📦', roles: ['Admin'] },
  { id: 'stock-entries', label: 'Entradas',        icon: '📥', roles: ['Admin', 'Vendedor'] },
  { id: 'suppliers',     label: 'Proveedores',     icon: '🏢', roles: ['Admin'] },
  { id: 'new-sale',      label: 'Nueva Venta',     icon: '🛒', roles: ['Admin', 'Vendedor'] },
  { id: 'history',       label: 'Historial',       icon: '📋', roles: ['Admin', 'Vendedor'] },
  { id: 'categories',    label: 'Categorías',      icon: '🏷️', roles: ['Admin'] },
  { id: 'customers',     label: 'Clientes',        icon: '👤', roles: ['Admin'] },
  { id: 'reports',       label: 'Reportes',        icon: '📈', roles: ['Admin'] },
  { id: 'config',        label: 'Configuración',   icon: '⚙️', roles: ['Admin'] },
];

// ── Global CSS (hover / focus effects impossible with pure inline styles) ────
const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    margin: 0;
    background: #f3f3f3;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
  }
  input, select, textarea, button { font-family: inherit; }

  /* Input focus ring */
  .fl-input:focus, .fl-select:focus {
    border-color: #0078d4 !important;
    box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.14) !important;
    outline: none !important;
  }

  /* Buttons */
  .fl-btn-primary { transition: background 0.15s, box-shadow 0.15s !important; }
  .fl-btn-primary:hover {
    background: #106ebe !important;
    box-shadow: 0 4px 14px rgba(0, 120, 212, 0.38) !important;
  }
  .fl-btn-primary:active { transform: translateY(1px); }

  .fl-btn-secondary { transition: background 0.15s, border-color 0.15s, color 0.15s !important; }
  .fl-btn-secondary:hover {
    background: #eff6fc !important;
    border-color: #0078d4 !important;
    color: #0078d4 !important;
  }

  .fl-btn-ghost { transition: background 0.15s !important; }
  .fl-btn-ghost:hover { background: rgba(0, 0, 0, 0.05) !important; }

  .fl-btn-danger { transition: background 0.15s, border-color 0.15s, color 0.15s !important; }
  .fl-btn-danger:hover {
    background: #fdf3f3 !important;
    border-color: #d83b3b !important;
    color: #a4262c !important;
  }

  /* Table rows */
  .fl-tr:hover td { background: #f5f5f5 !important; transition: background 0.1s; }
  .fl-tr-amber:hover td { background: #fffbf0 !important; }

  /* Tabs */
  .fl-tab { transition: background 0.15s !important; }
  .fl-tab:hover { background: rgba(255, 255, 255, 0.18) !important; }

  /* Product rows in NewSale */
  .fl-product-row { transition: background 0.1s !important; }
  .fl-product-row:hover { background: #f5f5f5 !important; }

  /* Cards */
  .fl-card { transition: box-shadow 0.2s !important; }
  .fl-card:hover { box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12) !important; }

  /* Customer option */
  .fl-option { transition: background 0.1s !important; }
  .fl-option:hover { background: #f0f7ff !important; }
`;

const styles = {
  app: { minHeight: '100vh', background: '#f3f3f3' },
  header: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    height: '50px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0078d4',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.3px',
  },
  nav: { display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' },
  tab: {
    background: 'transparent',
    border: 'none',
    color: '#5c5c5c',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabActive: {
    background: '#0078d4',
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  main: { padding: '24px' },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
    borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '14px', marginLeft: '4px',
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' },
  roleBadge: (role) => ({
    fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
    background: role === 'Admin' ? '#e3f2fd' : '#e8f5e9',
    color: role === 'Admin' ? '#1565c0' : '#2e7d32',
  }),
  btnLogout: {
    background: 'white', border: '1px solid #d1d1d1', color: '#5c5c5c',
    padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
  },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  const tabs = ALL_TABS.filter((t) => t.roles.includes(currentUser.role));

  // If active tab is no longer accessible (e.g. after logout+login with different role)
  const activeTabVisible = tabs.some((t) => t.id === activeTab);
  const safeActiveTab = activeTabVisible ? activeTab : 'dashboard';

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={styles.app}>
        <header style={styles.header}>
          <span style={styles.title}>StarTecnology</span>
          <nav style={styles.nav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="fl-tab"
                style={safeActiveTab === tab.id ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{currentUser.name}</span>
            <span style={styles.roleBadge(currentUser.role)}>{currentUser.role}</span>
            <button className="fl-btn-ghost" style={styles.btnLogout} onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>
        <main style={styles.main}>
          {safeActiveTab === 'dashboard' && (
            <DashboardView onNavigate={setActiveTab} role={currentUser.role} />
          )}
          {safeActiveTab === 'catalog' && <InventoryView />}
          {safeActiveTab === 'stock-entries' && <StockEntriesView role={currentUser.role} />}
          {safeActiveTab === 'suppliers' && <SuppliersView />}
          {safeActiveTab === 'new-sale' && (
            <NewSale onSaleComplete={() => setActiveTab('history')} />
          )}
          {safeActiveTab === 'history' && <SaleHistory />}
          {safeActiveTab === 'categories' && <CategoriesView />}
          {safeActiveTab === 'customers' && <CustomersView />}
          {safeActiveTab === 'reports' && <ReportsView />}
          {safeActiveTab === 'config' && <ConfigView role={currentUser.role} />}
        </main>
      </div>
    </>
  );
}
