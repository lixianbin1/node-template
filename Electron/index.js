const startGame=()=>{
    console.log('开始游戏')
    //打开加载界面
    LoadingStart()
    setInterval(updateLoadingMessage,2000);
    //初始化数据
    initializeGame().then((data)=>{
        console.log(data)
    }).catch((err)=>{
        console.log(err)
    }).finally(()=>{
        //关闭加载界面
        LoadingEnd()
    })
}