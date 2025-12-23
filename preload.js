const { contextBridge, ipcRenderer } = require("electron");

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

contextBridge.exposeInMainWorld("rtchost", {
  onBstrapConvRequest: (callback) =>
    ipcRenderer.on("rtchost-on-bstrap-conv-request", async (event, reply) =>
      ipcRenderer.send(reply, await callback())),
  onBstrapConvAnswerRequest: (callback) =>
    ipcRenderer.on("rtchost-on-bstrap-conv-answer-request", async (event, reply, conv_info) =>
      ipcRenderer.send(reply, await callback(conv_info))),
  onLoadSdpAndIcesRequest: (callback) =>
    ipcRenderer.on("rtchost-on-load-estac-request", async (event, reply, conn_info) =>
      ipcRenderer.send(reply, await callback(conn_info))),
  bstrapConv: () => ipcRenderer.invoke("rtchost-bstrap-conv"),
  bstrapConvAnswer: (conv_info) =>
    ipcRenderer.invoke("rtchost-bstrap-conv-answer", conv_info),
  loadSdpAndIces: (conn_info) =>
    ipcRenderer.invoke("rtchost-load-estac", conn_info),
});

contextBridge.exposeInMainWorld("estac", {
  createEstacFile: (connection_info) => { return ipcRenderer.invoke("estac-create-estac-file", connection_info); },
  dragStart: (file_path) => ipcRenderer.send("estac-drag-start", file_path),
  dropUrl: (file_url) => ipcRenderer.invoke("estac-drop-url", file_url),
  dropBuffer: (file_buffer) => ipcRenderer.invoke("estac-drop-buffer", file_buffer),
});
