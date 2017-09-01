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
            var projectPort = ctx.request.body.projectPort | 0
            if (containerName == '') {
                ctx.body = {
                    code: 1,
                    msg: 'containerName不能为空'
                }
            } else {
                var cns = containerName.split('-')[1]
                if (containerName.indexOf('-') == -1) {
                    ctx.body = {
                        code: 1,
                        msg: 'containerName非法'
                    }
                } else if (cns != 'node' && cns != 'consumer' && cns != 'provider') {
                    ctx.body = {
                        code: 1,
                        msg: 'containerName非法,只能为-node,-consumer,-provider结尾'
                    }
                } else {
                    if (cns == 'node' && (projectPort < 5000 || projectPort >= 5200)) {
                        ctx.body = {
                            code: 1,
                            msg: 'node端口范围5000 <= port < 5200'
                        }
                    } else if (cns == 'consumer' && (projectPort < 5200 || projectPort >= 5400)) {
                        ctx.body = {
                            code: 1,
                            msg: 'consumer端口范围5200 <= port < 5400'
                        }
                    } else if (cns == 'provider' && (projectPort < 5400 || projectPort >= 5600)) {
                        ctx.body = {
                            code: 1,
                            msg: 'provider端口范围5400 <= port < 5600'
                        }
                    } else {
                        return service.create(ctx)
                    }
                }
            }

        }).post('/docker/del/:name', async = ctx => {
            return service.del(ctx)
        }).post('/docker/stop/:name', async = ctx => {
            return service.stop(ctx)
        })
}
