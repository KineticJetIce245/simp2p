const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");


require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

ipcMain.on("open-settings", () => {
  console.log("Opening settings window...");
});

function createMainWindow() {
  console.log("Electron launched...");

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    }
  });

  win.loadFile("compiled/index.html")
    .then(() => console.log("Loaded main.html"))
    .catch(err => console.error("Failed to load main.html:", err));

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
