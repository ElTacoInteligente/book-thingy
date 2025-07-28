// preload.js - Secure bridge between renderer and main process
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Data operations
    loadLibrary: () => ipcRenderer.invoke('load-library'),
    saveLibrary: (data) => ipcRenderer.invoke('save-library', data),
    getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
    
    // Authentication
    googleOAuth: () => ipcRenderer.invoke('google-oauth'),
    
    // Menu operations
    onExportLibrary: (callback) => ipcRenderer.on('export-library', callback),
    onImportLibrary: (callback) => ipcRenderer.on('import-library', callback)
});