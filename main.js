const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const { spawn } = require("child_process"); // ✅ add this


let mainWindow;
let serverProcess; // ✅ keep reference

function startServer() {
  const serverPath = isDev
    ? path.join(__dirname, "server.js") // dev mode
    : path.join(process.resourcesPath, "server.js"); // exe mode

  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    shell: true,       // ✅ Windows exe me zaruri
    cwd: path.dirname(serverPath), // ✅ ensure correct working dir
  });

  serverProcess.on("close", (code) => {
    console.log(`🚨 Server process exited with code ${code}`);
  });

  serverProcess.on("error", (err) => {
    console.error("❌ Failed to start server:", err);
  });
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(process.resourcesPath, "build", "index.html");
    console.log("👉 Trying to load index.html from:", indexPath);

    mainWindow
      .loadFile(indexPath)
      .then(() => console.log("✅ index.html loaded successfully"))
      .catch((err) => console.error("❌ Failed to load index.html:", err));
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  startServer();   // ✅ server.js start automatically inside exe
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});

// ✅ clean up server when app quits
app.on("quit", () => {
  if (serverProcess) serverProcess.kill();
});
