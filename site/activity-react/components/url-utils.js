/**
 * 获取query参数
 * @param  {string} name 需要获取的参数key值
 * @return {[type]}      [description]
 */
var getUrlParams = function(name, search) {
    var search = (search || window.location.search).match(/\?.*(?=\b|#)/);

    search && (search = search[0].replace(/^\?/, ''));
    if (!search) return name ? '' : {};
    var queries = {},
        params = search.split('&');

    for (var i in params) {
        var param = params[i].split('=');
        queries[param[0]] = param[1] ? decodeURIComponent(param[1]) : '';
    }

    return name ? queries[name] : queries;
};

/**
 * 给url注入参数，注入的参数会覆盖旧参数
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-06-25T09:37:04+0800
 * @param    {Object}                           params  要注入的参数
 * @param    {String}                           url     要注入参数的url, 为空时取当前页面url
 * @param    {Array}                           withouts url中需要排除的参数key数组
 * 例：
 * fillParams({a: 1, b: 2, c: 3}, 'http://a.b.c.d?aa=1&bb=2&cc=3&b=4#a=0&b=6', ['aa', 'a', 'b', 'c', 'bb', 'cc'])
 *   =》"http://a.b.c.d#a=0&b=6"
 *
 * fillParams({a: 1, b: 2, c: 3}, 'http://a.b.c.d?aa=1&bb=2&cc=3&b=4#a=0&b=6', ['aa', 'a', 'b', 'c', 'bb'])
 *   =》"http://a.b.c.d?cc=3#a=0&b=6"
 *
 *  fillParams({a: 1, b: 2, c: 3}, 'http://a.b.c.d?aa=1&bb=2&cc=3&b=4#a=0&b=6', ['aa'])
 *   =》"http://a.b.c.d?bb=2&cc=3&a=1&b=2&c=3#a=0&b=6"
 *
 *  fillParams({a: 1, b: 2, c: 3}, 'http://a.b.c.d?aa=1&bb=2&cc=3&b=4#a=0&b=6')
 *   =》"http://a.b.c.d?aa=1&bb=2&cc=3&a=1&b=2&c=3#a=0&b=6"
 *
 *  fillParams({a: 1, b: 2, c: 3}, 'http://a.b.c.d')
 *   =》"http://a.b.c.d?a=1&b=2&c=3"
 *
 * @return   {String}                          注入参数后的url
 */
var fillParams = function(params, url, withouts) {
    url = url || window.location.href;

    var urlPairs = url.split('#'),
        fullUrl = urlPairs[0],

        hashUrl = urlPairs.length > 1 && ('#' + urlPairs[1]) || '',
        baseUrl = fullUrl.split('?')[0],
        originParams = getUrlParams(null, fullUrl),

        paramsList = [],
        re = '';

    for (var key in originParams) {
        if (undefined === params[key] && indexOfArray(withouts, key) === -1) {
            paramsList.push(key + '=' + originParams[key]);
        }
    }

    for (var key1 in params) {
        if (indexOfArray(withouts, key1) === -1) {
            if (params[key1] !== undefined) {
                paramsList.push(key1 + '=' + params[key1]);
            }
        }
    }

    re += baseUrl;
    re += paramsList.length && ('?' + paramsList.join('&')) || '';
    re += hashUrl;

    return re;
};


/**
 * 判断key是否在数组中
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-06-25T09:26:51+0800
 * @param    {[type]}                           arr [description]
 * @param    {[type]}                           key [description]
 * @return   {[type]}                               [description]
 */
var indexOfArray = function(arr, key) {
    arr = arr || [];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === key) {
            return i;
        }
    }

    return -1;
};


/**
 * 将 URL 参数转换为字符串
 * @param {Mix} query1[, query2][, withouts]  处理参数
 *        @param {Array} withouts 要排除的字段
 * @return {String} 最后格式化完后的字符串
 * .eg
 *     query2string({'pf':'145','ss':'320x240'});
 *     query2string({'pf':'145','ss':'320x240'},['pf']);
 *     query2string({'pf':'145','ss':'320x240'},{'fr':'android'});
 *     query2string({'pf':'145','ss':'320x240'},{'fr':'android'},['fr']);
 */
var query2string = function() {
    var args = Array.prototype.slice.apply(arguments),
        string = '',
        withouts,
        lastIndex = args.length - 1,
        fields = [];

    // 检测是否有排除参数
    if (Array.isArray(args[lastIndex])) {
        withouts = args[lastIndex];
        args.pop();
    }

    // 需要生成的参数对象
    var qsObj = {};
    args.forEach(function(item) {
        Object.keys(item).forEach(function(key) {
            // 原有的逻辑不是相同的key替换，而是后面的key跟现有的有冲突时会被忽略掉
            if (!qsObj[key] && (!withouts || withouts.indexOf(key) === -1)) {
                qsObj[key] = item[key];
            }
        });
    });


    var pairs = [];
    for (var key in pairs) {
        pairs.push(key + '=' + pairs[key]);
    }
    return pairs.join('&');
};

export { getUrlParams };
export { fillParams };
export { query2string };
