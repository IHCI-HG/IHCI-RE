var apiPrefix = {
    baseApi: 'http://inner.dev1.qlchat.com',
    appApi: 'http://dev.app.qlchat.com',
    weiboApi: 'http://inner.dev1.qlchat.com',
    wechatApi: 'http://inner.dev1.qlchat.com',
    adminApi: 'http://inner.dev1.qlchat.com',
    activityApi: 'http://inner.activity.dev1.qlchat.com',
    incrFansApi: '',
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

    resTime: 0,

    // 请求超时配置
    'requestTimeout': 10000,

    // 默认服务端口
    'serverPort': 5000,

    // 实例开启个数（在开启cluster模式下有效）
    'clusterCount': 8,

    // redis
    'redisConf': {
        'port': 6379,
        'host': '127.0.0.1',
        'no_ready_check': true,
        // 'password': 'WdPTMj6X',
    },
    'redisExpire': 60 * 60 * 24,
    db: 'mongodb://127.0.0.1:27017/test',

    'lruMaxAge': 3600000,
    'lruMax': 500,

    // 用于本地存储日志
    'logs': '/data/logs/h5',

    // 文件上传配置
    'upload': {
        'maxSize': 5242880,
        'maxPatientCount': 50,
    },

    // 客户端公参接收配置
    'client_params_keys': ['caller', 'os', 'ver', 'platform', 'userId', 'sid'],

    // 微信开放平台appid
    wxOpenAppId: '',

    // 微博开放平台应用id
    weiboClientId: '',
    
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
    collectjs: '',
    'spaCollectjs': 'https://collect.logs.qianliao.cn/js/c.click.event.pv.error.visible.query.onlog.js?9',
    'collectApiPrefix': 'https://collect.logs.qianliao.cn',
    'websocketUrl': ''
};

module.exports = config;
module.exports.apiPrefix = apiPrefix;
module.exports.secretMap = secretMap;
