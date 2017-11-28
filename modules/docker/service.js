const Promise = require('bluebird')
const cmd = require('node-cmd')
const portService = require('../port/service')()
const nginxService = require('../nginx/service')()
const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})
const isTest = false

module.exports = function () {
	this.filter = function (ctx) {
        var name = ctx.params.name
        var ec1 = 'clush -g issp "docker ps --filter name=' + name + '" | grep -v "CONTAINER ID"'

        return getAsync(ec1).then((data, err) => {
            if (err) {
                ctx.body = {
                    code: 1,
                    msg: "not filter.",
                    data: err
                }
            } else {
                ctx.body = {
                    code: 0,
                    msg: "filter",
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

    this.exist = function (ctx) {
        var name = ctx.params.name
        var host = ctx.request.body.host
        var ec = 'ssh server1 \"ssh ' + host + ' \"docker ps -a --format "{{.Names}}" | grep "^' + name + '$" ; echo $?\""'
        var ec1 = 'ssh ' + host + ' \"docker ps -a --format "{{.Names}}" | grep "^' + name + '$" ; echo $?"'
        return getAsync(isTest?ec:ec1).then((data, err) => {
                if (err) {
                    ctx.body = {
                        code: 1,
                        msg: "not exist.",
                        data: err
                    }
                } else {
                    if (data[0].split('\n').length == 3) {
                        ctx.body = {
                            code: 0,
                            msg: "exist",
                            data: true
                        }
                    } else {
                        ctx.body = {
                            code: 0,
                            msg: "not exist",
                            data: false
                        }
                    }

                }
            }
        ).catch(err => {
            console.log('cmd err', err)
            ctx.body = {
                code: 1,
                msg: err
            }
        })
    }

    this.ps = function (ctx) {

        return getAsync('docker ps -a --format "{{.ID}} ==== {{.Image}} ==== {{.Command}} ==== {{.RunningFor}} ==== {{.Status}} ==== {{.Ports}} ==== {{.Mounts}} ==== {{.Names}} ==== {{.Size}}"').then((data, err) => {
                if (err) {
                    ctx.body = {
                        code: 1,
                        msg: err
                    }
                } else {
                    let newPorts = []
                    var isBegin = false, isEnd = false
                    var datas = data[0].split('\n')
                    datas.forEach(function (port) {
                            var spl = port.split(' ==== ')
                            newPorts.push({
                                id: spl[0],
                                images: spl[1],
                                command: spl[2],
                                created: spl[3],
                                status: spl[4],
                                ports: spl[5],
                                mounts: spl[6],
                                names: spl[7],
                                size: spl[8]
                            })
                        }
                    )
                    ctx.body = {
                        code: 0,
                        msg: 'docker执行ps命令',
                        data: newPorts
                    }
                }
            }
        ).catch(err => {
            console.log('cmd err', err)
            ctx.body = {
                code: 1,
                msg: err
            }
        })
    }

    this.create = async function (ctx) {
        var formData = ctx.request.body
        var projectPortBody = {}
        var portIsUse = async function () {
            projectPortBody = await portService.check(formData.host,formData.projectPort)
            // webhookPortBody = await portService.check(formData.host,formData.webhookPort)
            if (projectPortBody.code == 0 && projectPortBody.data) {
                ctx.body = {code: 0, msg: ('projectPort:' + formData.projectPort + '端口已经被使用')}
            }else {
                var sheels = [
                    'docker run -dti',
                ]

                formData.environments.forEach(function (env) {
                    sheels.push(' -e ' + env.name + '=' + env.value)
                })

                var projectPshellPre = '',projectPshellPos = ''
                if(formData.containerName.split('-')[1]=='node'){
                    projectPshellPre = 'PORT='+formData.projectPort
                }else if(formData.containerName.split('-')[1]=='consumer'){
                    projectPshellPre = ''
                    projectPshellPos = '--server.port='+formData.projectPort
                }else if(formData.containerName.split('-')[1]=='provider'){
                    projectPshellPre = '-Ddubbo.protocol.port='+formData.projectPort
                    projectPshellPos = ''
                }

                sheels.push(' -e projectPshellPre=' + projectPshellPre)
                sheels.push(' -e projectPshellPos=' + projectPshellPos)
                sheels.push(' -e jvm_Xms=' + formData.jvm_Xms||200)
                sheels.push(' -e jvm_Xmx=' + formData.jvm_Xmx||200)
                // sheels.push(' -e webhookPort=PORT=' + formData.webhookPort)
                if(formData.jvm_jmx_remote == 'true'){//开启远程调优
                    sheels.push(' -e jvm_jmx_remote=true')
                    if(!formData.jvm_jmx_port){
                        ctx.body = {code: 0, msg: ('jvm_jmx_port 必填')}
                        return;
                    }
                    sheels.push(' -e jvm_jmx_port=' + formData.jvm_jmx_port)
                    if(!formData.jvm_jmx_hostname){
                        ctx.body = {code: 0, msg: ('jvm_jmx_hostname 必填')}
                        return;
                    }
                    sheels.push(' -e jvm_jmx_hostname=' + formData.jvm_jmx_hostname)
                    if(!formData.jvm_jmx_username){
                        ctx.body = {code: 0, msg: ('jvm_jmx_username 必填')}
                        return;
                    }
                    sheels.push(' -e jvm_jmx_username=' + formData.jvm_jmx_username)
                    if(!formData.jvm_jmx_password){
                        ctx.body = {code: 0, msg: ('jvm_jmx_password 必填')}
                        return;
                    }
                    sheels.push(' -e jvm_jmx_password=' + formData.jvm_jmx_password)
                    if(formData.jvm_jmx_role_readonly===undefined){
                        ctx.body = {code: 0, msg: ('jvm_jmx_role_readonly 必填')}
                        return;
                    }
                    if(formData.jvm_jmx_role_readonly=='true'){
                        sheels.push(' -e jvm_jmx_role=readonly')
                    }else{
                        sheels.push(' -e jvm_jmx_role=readwrite')
                    }
                    
                }
                formData.volumes.forEach(function (vol) {
                    sheels.push(' -v ' + vol.host + ':' + vol.container + ':' + (vol.readonly ? '' : 'rw'))
                })
                sheels.push(' --network ' + formData.network)
                sheels.push(' --hostname ' + formData.host)
                sheels.push(' --name ' + formData.containerName)
                sheels.push(' --restart=' + formData.restart)
                sheels.push(' ' + formData.images)
                sheels.push(' ' + formData.command)
                var cmdExist = async function () {
                    var bd = {}
                    var ec = 'ssh server1 "ssh '+formData.host+' \"' + 'docker ps -a --format "{{.Names}}" | grep "^' + formData.containerName + '$" ; echo $?' + '\""'
                    var ec1 = 'ssh '+formData.host+' \"' + 'docker ps -a --format "{{.Names}}" | grep "^' + formData.containerName + '$" ; echo $?' + '"'
                    await getAsync(isTest?ec:ec1).then((data, err) => {
                        if (err) {
                            bd = {
                                code: 1,
                                msg: "not exist.",
                                data: false
                            }
                        } else {
                            if (data[0].split('\n').length == 3) {
                                bd = {
                                    code: 0,
                                    msg: "exist",
                                    data: true
                                }
                            } else {
                                bd = {
                                    code: 0,
                                    msg: "not exist",
                                    data: false
                                }
                            }
                        }
                    }).catch(err => {
                        bd = {
                            code: 1,
                            msg: err
                        }
                    });

                    if (bd.code == 0 && !bd.data) {

                        var dockerCreate = async function () {
                            var cmdData = {}
                            var eca = 'ssh server1 "ssh '+formData.host+' \"' + sheels.join('') + '\""'
                            var eca1 = 'ssh '+formData.host+' \"' + sheels.join('') + '"'
                            await getAsync(isTest?eca:eca1).then((data, err) => {
                                    if (err) {
                                        cmdData = {
                                            code: 1,
                                            msg: err
                                        }
                                    } else {
                                        cmdData = {
                                            code: 0,
                                            msg: data[0] == '' ? (data.containerName + '容器已经存在') : 'docker执行ps命令',
                                            data: data[0]
                                        }
                                    }

                                }
                            ).catch(err => {
                                cmdData = {
                                    code: 1,
                                    msg: err
                                }
                            })
                            var _domain = ctx.request.body.domain;
                            var _host = ctx.request.body.host;
                            var _projectPort = ctx.request.body.projectPort;
                            var _containerName = ctx.request.body.containerName;
                            let result = await nginxService.create1(_domain, _host, _projectPort, _containerName)
                            cmdData.nginx = result
                            ctx.body = cmdData
                        };
                        return dockerCreate()
                    } else {
                        ctx.body = {
                            code: 1,
                            msg: formData.containerName + '容器已经存在'
                        }
                    }
                }

                return cmdExist()
            }
        }

        return portIsUse()
    }

    this.del = function (ctx) {
        var name = ctx.params.name
        var host = ctx.request.body.host
        var cmdDel = async function () {
            var bd = {}
            var ec = 'ssh server1 "ssh '+host+' \"' + ' docker rm ' + name + '\""'
            var ec1 = 'ssh '+host+' \"' + ' docker rm ' + name + '"'
            await getAsync(isTest?ec:ec1).then((data, err) => {
                if (err) {
                    bd = {
                        code: 1,
                        msg: "not del.",
                        data: err
                    }
                } else {
                    console.log(data[0])
                    if (data[0].split('\n').length == 3) {
                        bd = {
                            code: 0,
                            msg: "del",
                            data: true
                        }
                    } else {
                        bd = {
                            code: 0,
                            msg: "not del",
                            data: false
                        }
                    }
                }
            }).catch(err => {
                bd = {
                    code: 1,
                    msg: err
                }
            });
            ctx.body = bd
        }

        return cmdDel()
    }

    this.stop = function (ctx) {
        var name = ctx.params.name
        var host = ctx.request.body.host
        var cmdDel = async function () {
            var bd = {}
            var ec = 'ssh server1 "ssh '+host+' \"' + ' docker stop ' + name + '\""'
            var ec1 = 'ssh '+host+' \"' + ' docker stop ' + name + '"'
            await getAsync(isTest?ec:ec1).then((data, err) => {
                if (err) {
                    bd = {
                        code: 1,
                        msg: "not stop.",
                        data: err
                    }
                } else {
                    if (data[0].split('\n').length == 3) {
                        bd = {
                            code: 0,
                            msg: "stop",
                            data: true
                        }
                    } else {
                        bd = {
                            code: 0,
                            msg: "not stop",
                            data: false
                        }
                    }
                }
            }).catch(err => {
                bd = {
                    code: 1,
                    msg: err
                }
            });
            ctx.body = bd
        }

        return cmdDel()
    }

    return this
}
