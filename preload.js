const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("conversation", {
  sendText: (text) => ipcRenderer.invoke("conversation-send-text", text),
  sendFile: (filepath) => ipcRenderer.invoke("conversation-send-file", filepath),
});

contextBridge.exposeInMainWorld("logger", {
  logMessage: (message) => {
    console.log("Preload logging:", message);
    ipcRenderer.invoke("logger-log-message", message);
  },
});

contextBridge.exposeInMainWorld("connection_table", {
  addConnection: (conn_id, connection) => ipcRenderer.invoke("connection_table-add-connection", conn_id, connection),
  removeConnection: (conn_id) => ipcRenderer.invoke("connection_table-remove-connection", conn_id),
  retrieveConnection: (conn_id) => ipcRenderer.invoke("connection_table-retrieve-connection", conn_id),
  updateConnection: (conn_id, connection) => ipcRenderer.invoke("connection_table-update-connection", conn_id, connection),
});
