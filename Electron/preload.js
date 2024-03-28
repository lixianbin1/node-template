const { contextBridge,ipcRenderer } = require('electron');

// 定义全局函数
contextBridge.exposeInMainWorld('electronAPI',{
  loginTo: () => ipcRenderer.send('loginTo'),
  setStoreValue: (key, value) => {
    ipcRenderer.send("setStore", key, value)
  },
  getStoreValue(key) {
    const resp = ipcRenderer.sendSync("getStore", key)
    return resp
  },
  clearStorae() {
    ipcRenderer.send("clearStore")
  },
})