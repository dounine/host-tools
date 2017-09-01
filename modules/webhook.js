var Router = require('koa-router')

const service = require('./deploy/service')()

module.exports = function () {

    return new Router()
        .post('/webhook/:containerName', async = ctx => {
            if(!ctx.request.query.host){
                ctx.body = {
                    code:1,
                    msg:'host主机地扯参数不能为空'
                }
            }else{
                if(ctx.params.containerName.indexOf('-')==-1){
                    ctx.body = {
                        code:1,
                        msg:'containerName必需带-符号分隔[node,consumer,provider]'
                    }
                }else{
                    return service.webhook(ctx)
                }
            }
        })
}