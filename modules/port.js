var Router = require('koa-router')
const service = require('./port/service')()

module.exports = function () {

    return new Router()
        .post('/port/open/:range', async = ctx => {
            var aa = async function () {
                let result = await service.getCheckPorts(ctx)
                ctx.body = result
            }
            return aa()
        }).post('/port/open', async = ctx => {
            var aa = async function () {
                let result = await service.getCheckPorts(ctx)
                ctx.body = result
            }
            return aa()
        }).post('/port/use/:port', async = ctx => {
            var aa = async function () {
                let result = await service.check(ctx.request.body.host,ctx.params.port)
                ctx.body = result
            }
            return aa()
        })
}