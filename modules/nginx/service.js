var fs = require('fs');
var join = require('path').join;
var abPath = '/root/github/docker-nginx'

module.exports = function () {

    this.create = async function (domain, host, projectPort, containerName) {
        var isNode = containerName.split('-')[1] == 'node'
        if (containerName.split('-')[1] == 'consumer' || containerName.split('-')[1] == 'node') {
            var fileContext = []
            fileContext.push('server {')
            fileContext.push('    listen ' + (isNode ? 80 : 8080) + ';')
            fileContext.push('    server_name ' + domain + ';')
            fileContext.push('    access_log on;')
            fileContext.push('    location / {')
            fileContext.push('        client_max_body_size    100m;')
            fileContext.push('        proxy_pass http://' + host + ':' + projectPort + ';')
            fileContext.push('        proxy_set_header  Host  $host;')
            fileContext.push('        proxy_set_header  X-Real-IP  $remote_addr;')
            fileContext.push('        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;')
            fileContext.push('    }')
            fileContext.push('}')
            var result = await new Promise(function (resolve, reject) {
                fs.writeFile(abPath + "/" + containerName + ".conf", fileContext.join('\n'), function (err) {
                    if (err) {
                        resolve({
                            code: 1,
                            msg: 'nginx映射文件创建错误',
                            data: err
                        })
                        return console.log(err);
                    }
                    resolve({
                        code: 0,
                        msg: (containerName + ".conf 文件创建成功")
                    })
                });
            })
            return result
        }
        return null
    }

    this.del = function (ctx) {
        var containerName = ctx.request.body.containerName
        let fPath = join(abPath, containerName + '.conf');
        var start = async = async function () {
            var result = await new Promise(function (resolve, reject) {
                fs.exists(fPath, function (exists) {
                    if (exists) {
                        fs.unlink(fPath, function () {
                            console.log(fPath + '删除成功')
                        });
                        resolve({
                            code: 0,
                            msg: (containerName + '.conf') + ' 文件删除成功'
                        })
                    } else {
                        resolve({
                            code: 1,
                            msg: (containerName + '.conf') + ' 文件不存在 '
                        })
                    }
                })
            })
            ctx.body = result
        }

        return start()

    }

    this.list = async function (ctx) {
        var _files = []
        var cotainerName = ctx.request.query.filterName
        console.log(cotainerName)
        var aa = async function () {
            let files = fs.readdirSync(abPath);
            files.forEach((val, index) => {
                let fPath = join(abPath, val);
                if (val.lastIndexOf('.conf') != -1) {
                    if (cotainerName != undefined) {
                        if (val.indexOf(cotainerName) != -1) {
                            _files.push(val)
                        }
                    } else {
                        _files.push(val)
                    }
                }
            });
        }
        ctx.body = {
            code: 0,
            msg: 'nginx域名文件列表',
            data: _files
        }
        return aa()
    }

    return this
}