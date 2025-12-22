const { app } = require('electron');
const { encode, decode } = require('@msgpack/msgpack');
const { logToFile } = require('./logger.cjs');
const path = require('path');
const fs = require('fs');

// Path for app-specific data
const userDataPath = app.getPath('temp');

async function createEstacFile(conn_info) {
  logToFile(`[estac_file_ops.cjs]: Creating ESTAC file at timestamp ${conn_info.tmsp}`, "Log");
  const targetFilePath = path.join(userDataPath, "simp2p", `local${conn_info.tmsp}`);
  const serializedData = encode(conn_info);
  try {
    fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
    fs.writeFileSync(targetFilePath, serializedData);
    logToFile(`[estac_file_ops.cjs]: ESTAC file for ${conn_info.tmsp} created at ${targetFilePath}`, "Log");
    return targetFilePath;
  } catch (error) {
    logToFile(`[estac_file_ops.cjs]: Error creating ESTAC file for ${conn_info.tmsp} (${error})`, "Error");
    throw error;
  }
}

async function receiveEstacUrl(file_url) {
  logToFile(`[estac_file_ops.cjs]: Receiving ESTAC file from remote path: ${file_url}`, "Log");
  const response = await fetch(file_url);
  if (!response.ok) {
    logToFile(`[estac_file_ops.cjs]: Error fetching ESTAC file from ${file_url} (Status: ${response.status})`, "Error");
    throw new Error(`Failed to fetch ESTAC file from ${file_url} (Status: ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return decode(new Uint8Array(arrayBuffer));
}

async function receiveEstacBuffer(file_buffer) {
  logToFile(`[estac_file_ops.cjs]: Receiving ESTAC file ${file_buffer.name}`, "Log");
  return decode(new Uint8Array(file_buffer.data));
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

async function removeEstacFile(conn_id) {
  const target_path = path.join(userDataPath, "simp2p", `local${conn_id}`);
  logToFile(`[estac_file_ops.cjs]: Removing ESTAC file at path: ${target_path}`, "Log");
  try {
    fs.rmSync(target_path, { recursive: true });
  } catch (error) {
    logToFile(`[estac_file_ops.cjs]: Error clearing ESTAC files (${error})`, "Error");
    throw error;
  }
}

module.exports = { createEstacFile, clearEstacFiles, receiveEstacBuffer, receiveEstacUrl, removeEstacFile };
