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
    ipcRenderer.on("rtchost-on-bstrap-conv-request", async (event, reply) => {
      try {
        const result = await callback();
        ipcRenderer.send(reply, { success: true, data: result });
      } catch (error) {
        ipcRenderer.send(reply, { success: false, error: error?.message ?? String(error) });
      }
    }),
  onBstrapConvAnswerRequest: (callback) =>
    ipcRenderer.on("rtchost-on-bstrap-conv-answer-request", async (event, reply, conv_info) => {
      try {
        const result = await callback(conv_info);
        ipcRenderer.send(reply, { success: true, data: result });
      } catch (error) {
        ipcRenderer.send(reply, { success: false, error: error?.message ?? String(error) });
      }
    }),
  onLoadSdpAndIcesRequest: (callback) =>
    ipcRenderer.on("rtchost-on-load-estac-request", async (event, reply, conv_info) => {
      try {
        const result = await callback(conv_info);
        ipcRenderer.send(reply, { success: true, data: result });
      } catch (error) {
        ipcRenderer.send(reply, { success: false, error: error?.message ?? String(error) });
      }
    }),
  onNewConnRequest: (callback) =>
    ipcRenderer.on("rtchost-on-new-conn-request", async (event, reply, conv_id, channel_type) => {
      try {
        const result = await callback(conv_id, channel_type);
        ipcRenderer.send(reply, { success: true, data: result });
      } catch (error) {
        ipcRenderer.send(reply, { success: false, error: error?.message ?? String(error) });
      }
    }
    ),
  bstrapConv: () => ipcRenderer.invoke("rtchost-bstrap-conv"),
  bstrapConvAnswer: (conv_info) =>
    ipcRenderer.invoke("rtchost-bstrap-conv-answer", conv_info),
  loadSdpAndIces: (conn_info) =>
    ipcRenderer.invoke("rtchost-load-estac", conn_info),
  newConnection: (conv_id, channel_type) =>
    ipcRenderer.invoke("rtchost-new-connection", conv_id, channel_type),
});

contextBridge.exposeInMainWorld("estac", {
  createEstacFile: (connection_info) => { return ipcRenderer.invoke("estac-create-estac-file", connection_info); },
  dragStart: (file_path) => ipcRenderer.send("estac-drag-start", file_path),
  dropUrl: (file_url) => ipcRenderer.invoke("estac-drop-url", file_url),
  dropBuffer: (file_buffer) => ipcRenderer.invoke("estac-drop-buffer", file_buffer),
  encode: (data) => { return ipcRenderer.invoke("estac-encode", data) },
  decode: (data) => { return ipcRenderer.invoke("estac-decode", data) },
});
