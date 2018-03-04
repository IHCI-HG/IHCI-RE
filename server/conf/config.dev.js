var apiPrefix = {
    baseApi: 'http://inner.dev1.qlchat.com', //开发环境ip 统一使用这个别改
    appApi: 'http://app.dev1.qlchat.com',
    weiboApi: 'http://inner.dev1.qlchat.com',//开发环境ip 统一使用这个别改
    wechatApi: 'http://inner.dev1.qlchat.com',//开发环境ip 统一使用这个别改
    adminApi: 'http://inner.dev1.qlchat.com',
    activityApi: 'http://inner.activity.dev2.qlchat.com',
    incrFansApi: 'http://inner.dev1.qlchat.com',
};


var secretMap = {
    baseApi: '846d2cb0c7f09c3ae802c42169a6302b',
    appApi: '846d2cb0c7f09c3ae802c42169a6302b',
    weiboApi: '846d2cb0c7f09c3ae802c42169a6302b',
    wechatApi: '846d2cb0c7f09c3ae802c42169a6302b',
    adminApi: '846d2cb0c7f09c3ae802c42169a6302b',
    activityApi: '846d2cb0c7f09c3ae802c42169a6302b',
    incrFansApi: '846d2cb0c7f09c3ae802c42169a6302b',
};


var config = {
    'debug': false,

    'requestTimeout': 300000,
    'serverPort': 5000,
    'clusterCount': 0,

    'ignoreRedis': true,
    'redisConf': {
        'port': 6379,
        'host': '127.0.0.1',
        'no_ready_check': true,
        // 'password': 'WdPTMj6X',
    },
    'redisExpire': 60 * 60 * 24,
    db: 'mongodb://127.0.0.1:27017/test',

    'lruMaxAge': 36000,
    'lruMax': 500,

    // 用于本地存储日志
    'logs': '/data/logs/h5_dev',

    'upload': {
        'maxSize': 5242880,
        'maxPatientCount': 50,
    },

    'client_params_keys': ['caller', 'os', 'ver', 'platform', 'userId', 'sid'],

    // 微信开放平台appid
    'wxOpenAppId': 'wxc2b795ed9de3592a',

    // 微博开放平台应用id
    'weiboClientId': '3939804953',

    // 各种域名下的公众号的appId配置
    authAppIds: {
        'qz.qianliao.net': {
            qrCodeAppId: '',
            authAppId: 'wx535cf728d49618cf',
        },
        'qz.zf.qianliao.net': {
            authAppId: 'wx535cf728d49618cf',
        },
        'qztest.qianliao.net': {
            authAppId: 'wx535cf728d49618cf',
        }
    },
    
    // 日志采集sdk及api前缀配置
    'collectjs': 'http://collect.dev1.qlchat.com/js/c.click.event.pv.error.visible.query.onlog.onpv.onvisible.js',
    'spaCollectjs': 'http://collect.dev1.qlchat.com/js/c.click.event.pv.error.visible.query.onlog.js?9',
    'collectApiPrefix': 'http://collect.dev1.qlchat.com',
    'websocketUrl': 'ws://h5ws.dev1.qlchat.com'
};

module.exports = config;
module.exports.apiPrefix = apiPrefix;
module.exports.secretMap = secretMap;
