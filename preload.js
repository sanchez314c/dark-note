const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
// Each listener-registration function removes prior listeners first to prevent
// accumulation across hot-reloads (memory leak fix).
contextBridge.exposeInMainWorld('electronAPI', {
  createNote: () => ipcRenderer.invoke('create-note'),
  closeNote: (id) => ipcRenderer.invoke('close-note', id),
  saveNoteContent: (id, content) => ipcRenderer.invoke('save-note-content', id, content),
  updateNoteColor: (id, color) => ipcRenderer.invoke('update-note-color', id, color),
  minimizeNote: (id) => ipcRenderer.invoke('minimize-note', id),
  toggleAlwaysOnTop: (id) => ipcRenderer.invoke('toggle-always-on-top', id),
  // Open external URL safely via main process (protocol-validated)
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Receive messages from main process.
  // Remove any prior listener before registering to prevent duplicate handlers
  // accumulating on page reloads, which would cause a memory leak.
  onLoadNote: (callback) => {
    ipcRenderer.removeAllListeners('load-note');
    ipcRenderer.on('load-note', (_event, data) => callback(data));
  },
  onRequestSave: (callback) => {
    ipcRenderer.removeAllListeners('request-save');
    ipcRenderer.on('request-save', () => callback());
  }
});
