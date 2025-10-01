// preload.js
const { contextBridge } = require("electron");
const { TextEncoder, TextDecoder } = require("util");

// Expose Node's TextEncoder/TextDecoder safely to renderer
contextBridge.exposeInMainWorld("util", {
  TextEncoder,
  TextDecoder,
});
