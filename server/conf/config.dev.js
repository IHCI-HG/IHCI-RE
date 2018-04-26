var apiPrefix = {

};


var secretMap = {

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
    db: 'mongodb://127.0.0.1:27017/ihci',

    'lruMaxAge': 36000,
    'lruMax': 500,

    // 用于本地存储日志
    'logs': '/logs/dev.log',

    'upload': {
        'maxSize': 5242880,
        'maxPatientCount': 50,
    },

    'client_params_keys': ['caller', 'os', 'ver', 'platform', 'userId', 'sid'],

};

module.exports = config;
module.exports.apiPrefix = apiPrefix;
module.exports.secretMap = secretMap;
