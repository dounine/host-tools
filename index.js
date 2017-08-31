// ctx.body = 'Hello World'
var body = require('koa-body')
const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const path = require('path')
const port = process.env.PORT || 3000
var Router = require('koa-router')
var token = 'abc123'
fs.readFile(__dirname+'/password.txt', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    } else {
        token = data;
    }
})


var router = new Router();
app.use(body())

app.use(async (ctx, next) => {
    if(ctx.headers['token']!=token.trim()){
        ctx.body = {code:2,msg:"token密码错误"}
    }else{
        await next(); // 调用下一个middleware
    }
});

app.use(require(path.join(__dirname,'/modules','port.js'))().routes());//端口路由
app.use(require(path.join(__dirname,'/modules','log.js'))().routes());//日志路由
app.use(require(path.join(__dirname,'/modules','docker.js'))().routes());//日志路由

app.use(router.routes())

app.on('error', function(err){
    log.error('server error', err);
});

app.listen(port,function () {
    console.log('host-tools is running http://0.0.0.0:'+port)
});