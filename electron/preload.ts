// Preload script for Electron
// This script runs in the renderer process before the web page loads

import { contextBridge, ipcRenderer, clipboard } from 'electron'

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Example API methods
    openWindow: (url: string) => ipcRenderer.invoke('open-win', url),

    // Server management
    getServerStatus: () => ipcRenderer.invoke('get-server-status'),
    restartServer: () => ipcRenderer.invoke('restart-server'),

    // Clipboard functionality
    clipboard: {
        writeText: (text: string) => {
            clipboard.writeText(text);
            return Promise.resolve();
        },
        readText: () => clipboard.readText()
    },

    // Listen for main process messages
    onMainMessage: (callback: (message: string) => void) => {
        ipcRenderer.on('main-process-message', (_event, message) => callback(message))
    }
})

// Simple preload functionality
console.log('Preload script loaded successfully')
