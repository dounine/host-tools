var Router = require('koa-router')
const service = require('./log/service')()

module.exports = function () {

    return new Router()
}