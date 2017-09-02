var Router = require('koa-router')
const service = require('./host/service')()

module.exports = function () {

    return new Router()
        .get('/host/free', async = ctx => {
            return service.free(ctx)
        })
}
