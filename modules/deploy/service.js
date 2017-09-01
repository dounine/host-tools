var request = require('request-promise')

module.exports = function () {

    this.webhook = function (ctx) {
        var containerName = ctx.params.containerName
        var hostName = ctx.request.query.host
        var bb = ctx.request.body
        bb.containerName = containerName
        return request.post({
            method: 'POST',
            uri: 'http://'+hostName+':7777/webhook',
            json: true,
            headers: {
                'content-type': 'application/json',
                'x-gitlab-token': ctx.request.headers['token'],
                'x-gitlab-event': ctx.request.headers['x-gitlab-event']
            },
            body: bb
        }).then(function (body) {
            ctx.body = body
        })
    }

    return this
}