const server = require('../../server')
const redisCluster = server.getRedisCluster();

/**
 * 解码base64格式字符串为对象
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
const decode = function(string) {
    var body = new Buffer(string, 'base64').toString('utf8');
    return JSON.parse(body);
}

/**
 * 将对象转化成base64编码的json字符串
 * @param  {[type]} obj [description]
 * @return {[type]}      [description]   
 */
const encode = function(obj) {
    var str = JSON.stringify(obj);
    return new Buffer(str).toString('base64');
}

/**
 * 生成唯一的标识串
 * @return {[type]} [description]
 */
const generateId = function() {
    return 'qlwrsid:' + uuid.create();
}

/**
 * 获取redis中的对象
 * 
 * @param {any} key 
 * @returns 
 */
const redisPromiseGet = (key) => {
    return new Promise((resolve, reject) => {
        redisCluster.get(key, (err, value) => {
            console.log('redis-get: ' + key + ' | value: ' + value);
            if(err) {
                reject(err)
            }
            resolve(value);
        })
    })
}

// expire 过期时间 EX 单位为秒
export const redisPromiseSet = (key, value, expire) => {
    if(expire) {
        return new Promise((resolve, reject) => {
            redisCluster.set(key, value, 'EX', expire, (err, value) => {
                console.log('redis-set-key: ' + key + ' | redis-set-state: ' + value + ' | expire: ' + expire + 'sec');
                if(err) {
                    reject(err)
                }
                resolve(value);
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            redisCluster.set(key, value,(err, value) => {
                console.log('redis-set-key: ' + key + ' | redis-set-result: ' + value);
                if(err) {
                    reject(err)
                }
                resolve(value);
            })
        })
    }
}

module.exports.decode = decode
module.exports.encode = encode
module.exports.generateId = generateId