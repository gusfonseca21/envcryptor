const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const crypto = require("crypto");
const fs = require("fs");

try {
  require("electron-reloader")(module);
} catch {}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: false,
  });
  win.loadFile("index.html");
};

function encryptFile(content) {
  const hash = crypto.createHash("md5");
  const data = hash.update(content, "utf-8");
  const genHash = data.digest("hex");
  return genHash;
}

ipcMain.handle("encrypt-file", (_, { fileContent, filePath }) => {
  console.log(filePath);
  const encryptedFile = encryptFile(fileContent);

  writeNewFile(encryptedFile, filePath);
});

async function writeNewFile(content, path) {
  try {
    fs.writeFile(`${path}.envcryptor`, content, (err) => {
      if (err) {
        throw err;
      }
    });
  } catch (err) {
    console.log(err);
  }
}

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
