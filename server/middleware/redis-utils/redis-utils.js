const server = require('../../server')
const redisCluster = server.getRedisCluster();

export const redisPromiseGet = (key) => {
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