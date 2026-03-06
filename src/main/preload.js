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
  sales: {
    create: (items, customerId, customerName) =>
      ipcRenderer.invoke('sales:create', { items, customerId, customerName }),
    getAll: () => ipcRenderer.invoke('sales:getAll'),
  },
});
