
/**
 * 所有的文件资源请求走这个路由去请求阿里云oss对象存储并返回结果
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
var OSSW = require('ali-oss').Wrapper;
var conf = require('../conf')

var ossFileProcessor = async (req, res, next) => {
    try {
        var originalUrl = req.originalUrl
        var ossKey = decodeURIComponent(originalUrl.slice(8))
        const client = new OSSW({
            accessKeyId: conf.ossConf.ossAdminAccessKeyId,
            accessKeySecret: conf.ossConf.ossAdminAccessKeySecret,
            bucket: conf.ossConf.bucket,
            region: conf.ossConf.region
        });
        var result = await client.get(ossKey);
        res.send(result.res.data)
    } catch (error) {
        res.send(404)
    }
}

module.exports = [
    [0, 'all', /\/static\//, ossFileProcessor],
];
