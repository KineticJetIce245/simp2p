const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// Path for app-specific data
const userDataPath = app.getPath('userData');
const logFile = path.join(userDataPath, 'app.log');

async function logMessage(message) {
  let current_time = Date.now();
  let log_time = new Date(current_time).toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  fs.appendFileSync(logFile, `[${log_time}]: ${message}` + '\n');
  console.log(message);
}

module.exports = { logMessage };
