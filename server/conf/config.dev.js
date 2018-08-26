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

    'webAppId': 'wx50a231aefaff3222',
    'webAppSe': '4aa16e1583e8525a4d4bb47b37928467',

    'pubAppId': 'wx87136e7c8133efe3',
    'pubAppSe': '195592b5e345046e61b5efc33d4cb42d',

    'ossConf': {
        'ossAdminAccessKeyId': 'LTAIkrgpPKLOb6CJ',
        'ossAdminAccessKeySecret': 'STTW2qHnI6NLNuUJAjmom6rDSO2ksr',

        'accessKeyId': 'LTAI50JBylPO2aRe',
        'accessKeySecret': 'dCXkMpinyC853SACdOqu2LyM2PI3Cv',
        'roleArn': 'acs:ram::1656281103392398:role/aliyunosstokengeneratorrole',
        'region': 'oss-cn-shenzhen',
        'bucket': 'arluber',
    },

    


    // mail: 'http://localhost:5000',
    mailOrigin: 'http://localhost:5000',
    mail: {
        host: 'smtp.163.com', 
        port: 25,
        auth: {
            user: 'ihci2018@163.com', //注册的邮箱账号
            pass: 'ihci2018'  //邮箱的授权码，不是注册时的密码
        }
    },

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
