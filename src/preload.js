const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('envFile', {
  sendToEncrypt: (fileContent, filePath, inputtedKey) => {
    ipcRenderer.invoke('encrypt-file', { fileContent, filePath, inputtedKey });
  },
  sendToDecrypt: (fileContent, filePath, inputtedKey) =>
    ipcRenderer.invoke('decrypt-file', { fileContent, filePath, inputtedKey }),
});
