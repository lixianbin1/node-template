layui.use(function(){
  var layer = layui.layer;
  var form = layui.form;
  var laydate = layui.laydate;
  var util = layui.util;
  
  //查询用户信息
  getData('http://localhost:8888/api/user/info').then((data)=>{
    layer.msg(data.message);
    let userData = JSON.stringify(data.data)
    window.electronAPI.setStoreValue('user',userData)
  }).catch(err=>{
    console.log(err)
  })


});