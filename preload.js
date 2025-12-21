const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("conversation", {
  sendText: (text) => ipcRenderer.invoke("conversation-send-text", text),
  sendFile: (filepath) => ipcRenderer.invoke("conversation-send-file", filepath),
});

contextBridge.exposeInMainWorld("logger", {
  logMessage: (message) => {
    console.log("Preload log:", message);
    ipcRenderer.invoke("logger-log-message", message);
  },
  warnMessage: (message) => {
    console.warn("Preload warn:", message);
    ipcRenderer.invoke("logger-warn-message", message);
  },
  errorMessage: (message) => {
    console.error("Preload error:", message);
    ipcRenderer.invoke("logger-error-message", message);
  },
});

contextBridge.exposeInMainWorld("connection-table", {
  addConnection: (conn_id, connection) => ipcRenderer.invoke("connection-table-add-connection", conn_id, connection),
  removeConnection: (conn_id) => ipcRenderer.invoke("connection-table-remove-connection", conn_id),
  retrieveConnection: (conn_id) => ipcRenderer.invoke("connection-table-retrieve-connection", conn_id),
  updateConnection: (conn_id, connection) => ipcRenderer.invoke("connection-table-update-connection", conn_id, connection),
});

contextBridge.exposeInMainWorld("estac", {
  createEstacFile: (sdp_and_ice, timestamp) => { return ipcRenderer.invoke("estac-create-estac-file", sdp_and_ice, timestamp) },
  dragStart: (filepath) => ipcRenderer.send("estac-drag-start", filepath),
});
