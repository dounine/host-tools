var Router = require('koa-router')

const service = require('./docker/service')()

module.exports = function () {

    return new Router()
        .post('/docker/ps', async = ctx => {
            return service.ps(ctx)
        }).post('/docker/exist/:name', async = ctx => {
            return service.exist(ctx)
        }).post('/docker/create', async = ctx => {
            return service.create(ctx)
        }).post('/docker/del/:name', async = ctx => {
            return service.del(ctx)
        }).post('/docker/stop/:name', async = ctx => {
            return service.stop(ctx)
        })
}