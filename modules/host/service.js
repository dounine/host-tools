const cmd = require('node-cmd')
const Promise = require('bluebird')
const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

module.exports = function () {

    this.free = function (ctx) {
        var name = ctx.params.name
        var ec1 = 'clush -g host "free -m | grep -v Swap | grep -v total"'

        return getAsync(ec1).then((data, err) => {
            if (err) {
                ctx.body = {
                    code: 1,
                    msg: "not free.",
                    data: err
                }
            } else {
                var hosts = []
                var aas = data[0].split(/\n/)
                for(var a in aas){
                    var aa = aas[a].split('      ')
                    if(aa.length>4){
                        hosts.push({
                            '主机地扯':aa[0].trim().split(':')[0],
                            '全部(m)':aa[1].trim(),
                            '使用(m)':aa[2].trim(),
                            '剩余(m)':aa[3].trim()
                        })
                    }
                }
                hosts.sort(function (a,b) {
                    if(b['剩余(m)']==a['剩余(m)']){
                        return 0
                    }else if(parseInt(b['剩余(m)'])>parseInt(a['剩余(m)'])){
                        return 1
                    }
                    return -1
                })
                ctx.body = {
                    code: 0,
                    msg: "free",
                    data: hosts
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