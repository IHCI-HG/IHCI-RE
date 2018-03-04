
/**
 * 获取post text/plain数据，并以req.rawBody存储
 * 注： 该中间件需在body-parser前调用
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-03-29T10:43:47+0800
 * @param    {[type]}                           options [description]
 * @return   {[type]}                                   [description]
 */
module.exports = function (options) {
    // var opts = options || {};

    return function (req, res, next) {
        if (!req.rawBody) {
            req.rawBody = '';
        }

        req.on('data', function(chunk) {
            req.rawBody += chunk.toString();
        });
        req.on('end', function() {
            next();
        });
    };
};