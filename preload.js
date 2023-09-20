const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("envFile", {
  sendToEncrypt: (fileContent, filePath) =>
    ipcRenderer.invoke("encrypt-file", { fileContent, filePath }),
});

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
});
