
var notFound = require('../middleware/not-found/not-found');

/**
 * routes配置，配置格式如下：
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
module.exports = [
    // 所有html静态请求全部过滤，不允许直接请求html, html请求全由路由请求
    [0, 'all', /\.html$/, notFound()],
    // 所有错误的以 undefined 或 null 结尾的请求全部过滤
    [1, 'all', /\/undefined$/, notFound()],
    [2, 'all', /\/null$/, notFound()],
    [3, 'all', /\/false$/, notFound()],
];
