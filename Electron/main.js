const { app,ipcMain,remote,BrowserWindow ,Menu,Notification} = require('electron')
const path = require('path') // 路径模块
const Store = require('electron-store');
const store = new Store();
/* 存储文件路径 */
console.log(store.path);

// 定义ipcRenderer监听事件
ipcMain.on('setStore', (_, key, value) => {
  store.set(key, value)
})
ipcMain.on('getStore', (_, key) => {
  let value = store.get(key)
  _.returnValue = value || ""
})
ipcMain.on('clearStore', (_, key, value) => {
  store.clear()
})
ipcMain.on('loginTo', () => { //登录跳转
  closeCurrentWindow()
  homeWindow()
});


// 设置自定义菜单
const template=[]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// 右下角通知
const Ealert = (title="Title",text="Undefined",back=null)=>{
  const NOTIFICATION_TITLE = title
  const NOTIFICATION_BODY = text
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY
  }).show()
}
//下载函数
const downloadFileToFolder=(win,url, fileName)=>{
  win.webContents.downloadURL(url);
  win.webContents.session.once('will-download', (event, item, webContents) => {
    //设置保存路径
    const filePath = path.join(app.getAppPath(), '/download', `${fileName}`);
    console.log(filePath)
    item.setSavePath(filePath);
    item.once('done', (event, state) => {
      if (state === 'completed') {
        Ealert('通知',"下载成功！")
      }
    })
  })
}

// 登录窗口
const loginWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth:300,
    minHeight:600,
    resizable: false,
    backgroundColor: '#fff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.webContents.openDevTools({mode:'detach'})
  win.loadFile('index.html')
  win.once('ready-to-show', () => {
    win.show()
  })
  return win
}
// 主页面
const homeWindow =()=>{
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth:1000,
    minHeight:600,
    resizable: true,
    show:false,
    backgroundColor: '#fff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.webContents.openDevTools({mode:'detach'})
  win.loadFile('./page/index.html')
  win.once('ready-to-show', () => {
    win.show()
  })
  return win
}
// 关闭当前窗口的函数
function closeCurrentWindow() {
  let window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
}




// 只有在app模块的ready事件被激发后才能创建浏览器窗口
app.whenReady().then(() => {
  let win = loginWindow()

  // 监听
  ipcMain.on('downFile', (_, url,fileName) => {
    console.log('creating',_, url,fileName)
    //下载
    downloadFileToFolder(win,url,fileName)
  });
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) loginWindow()
  })
})

// 监听关闭窗口，在所有窗口关闭后，退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})