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
    getBonificacionInfo: (productId) => ipcRenderer.invoke('products:getBonificacionInfo', productId),
    updateBonificacionPrice: (data) => ipcRenderer.invoke('products:updateBonificacionPrice', data),
    savePhoto: (productId) => ipcRenderer.invoke('products:savePhoto', productId),
    getPhoto: (productId) => ipcRenderer.invoke('products:getPhoto', productId),
    deletePhoto: (productId) => ipcRenderer.invoke('products:deletePhoto', productId),
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
    updateBonificacion: (data) => ipcRenderer.invoke('stockEntries:updateBonificacion', data),
  },
  sales: {
    create: (items, customerId, customerName, paymentMethod, status, globalDiscountAmount) =>
      ipcRenderer.invoke('sales:create', { items, customerId, customerName, paymentMethod, status, globalDiscountAmount }),
    getAll: () => ipcRenderer.invoke('sales:getAll'),
    updateStatus: (id, data) => ipcRenderer.invoke('sales:updateStatus', { id, ...data }),
    edit: (data) => ipcRenderer.invoke('sales:edit', data),
  },
  returns: {
    create: (data) => ipcRenderer.invoke('returns:create', data),
    getAll: () => ipcRenderer.invoke('returns:getAll'),
  },
  reports: {
    getData: (range) => ipcRenderer.invoke('reports:getData', range),
    exportCSV: (data) => ipcRenderer.invoke('reports:exportCSV', data),
    exportXLSX: (data) => ipcRenderer.invoke('reports:exportXLSX', data),
  },
  backup: {
    getInfo: () => ipcRenderer.invoke('backup:getInfo'),
    setAutoBackup: (enabled) => ipcRenderer.invoke('backup:setAutoBackup', enabled),
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
    restore: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
    manualBackup: () => ipcRenderer.invoke('backup:manualBackup'),
  },
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    logout: () => ipcRenderer.invoke('auth:logout'),
  },
  adjustments: {
    create: (data) => ipcRenderer.invoke('adjustments:create', data),
    getByProduct: (productId) => ipcRenderer.invoke('adjustments:getByProduct', productId),
  },
  stockMovement: {
    getByProduct: (productId) => ipcRenderer.invoke('stockMovement:getByProduct', productId),
  },
  auditLog: {
    getAll: (filters) => ipcRenderer.invoke('auditLog:getAll', filters),
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (data) => ipcRenderer.invoke('users:create', data),
    update: (id, data) => ipcRenderer.invoke('users:update', { id, ...data }),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
  },
});
