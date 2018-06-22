require('babel-polyfill');

var fs = require('fs'),                 //test一下
    path = require('path'),
    cluster = require('cluster'),        //test两下
    os = require('os'),
    express = require('express'),
    commander = require('commander'),      //zcc test

    server = require('./server'),//ceshwedwedwedwe
    conf = require('./conf'),

    numCPUs = os.cpus().length,
    maxClusterCount = numCPUs,
    clusterCount = 1,

    app = server.app,//dqwdqwdqwdqwd

    // 模式定义
    DEV = 'development',
    PROD = 'production',

    modes = {
        development: ['development', 'dev', 'DEV'],
        prod: ['production', 'prod', 'PROD']
    },

    worker,
    address,
    host,
    port,
    pidFile,
    mode;

/**
 * 识别服务运行模式
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
function detectMode(m) {
    if (!m) {
        return;
    }

    var _m = m.toLowerCase();
    for (var key in modes) {
        if (modes[key].indexOf(m) > -1) {
            return key;
        }
    }
    return DEV;
}

/**
 * 获取cluster数量，根据配置及CPU个数取值
 * @return {[type]} [description]
 */
function getClusterCount () {
    var clusterCount = Number(conf.clusterCount) || 1;

    // 超过 CPU 核心数设置为和 CPU 核心数相同
    if (clusterCount > maxClusterCount) {
        console.log('clusterCount ', clusterCount, ' is larger than maxClusterCount ', maxClusterCount);
        clusterCount = maxClusterCount;
        console.log('set clusterCount to ', clusterCount);
    }

    return clusterCount;

}

/**
 * 开启cluster模式服务
 * @return {[type]} [description]
 */
function clusterStart() {
    console.log('...... starting server ......');

    // 读取进程个数配置
    clusterCount = getClusterCount();

    // 创建主worker
    if (clusterCount <= 1) {
        // 创建新的服务器
        worker = server.init();

    } else {
        if (cluster.isMaster) {
            // 创建服务器实例
            for (var i = 0; i < clusterCount; i++) {
                cluster.fork();
            }

            // 进程异常退出处理
            cluster.on('exit', function(worker, code, signal) {
                console.log('worker ' + worker.process.pid + ' died');
                console.log('code ', code);
                console.log('signal', signal);
                // 尝试新起一个进程
                var newCluster = cluster.fork();
                console.log('new cluster pid ', newCluster.process.pid);
            });
        } else {
            // Workers can share any TCP connection
            // In this case its a HTTP server
            // 创建新的服务器
            worker = server.init();
        }
    }

    // 获取地址
    if (worker) {
        address = worker.address();
    }

    console.log('   CPU Count', numCPUs);
    console.log('   Cluster Count', clusterCount);
    console.log('   Server Mode', mode);
    console.log('   Listening on', port);
    console.log('   pid', process.pid);

    // 如果是非开发模式，需要捕获未捕获异常
    if (mode !== DEV) {
        process.on('uncaughtException', function (e) {
            console.log('Caught exception:', e.stack);
        });
    }

    if (pidFile) {
        fs.writeFileSync(pidFile, process.pid);
        process.on('SIGINT', function () {
            if (fs.existsSync(pidFile)) {
                fs.unlinkSync(pidFile);
            }
            process.kill(process.pid);
        });
    }
}

// 主函数入口
if (require.main === module) {
    // 配置命令行参数
    commander
        .option('-p, --port <number>', 'server port')
        .option('-h, --host <ip>', 'ipv4 address')
        .option('-P, --pidfile <path>', 'path of pidfile')
        .option('-m, --mode <dev|test|prod>', 'server mode')
        .option('-c, --cpath <path>', 'path of config')
        .option('-l, --localUserId <userId>', 'userId of local development')
        .parse(process.argv);

    console.log('start date : ',(new Date()).toString());
    console.log('...... detecting environment ......');
    console.log('   commander.host', commander.host);
    console.log('   commander.port', commander.port);
    console.log('   commander.pidfile', commander.pidfile);
    console.log('   commander.mode', commander.mode);
    console.log('   process.env.PORT', process.env.PORT);
    console.log('   commander.cpath', commander.cpath);
    console.log('   commander.localUserId', commander.localUserId);
    console.log('...... configuring ......');

    // 从命令行参数中读取，如果没有就默认设置为开发环境
    if (commander.mode) {
        mode = detectMode(commander.mode);
    }
    // 尝试读取 UAE 环境变量
    if (!mode && process.env.UAE_MODE) {
        mode = detectMode(process.env.UAE_MODE);
    }
    // 默认为开发模式
    if (!mode) {
        mode = DEV;
    }
    console.log('   server mode', mode);

    // 初始化配置文件
    conf.init({
        mode: mode,
        cpath: commander.cpath,
    });

    // 端口取用优先级
    // 从启动参数中获取
    if (commander.port) {
        try {
            port = Number(commander.port);
        } catch(e) {
            // logger.warn('commander.port parse error', e);
        }
    }

    // 指定运行ip地址
    if (commander.host) {
        if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(commander.host)) {
            host = commander.host.trim();
        }
    }

    // 从环境变量中获取
    if (!port && process.env.PORT) {
        try {
            port = Number(process.env.PORT);
        } catch(e) {
            // logger.warn('process.env.PORT parse error', e);
        }
    }
    // 从配置文件获取
    if (!port && conf.serverPort) {
        port = conf.serverPort;
    }
    // 默认 5000
    if (!port) {
        port = 5000;
    }
    console.log('   server port', port);

    // pidFile
    pidFile = commander.pidfile;

    // 将参数放到配置中
    conf.update({
        mode: mode,
        host: host,
        serverPort: port,
        localUserId: commander.localUserId,
    });

    // 编译jsx语法
    if (conf.mode != 'prod') {
        require('babel-register')({
            // only: ['brand/**', 'wechat-react/**', 'wechat/**', 'test/**', 'middleware/**'],
            // ignore: function (filename) {
            //     console.log(filename);
            // },
            extensions: ['.js']
        });
    }

    // cluster模式多实例启动服务器
    // clusterStart();

    // 普通方式启动服务器
    server.init();
}
