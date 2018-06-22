var crypto = require('crypto');

/**
 * 是否微信打开
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-28T15:47:11+0800
 * @param    {[type]}                           req [description]
 * @return   {Boolean}                              [description]
 */
function isWeixin(req) {
    var ua = (req.headers['user-agent'] || '').toLowerCase();

    return /MicroMessenger/i.test(ua);
}

/**
 * 是否微博中打开
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-28T15:49:29+0800
 * @param    {[type]}                           req [description]
 * @return   {Boolean}                              [description]
 */
function isWeibo(req) {
    var ua = (req.headers['user-agent'] || '').toLowerCase();

    return /WeiBo/i.test(ua);
}

/**
 * 是否qq中打开
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-28T15:49:45+0800
 * @param    {[type]}                           req [description]
 * @return   {Boolean}                              [description]
 */
function isQQ(req) {
    var ua = (req.headers['user-agent'] || '').toLowerCase();

    return /QQ/i.test(ua);
}



/**
 * 是否pc浏览器
 * @param  {[type]}  req [description]
 * @return {Boolean}     [description]
 */
function isPc(req) {
    var ua = req.headers['user-agent'] || '';

    // 拿不到ua时，默认为非pc环境
    if (!ua) {
        return false;
    }

    return !/(Mobile|iPhone|Android|iPod|ios|iPad|Tablet|Windows Phone)/i.test(ua);
}

module.exports.isWeixin = isWeixin;
module.exports.isWeibo = isWeibo;
module.exports.isQQ = isQQ;
module.exports.isPc = isPc;
