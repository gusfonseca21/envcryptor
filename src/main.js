const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');
const fs = require('fs');

try {
  require('electron-reloader')(module);
} catch (err) {
  console.log(err);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: false,
  });
  win.loadFile('./modules/screen/index.html');
};

// const key = randomBytes(32);
const iv = randomBytes(16);

const key = 'J6sPvR3yQ8TzA1wNcE5oI9lL7jU4fV2m';
// const iv = 'H9sPvR3yQ8TzA1wN';

ipcMain.handle('encrypt-file', (_, { fileContent, filePath }) => {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encryptedFile = cipher.update(fileContent, 'utf-8', 'hex') + cipher.final('hex');
  writeNewFile(encryptedFile, `${filePath}.env.encrypted`);
});

ipcMain.handle('decrypt-file', (_, { fileContent, filePath }) => {
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const decryptedFile = decipher.update(fileContent, 'hex', 'utf-8') + decipher.final('utf-8');
  writeNewFile(decryptedFile, `${filePath}.env.decrypted`);
});

async function writeNewFile(content, path) {
  try {
    fs.writeFile(path, content, (err) => {
      if (err) {
        throw err;
      }
    });
  } catch (err) {
    console.log(err);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
