const { app, BrowserWindow, ipcMain } = require("electron");
const { logToFile } = require("./svr/logger.cjs");
const { createEstacFile, clearEstacFiles } = require("./svr/estac_file_ops.cjs");
const path = require("path");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

function createMainWindow() {
  console.log("Electron launched...");

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    }
  });

  if (process.env.VITE_DEV) {
    console.log("Loading from Vite dev server...");
    win.loadURL("http://localhost:5173");

  } else {
    console.log("Loading compiled index.html...");
    win.loadFile("compiled/index.html")
      .then(() => console.log("Loaded main.html"))
      .catch(err => console.error("Failed to load main.html:", err));
  }

  win.webContents.openDevTools();

  win.removeMenu();
}

app.whenReady().then(() => {
  console.log("App is ready.");
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    clearEstacFiles();
    app.quit();
  }
});

let connection_table = {}

ipcMain.handle("logger-log-message", async (event, message) => {
  logToFile(message, "Log");
});

ipcMain.handle("logger-warn-message", async (event, message) => {
  logToFile(message, "Warn");
});

ipcMain.handle("logger-error-message", async (event, message) => {
  logToFile(message, "Error");
});

ipcMain.handle("connection-table-add-connection", async (event, conn_id, connection) => {
  if (!(connection_table[conn_id])) {
    connection_table[conn_id] = connection;
    logToFile(`[Main]: Connection ID ${conn_id} added to the connection table.`);
  } else {
    logToFile(`[Main]: Connection ID ${conn_id} already exists in the connection table.`, "Error");
    throw new Error(`Connection ID ${conn_id} already exists.`);
  }
});

ipcMain.handle("connection-table-remove-connection", async (event, conn_id) => {
  if (connection_table[conn_id]) {
    connection_table[conn_id] = null;
    logToFile(`[Main]: Connection ID ${conn_id} removed from the connection table.`);
  } else {
    logToFile(`[Main]: Connection ID ${conn_id} not found in the connection table.`);
  }
});

ipcMain.handle("connection-table-retrieve-connection", async (event, conn_id) => {
  if (connection_table[conn_id]) {
    return connection_table[conn_id];
  } else {
    logToFile(`[Main]: Connection ID ${conn_id} not found in the connection table.`, "Error");
    throw new Error(`Connection ID ${conn_id} not found.`);
  }
});

ipcMain.handle("connection-table-update-connection", async (event, conn_id, connection) => {
  if (connection_table[conn_id]) {
    connection_table[conn_id] = connection;
  } else {
    logToFile(`[Main]: Connection ID ${conn_id} not found in the connection table. Adding new connection.`);
    connection_table[conn_id] = connection;
  }
});

ipcMain.handle("estac-create-estac-file", async (event, sdp_and_ice, timestamp) => {
  logToFile(`[Main]: Creating ESTAC file for timestamp ${timestamp}...`);
  const targetPath = await createEstacFile(sdp_and_ice, timestamp); // returns a promise containing file name
  logToFile(`[Main]: ESTAC file for timestamp ${timestamp} created at path: ${targetPath}`);
  return targetPath;
});

ipcMain.on("estac-drag-start", (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: "./svr/assets/icon/dragclick.png"
  });
});
