const { app } = require('electron');
const { encode } = require('@msgpack/msgpack');
const { logToFile } = require('./logger.cjs');
const path = require('path');
const fs = require('fs');

// Path for app-specific data
const userDataPath = app.getPath('temp');
async function createEstacFile(offerData, timestamp) {
  logToFile(`[estac_file_ops.cjs]: Creating ESTAC file at timestamp ${timestamp}`, "Log");
  const targetFilePath = path.join(userDataPath, "simp2p", `offer${timestamp}`);
  const serializedData = encode(offerData);
  try {
    fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
    fs.writeFileSync(targetFilePath, serializedData);
    logToFile(`[estac_file_ops.cjs]: ESTAC file for ${timestamp} created at ${targetFilePath}`, "Log");
    return targetFilePath;
  } catch (error) {
    logToFile(`[estac_file_ops.cjs]: Error creating ESTAC file for ${timestamp} (${error})`, "Error");
    throw error;
  }
}

async function clearEstacFiles() {
  logToFile(`[estac_file_ops.cjs]: Clearing ESTAC files...`, "Log");
  const estacDir = path.join(userDataPath, "simp2p");
  try {
    fs.rmSync(estacDir, { recursive: true });
  } catch (error) {
    logToFile(`[estac_file_ops.cjs]: Error clearing ESTAC files (${error})`, "Error");
    throw error;
  }
}

module.exports = { createEstacFile, clearEstacFiles };
