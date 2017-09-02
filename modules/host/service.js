const cmd = require('node-cmd')
const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

module.exports = function (ctx) {

    this.free = function (ctx) {
        var name = ctx.params.name
        var ec1 = 'clush -g issp "free -m | grep -v Swap | grep -v total"'

        return getAsync(ec1).then((data, err) => {
            if (err) {
                ctx.body = {
                    code: 1,
                    msg: "not free.",
                    data: err
                }
            } else {
                ctx.body = {
                    code: 0,
                    msg: "free",
                    data: data[0]
                }

            }
        }).catch(err => {
            ctx.body = {
                code: 1,
                msg: err
            }
        });
    }

    return this
}