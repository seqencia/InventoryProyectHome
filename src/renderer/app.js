import React, { useState } from 'react';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import StockEntriesView from './components/StockEntriesView';
import SuppliersView from './components/SuppliersView';
import NewSale from './components/NewSale';
import SaleHistory from './components/SaleHistory';
import CategoriesView from './components/CategoriesView';
import CustomersView from './components/CustomersView';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'stock-entries', label: 'Entradas' },
  { id: 'suppliers', label: 'Proveedores' },
  { id: 'new-sale', label: 'Nueva Venta' },
  { id: 'history', label: 'Historial' },
  { id: 'categories', label: 'Categorías' },
  { id: 'customers', label: 'Clientes' },
];

const styles = {
  app: { minHeight: '100vh', background: '#f0f2f5' },
  header: {
    background: '#1a1a2e',
    color: 'white',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    height: '52px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
  title: { fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap' },
  nav: { display: 'flex', gap: '2px' },
  tab: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  main: { padding: '24px' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <span style={styles.title}>Inventario y Ventas</span>
        <nav style={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={styles.main}>
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'catalog' && <InventoryView />}
        {activeTab === 'stock-entries' && <StockEntriesView />}
        {activeTab === 'suppliers' && <SuppliersView />}
        {activeTab === 'new-sale' && (
          <NewSale onSaleComplete={() => setActiveTab('history')} />
        )}
        {activeTab === 'history' && <SaleHistory />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'customers' && <CustomersView />}
      </main>
    </div>
  );
}
