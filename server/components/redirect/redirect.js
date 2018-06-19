var querystring = require('../querystring/querystring'),

    conf = require('../../conf');

/**
 * 302 重定向 将用户访问302重定向到新的页面中去
 * @param  {Object} req [description]
 * @param  {Object} res [description]
 * @param  {String} url 重定向目标地址
 * @return {null}
 */
function by302(req, res, url) {
    var newUrl = makeRedirectUrl(req, res, url);
    // 重定向到处理后的地址
    res.redirect(newUrl);
}

// 
// 所以
/**
 * 利用页面的meta 或者 location.href 进行重定向
 * 直接 302 重定向 各版本的客户端都可能存在兼容性的问题
 * @param  {Object} req [description]
 * @param  {Object} res [description]
 * @param  {String} url [description]
 * @return {null}
 */
function byPage(req, res, url) {
    var newUrl = makeRedirectUrl(req, res, url);
    // 返回重定向页面
    res.status(200).send('<html><head><title>页面跳转</title><noscript><meta http-equiv="refresh" content="0; url=' + newUrl + '"></noscript><script>window.location.href = "' + newUrl + '";</script></head><body>正在为您跳转到 ...</body></html>');
}

/**
 * 重新整理重定向链接
 * @param  {Object} req [description]
 * @param  {Object} res [description]
 * @param  {String} url 重定向目标地址
 * @return {String}   拼接参数后的跳转地址
 */
function makeRedirectUrl(req, res, url) {
    var query = req.query,
        withouts = [],
        queryString = '?',
        hashIndex = url.indexOf('#'),
        urlpath = hashIndex > -1 ? url.substring(0, hashIndex) : url,
        queryIndex = urlpath.indexOf('?');

    // 查找参数在新地址中是否已存在，存在则从原地址中转移到新地址
    for (var name in query) {
        if (url.indexOf(name + '=') > 0) {
            withouts.push(name);
        }
    }

    // 拼接 URL 参数
    queryString += querystring.query2string(query, {
        // Todo  此处添加必要参数
    }, withouts);

    // 已经有参数，插入原参数位置
    if (queryIndex > 0) {
        // 如果已有参数则需要在替换字符串最后加上 &
        // /detail/?id=1
        // /detail/?id=1#123
        if (queryIndex < url.length - 1 &&
            (hashIndex < 0 || hashIndex - queryIndex > 1)) {
            queryString += '&';
        }
        url = url.replace('?', queryString);

    // 还没有参数，自己找合适的位置
    } else {
        // 有 # ，将参数放在 # 前
        if (hashIndex > 0) {
            var arr = url.split('#');
            arr.splice(1, 0, queryString, '#');
            url = arr.join('');
        // 无 # ，直接将参数拼接在最后
        } else {
            url += queryString;
        }
    }
    return url;
}

exports.by302 = by302;
exports.byPage = byPage;
exports.makeRedirectUrl = makeRedirectUrl;