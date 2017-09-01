var Router = require('koa-router')

const service = require('./docker/service')()

module.exports = function () {

    return new Router()
        .post('/docker/ps', async = ctx => {
            return service.ps(ctx)
        }).post('/docker/exist/:name', async = ctx => {
            return service.exist(ctx)
        }).post('/docker/create', async = ctx => {
            var containerName = ctx.request.body.containerName
            if(containerName==''){
                ctx.body = {
                    code:1,
                    msg:'containerName不能为空'
                }
            }else{
                var cns = containerName.indexOf('-')[1]
                if(containerName.indexOf('-')==-1){
                    ctx.body = {
                        code:1,
                        msg:'containerName非法'
                    }
                }else if(cns!='node'&&cns!='consumer'&&cns!='provider'){
                    ctx.body = {
                        code:1,
                        msg:'containerName非法,只能为-node,-consumer,-provider结尾'
                    }
                }else{
                    return service.create(ctx)
                }
            }

        }).post('/docker/del/:name', async = ctx => {
            return service.del(ctx)
        }).post('/docker/stop/:name', async = ctx => {
            return service.stop(ctx)
        })
}