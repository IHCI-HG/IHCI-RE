const server = require('../../server')
const redisCluster = server.getRedisCluster();

/* 每隔3秒更新emergencyTag值 */
setInterval(() => {
    redisCluster.get('ACTIVITY_VALID', (err, data) => {
        if(err){
            console.error('----获取值ACTIVITY_VALID失败');
        } else {
            global.emergencyTag = data
        }
    })
}, 3000);

export default () => {

    return (req, res, next) => {

        if (global.emergencyTag === 'Y') {
            res.render('404');
        } else {
            next()
        }
    }
}
