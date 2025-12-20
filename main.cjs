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

ipcMain.handle("log-message", async (event, message) => {
  logMessage(message);
});

