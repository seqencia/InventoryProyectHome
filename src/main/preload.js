const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Aquí puedes exponer funciones de Node.js al frontend
});
