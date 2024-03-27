const { app,ipcMain,shell,BrowserWindow ,Menu,Notification} = require('electron')
const path = require('path') // 路径模块
const Store = require('electron-store');
const store = new Store();
/* 存储文件路径 */
// console.log(store.path);

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



// 创建窗口函数
const createWindow = () => {
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

  win.webContents.openDevTools({mode:'right'})
  win.loadFile('index.html')
  win.once('ready-to-show', () => {
    win.show()
  })



  // // 下载功能
  // win.webContents.session.on('will-download', (event, item, webContents) => {

  //   // 获取安装目录（也就是文件安装目录中exe文件的目录）
  //   let homeDir =  path.dirname(app.getPath('exe'))
  //   // // 无需对话框提示， 直接将文件保存到路径
  //   // item.setSavePath(homeDir)

  
  //   item.on('updated', (event, state) => {
  //     // item.setSavePath(homeDir + '/' + )
  //     if (state === 'interrupted') {
  //       console.log('下载已中断,但阔以继续')
  //     } else if (state === 'progressing') {
  //       if (item.isPaused()) {
  //         console.log('下載已暫停')
  //       } else {
  //         console.log(`已接收位元組: ${item.getReceivedBytes()}`)
  //       }
  //     }
  //   })
  //   item.once('done', (event, state) => {
  //     if (state === 'completed') {
  //       console.log('下載成功')
  //     } else {
  //       console.log(`下載失敗: ${state}`)
  //     }
  //   })
  // })
  return win
}

// 只有在app模块的ready事件被激发后才能创建浏览器窗口
app.whenReady().then(() => {
  let win = createWindow()

  // 监听
  ipcMain.on('downFile', (_, url,fileName) => {
    console.log('creating',_, url,fileName)
    //下载
    downloadFileToFolder(win,url,fileName)
  });
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听关闭窗口，在所有窗口关闭后，退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})