var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    Multer = require('multer'),
    // session = require('session'),
    cookieParser = require('cookie-parser'),
    xmlparser = require('express-xml-bodyparser'),
    redis = require('redis'),
    lo = require('lodash'),

    conf = require('./conf'),

    api = require('./middleware/api/api'),
    dangerDetect = require('./middleware/danger-detect/danger-detect'),
    // requestFilter = require('./middleware/request-filter/request-filter'),
    redis3xSession = require('./middleware/redis3x-session/redis3x-session'),
    flash = require('./middleware/flash/flash'),
    router = require('./middleware/router/router'),
    staticc = require('./middleware/static/static'),
    notFound = require('./middleware/not-found/not-found'),
    error = require('./middleware/error/error'),
    // Webpack_isomorphic_tools = require('webpack-isomorphic-tools'),

    routesPath = path.resolve(__dirname, './routes'),

    exphbs = require('express-handlebars'),

    app = express();

var db = require('./db');

var accessLogStream = fs.createWriteStream(path.join('/data/logs', 'access.log'), {flags: 'a'})

function getRedisClusterObj() {
    var redisOption = _.extend({
        retry_strategy: function (options) {
            console.log('.....redis options: ', options);
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error
                return new Error('The redis server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                return new Error('Redis retry time exhausted');
            }
            // reconnect after
            return Math.max(options.attempt * 100, 3000);
        },
    }, conf.redisConf),
    
    redisCluster = redis.createClient(redisOption);

    // 监听redis事件
    _.each(['connect', 'ready', 'reconnecting', 'end', 'close', 'error'], function (e) {
        redisCluster.on(e, function (evt) {
            console.log('redis status: ' + e);
            if ('error' === e) {
                console.error(evt);
            }

            if ('ready' === e && typeof process.send != 'undefined') {
                console.log('cluster is ready');
                process.send('ready');
            }
        });
    });
    return redisCluster;
}

/**
 * 初始化服务（启用中间件）
 * @return {[type]} [description]
 */
function init() {
    var name = conf.name,
        version = conf.version,
        mode = conf.mode,
        root = conf.serverRoot,
        port = conf.serverPort;

    // 配置常用变量
    app.set('name', name);
    app.set('version', version);
    app.set('mode', mode);

    app.enable('trust proxy');

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        defaultLayout: 'main',
    }));
    app.set('view engine', 'handlebars');

    // for parsing application/json
    app.use(bodyParser.json({
        limit: '10mb',
    }));

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb',
    }));

    app.use(xmlparser());

    // for parsing multipart/form-data file upload
    app.use(new Multer().single('file'));

    // 日志打印

    /**
     * current date
     */

    logger.token('date', function getDateToken(req, res, format) {
        var date = new Date();

        switch (format || 'web') {
            case 'clf':
                return clfdate(date);
            case 'iso':
                return date.toISOString();
            case 'web':
                return date.toUTCString();
            case 'default':
                return date.toString();
        }
    });

    /**
     * 日志添加打印用户id
     * @param  {[type]} 'userId' [description]
     * @param  {[type]} function getUserIdToken(req, res [description]
     * @return {[type]}          [description]
     */
    logger.token('userId', function getUserIdToken(req, res) {
        return lo.get(req, 'cookies.userId') || lo.get(req, 'rSession.user.userId') || '';
    });

    // app.use(logger(':remote-addr - [:userId] - :remote-user [:date[default]] ":method :url HTTP/:http-version" ":referrer" ":user-agent" :status :res[content-length] - :response-time ms', {stream: accessLogStream}));
    app.use(logger(':remote-addr - [:userId] - :remote-user [:date[default]] ":method :url HTTP/:http-version" ":referrer" ":user-agent" :status :res[content-length] - :response-time ms', {stream: accessLogStream}));
    

    // 危险检测
    app.use(dangerDetect());

    // 使用带签名的cookie，提高安全性
    app.use(cookieParser('$asdfeozsDLMNZXOPsf...zoweqhzil'));

    // 启动mongodb服务
    db.init();

    // 启用静态文件
    app.use(staticc());

    // 请求过滤器，识别请求类型存放于req.srcType中
    // app.use(requestFilter());

    // 生成redis连接实例
    app.redisCluster = getRedisClusterObj();

    // redis session缓存服务开启
    app.use(redis3xSession({
        redisCluster: app.redisCluster,
        expires: conf.redisExpire,
    }));

    // flash 临时消息存储服务开启
    app.use(flash());

    // 启用API
    app.use(api());

    // 启用路由
    app.use(router(routesPath));

    // 页面不存在
    app.use(notFound());

    // 启用出错打印中间件
    app.use(error());

    // 配置监听端口
    var serverOptions = [
        port,
    ];

    // 配置监听host
    if (conf.host) {
        serverOptions.push(conf.host);
    }

    // 监听回调
    serverOptions.push(function () {
        console.log('[mode:', mode, '] listening on port ', port);
        process.on('SIGINT', function () {
            process.kill(process.pid);
        });
    });

    return app.listen(...serverOptions);
}

exports.app = app;
exports.init = init;
// exports.init = function () {
//     var context = require('../site/brand/webpack.config').context;
//     console.log(context);
//     // 配置webpack 前后端同构的tool
//     global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(require('../site/brand/webpack_isomorphic_tools_config'))
//         .server(context, init);
// };

module.exports.getRedisCluster = function () {
    if (!app.redisCluster) {
        app.redisCluster = getRedisClusterObj();
    }
    return app.redisCluster;
};
