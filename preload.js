const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openSettings: () => ipcRenderer.send("open-settings")
});
