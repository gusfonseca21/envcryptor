const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('envFile', {
  sendToEncrypt: (fileContent, filePath) =>
    ipcRenderer.invoke('encrypt-file', { fileContent, filePath }),
  sendToDecrypt: (fileContent, filePath) =>
    ipcRenderer.invoke('decrypt-file', { fileContent, filePath }),
});
