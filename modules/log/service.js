const Promise = require('bluebird')
const cmd = require('node-cmd')
const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})


module.exports = function (ctx) {

    return this
}