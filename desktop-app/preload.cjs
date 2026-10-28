const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('entidadesDesktop', {
  platform: process.platform,
});
