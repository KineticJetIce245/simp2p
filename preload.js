const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("conversation", {
  sendText: (text) => ipcRenderer.invoke("send-text", text),
  sendFile: (filepath) => ipcRenderer.invoke("send-file", filepath)
});
