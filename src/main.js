const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');
const fs = require('fs');
const baseKey = 'J6sPvR3yQ8TzA1wNcE5oI9lL7jU4fV2m';

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
const iv = randomBytes(16);

ipcMain.handle('encrypt-file', (_, { fileContent, filePath, inputtedKey }) => {
  console.log(handleEncryption(inputtedKey));
  try {
    const newPath = `${filePath}.env.encrypted`;
    if (doesFileExists(newPath)) return;
    const cipher = createCipheriv('aes-256-cbc', handleEncryption(inputtedKey), iv);
    const encryptedFile = cipher.update(fileContent, 'utf-8', 'hex') + cipher.final('hex');
    fs.writeFile(newPath, encryptedFile, (err) => {
      if (err) {
        throw err;
      }
    });
    dialog.showMessageBox(null, {
      title: 'Sucesso',
      buttons: ['Ok'],
      type: 'info',
      message: 'O arquivo foi criptografado',
    });
  } catch (err) {
    dialog.showErrorBox('Erro', 'Houve um erro ao criptografar o arquivo');
    console.log(err);
  }
});

ipcMain.handle('decrypt-file', (_, { fileContent, filePath, inputtedKey }) => {
  try {
    const newPath = `${filePath}.env.decrypted`;
    if (doesFileExists(newPath)) return;
    const decipher = createDecipheriv('aes-256-cbc', baseKey, iv);
    const decryptedFile = decipher.update(fileContent, 'hex', 'utf-8') + decipher.final('utf-8');
    fs.writeFile(newPath, decryptedFile, (err) => {
      if (err) {
        throw err;
      }
    });
    dialog.showMessageBox(null, {
      title: 'Sucesso',
      buttons: ['Ok'],
      type: 'info',
      message: 'O arquivo foi descriptografado',
    });
  } catch (err) {
    dialog.showErrorBox('Erro', 'Houve um erro ao descriptografar o arquivo');
    console.log(err);
  }
});

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

function doesFileExists(path) {
  if (fs.existsSync(path)) {
    dialog.showErrorBox('Erro', 'Já existe um arquivo com essa extensão no destino');
    return true;
  }
  return false;
}

function handleEncryption(inputtedKey) {
  // const iv = randomBytes(16);
  const maxLength = 32;
  let merged = '';
  for (let i = 0; i < maxLength; i++) {
    merged += (baseKey[i] ? baseKey[i] : '') + (inputtedKey[i] ? inputtedKey[i] : '');
  }
  return merged.slice(0, maxLength);
}
