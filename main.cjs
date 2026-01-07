const { app, BrowserWindow, ipcMain } = require("electron");
const { logToFile } = require("./svr/main/logger.cjs");
const { createEstacFile, clearEstacFiles, receiveEstacBuffer, receiveEstacUrl, removeEstacFile, encodeData, decodeData } = require("./svr/main/estac_file_ops.cjs");
const path = require("path");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

let rtc_host = null;

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 820,
    minWidth: 500,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    }
  });

  if (process.env.VITE_DEV) {
    win.loadURL("http://localhost:5173");

  } else {
    win.loadFile("compiled/index.html")
      .then(() => console.log("Loaded main.html"))
      .catch(err => console.error("Failed to load main.html:", err));
  }

  win.webContents.openDevTools();

  win.removeMenu();

  win.on("closed", () => {
    if (process.platform !== "darwin") {
      clearEstacFiles();
      app.quit();
    }
  });
}

app.whenReady().then(() => {

  createMainWindow();

  rtc_host = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    }
  });
  rtc_host.loadFile(`svr/rtc/rtc_host.html`);
  logToFile("[Main]: Application is ready.");

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

ipcMain.handle("logger-log-message", async (event, message) => {
  logToFile(message, "Log");
});

ipcMain.handle("logger-warn-message", async (event, message) => {
  logToFile(message, "Warn");
});

ipcMain.handle("logger-error-message", async (event, message) => {
  logToFile(message, "Error");
});

ipcMain.handle("estac-create-estac-file", async (event, conv_info) => {
  logToFile(`[Main]: Creating ESTAC file for timestamp ${conv_info.conv_id}...`);
  const targetPath = await createEstacFile(conv_info); // returns a promise containing file name
  logToFile(`[Main]: ESTAC file for timestamp ${conv_info.conv_id} created at path: ${targetPath}`);
  return targetPath;
});

ipcMain.on("estac-drag-start", (event, file_path) => {
  event.sender.startDrag({
    file: file_path,
    icon: "./svr/assets/icon/dragclick.png"
  });
});

ipcMain.handle("estac-drop-url", async (event, file_url) => {
  return await receiveEstacUrl(file_url);
});

ipcMain.handle("estac-drop-buffer", async (event, file_path) => {
  return await receiveEstacBuffer(file_path);
});

ipcMain.handle("estac-encode", async (event, data) => {
  return encodeData(data);
});

ipcMain.handle("estac-decode", async (event, data) => {
  return decodeData(data);
});

ipcMain.handle("rtchost-bstrap-conv", async () => {
  return await new Promise((resolve) => {
    const reply = `rtchost-bstrap-conv-${Date.now()}`;
    ipcMain.once(reply, (event, data) => resolve(data));
    rtc_host.webContents.send('rtchost-on-bstrap-conv-request', reply);
  })
});

ipcMain.handle("rtchost-bstrap-conv-answer", async (event, conv_info) => {
  return await new Promise((resolve) => {
    const reply = `rtchost-bstrap-conv-answer-${Date.now()}`;
    ipcMain.once(reply, (event, data) => resolve(data));
    rtc_host.webContents.send('rtchost-on-bstrap-conv-answer-request', reply, conv_info);
  })
});

ipcMain.handle("rtchost-load-estac", async (event, conn_info) => {
  return await new Promise((resolve) => {
    const reply = `rtchost-load-estac-${Date.now()}`;
    ipcMain.once(reply, (event, data) => resolve(data));
    rtc_host.webContents.send('rtchost-on-load-estac-request', reply, conn_info);
  })
});

ipcMain.handle("rtchost-new-connection", async (event, conv_id, channel_type) => {
  return await new Promise((resolve) => {
    const reply = `rtchost-new-connection-${Date.now()}`;
    ipcMain.once(reply, (event, data) => resolve(data));
    rtc_host.webContents.send('rtchost-on-new-conn-request', reply, conv_id, channel_type);
  })
});
