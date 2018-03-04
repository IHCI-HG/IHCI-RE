var apiPrefix = {

};

var secretMap = {

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
};

module.exports = config;
module.exports.apiPrefix = apiPrefix;
module.exports.secretMap = secretMap;
