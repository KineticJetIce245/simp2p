const { app, BrowserWindow, ipcMain } = require("electron");
const { logMessage } = require("./svr/logger.cjs");
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
  if (process.platform !== "darwin") app.quit();
});

let connection_table = {}

ipcMain.handle("logger-log-message", async (event, message) => {
  logMessage(message);
});

ipcMain.handle("connection_table-add-connection", async (event, conn_id, connection) => {
  if (!(connection_table[conn_id])) {
    connection_table[conn_id] = connection;
    logMessage(`Connection ID ${conn_id} added to the connection table.`);
  } else {
    logMessage(`Connection ID ${conn_id} already exists in the connection table.`);
    throw new Error(`Connection ID ${conn_id} already exists.`);
  }
});

ipcMain.handle("connection_table-remove-connection", async (event, conn_id) => {
  if (connection_table[conn_id]) {
    connection_table[conn_id] = null;
    logMessage(`Connection ID ${conn_id} removed from the connection table.`);
  } else {
    logMessage(`Connection ID ${conn_id} not found in the connection table.`);
  }
});

ipcMain.handle("connection_table-retrieve-connection", async (event, conn_id) => {
  if (connection_table[conn_id]) {
    return connection_table[conn_id];
  } else {
    logMessage(`Connection ID ${conn_id} not found in the connection table.`);
    throw new Error(`Connection ID ${conn_id} not found.`);
  }
});

ipcMain.handle("connection_table-update-connection", async (event, conn_id, connection) => {
  if (connection_table[conn_id]) {
    connection_table[conn_id] = connection;
  } else {
    logMessage(`Connection ID ${conn_id} not found in the connection table. Adding new connection.`);
    connection_table[conn_id] = connection;
  }
});
