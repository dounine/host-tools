const Promise = require('bluebird')
const cmd = require('node-cmd')
const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})
const isTest = false

module.exports = function () {

    this.check = function (host,port) {
        return new Promise(function (resolve,reject) {
            var bodyData = {}
            var shellStr = 'ssh server1 \"ssh '+host+' \"nmap -sT -p ' + port + ' localhost\""'
            var shellStr1 = 'ssh '+host+' \"nmap -sT -p ' + port + ' localhost"'
            cmd.get(isTest?shellStr:shellStr1,function(err, data, stderr){
                let ports = data.split('\n')
                let newPorts = []
                var isBegin = false, isEnd = false
                ports.forEach(function (port) {
                    if (port.indexOf('PORT') == 0) {
                        isBegin = true
                        return
                    }
                    if (isBegin) {
                        if (port == '') {
                            isEnd = true
                        }
                        if (!isEnd) {
                            var spl = port.split(/\s+/)
                            newPorts.push({
                                port: spl[0],
                                status:spl[1],
                                type: spl[2]
                            })
                        }
                    }
                })
                bodyData = {
                    code: 0,
                    msg: port+'端口范围使用情况',
                    data: newPorts[0].status=='open'?true:false
                }
                resolve(bodyData)
            })
        })

    }

    this.getCheckPorts = async function(ctx) {
        var range
        if (ctx.params.range) {
            range = ctx.params.range
        } else {
            range = '5000-6000'
        }
        var host = ctx.request.body.host
        return new Promise(function (resolve,reject) {
            var ec ='ssh server1 \"ssh ' + host + ' \"nmap -sT -p ' + range + ' localhost\""'
            var ec1 ='ssh ' + host + ' \"nmap -sT -p ' + range + ' localhost"'
            cmd.get(isTest?ec:ec1, function (err, data, stderr) {
                let ports = data.split('\n')
                let newPorts = []
                var isBegin = false, isEnd = false
                ports.forEach(function (port) {
                    if (port.indexOf('PORT') == 0) {
                        isBegin = true
                        return
                    }
                    if (isBegin) {
                        if (port == '') {
                            isEnd = true
                        }
                        if (!isEnd) {
                            var spl = port.split(/\s+/)
                            newPorts.push({
                                port: spl[0],
                                type: spl[2]
                            })
                        }
                    }
                })
                resolve({
                    code: 0,
                    msg: range + '端口范围使用情况',
                    data: newPorts
                })
            })
        });
    }

    return this
}