const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

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
}

app.whenReady().then(() => {
  console.log("App ready");
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
