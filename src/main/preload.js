const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  dashboard: {
    getSummary: () => ipcRenderer.invoke('dashboard:getSummary'),
  },
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    create: (data) => ipcRenderer.invoke('products:create', data),
    update: (id, data) => ipcRenderer.invoke('products:update', { id, ...data }),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
  },
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (data) => ipcRenderer.invoke('categories:create', data),
    update: (id, data) => ipcRenderer.invoke('categories:update', { id, ...data }),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    create: (data) => ipcRenderer.invoke('customers:create', data),
    update: (id, data) => ipcRenderer.invoke('customers:update', { id, ...data }),
    delete: (id) => ipcRenderer.invoke('customers:delete', id),
  },
  suppliers: {
    getAll: () => ipcRenderer.invoke('suppliers:getAll'),
    create: (data) => ipcRenderer.invoke('suppliers:create', data),
    update: (id, data) => ipcRenderer.invoke('suppliers:update', { id, ...data }),
    delete: (id) => ipcRenderer.invoke('suppliers:delete', id),
  },
  stockEntries: {
    getAll: () => ipcRenderer.invoke('stockEntries:getAll'),
    create: (data) => ipcRenderer.invoke('stockEntries:create', data),
  },
  sales: {
    create: (items, customerId, customerName, paymentMethod, status) =>
      ipcRenderer.invoke('sales:create', { items, customerId, customerName, paymentMethod, status }),
    getAll: () => ipcRenderer.invoke('sales:getAll'),
  },
  returns: {
    create: (data) => ipcRenderer.invoke('returns:create', data),
    getAll: () => ipcRenderer.invoke('returns:getAll'),
  },
  reports: {
    getData: (range) => ipcRenderer.invoke('reports:getData', range),
    exportCSV: (data) => ipcRenderer.invoke('reports:exportCSV', data),
  },
  backup: {
    getInfo: () => ipcRenderer.invoke('backup:getInfo'),
    setAutoBackup: (enabled) => ipcRenderer.invoke('backup:setAutoBackup', enabled),
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
    restore: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
    manualBackup: () => ipcRenderer.invoke('backup:manualBackup'),
  },
});
