import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Example: Send message to main process
  send: (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Example: Receive message from main process
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      const subscription = (_event: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },

  // App version (useful for showing in UI)
  appVersion: process.env.npm_package_version || '0.0.1',

  // Platform info
  platform: process.platform,
});

// Expose Node.js process info (read-only)
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
});

console.log('Preload script loaded successfully');
