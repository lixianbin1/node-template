layui.use(function(){
    var layer = layui.layer;
    var form = layui.form;
    var laydate = layui.laydate;
    var util = layui.util;
    
    console.log(form)
    // 触发事件
    util.on('click', {
      'loginTo': function(e){
        console.log(e)
      }
    });

    // 提交事件
    form.on('submit(login)', function(data){
      var field = data.field; // 获取表单全部字段值
      var elem = data.elem; // 获取当前触发事件的元素 DOM 对象，一般为 button 标签
      var elemForm = data.form; // 获取当前表单域的 form 元素对象，若容器为 form 标签才会返回。
      // 显示填写结果，仅作演示用
      postData('http://localhost:8888/api/user/login',field).then((data)=>{
        layer.msg(data.message);
      })
      // 此处可执行 Ajax 等操作
      // …
      return false; // 阻止默认 form 跳转
    });
  });