const { contextBridge,ipcRenderer } = require('electron');
// 预加载脚本,将不同类型的进程桥接在一起
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

// 主进程和渲染进程进行通信，并暴露接口
const electronHandler = {
  ipcRenderer: {
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
  },

}
contextBridge.exposeInMainWorld('electron', electronHandler);


// 暴露下载
contextBridge.exposeInMainWorld('downFile', {
  file: (url,fileName) => ipcRenderer.send("downFile",url,fileName)
});
