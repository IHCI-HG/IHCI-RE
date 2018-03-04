var fs = require('fs'),
    _ = require('underscore'),
    Handlebars = require('handlebars'),

    md5 = require('../md5/md5'),
    header = require('../header/header'),
    cache = require('../cache/cache').local(),

    conf = require('../../conf');

require('../hbars-helper/compare');
require('../hbars-helper/date-format');
require('../hbars-helper/digit-format');
require('../hbars-helper/text-overflow');
require('../hbars-helper/calculate');
require('../hbars-helper/killEm');
require('../hbars-helper/time-status');
require('../hbars-helper/breakline');
require('../hbars-helper/app-version');
require('../hbars-helper/default-value');
require('../hbars-helper/img-format');
require('../hbars-helper/is-beginning');
require('../hbars-helper/status-show');
require('../hbars-helper/money-format');

/**
 * 处理html类型文件响应
 * @param  {Object}   req     请求对象
 * @param  {Object}   res     响应对象
 * @param  {function} next    路由指针
 * @param  {Object}   options 配置项
 *     options.filePath   String    必填项，指示读取html的全路径地址
 *     options.headers    Object    可选项，存在时，则将headers中的内容设置到res中作为响应头
 *     optinos.renderData       Object    可选项，存在时，会对Html内容作数据渲染注入（使用handlebars作为引擎）
 *     options.filVars          Object    可选项，存在时，会对Html中声明的变量作属性注入
 * @return {[type]}           [description]
 */
var handle = function(req, res, next, opts) {
    var options = opts || {};

    var filePath = options.filePath,
        // parsedUrl = req._parsedUrl,
        // pathname = parsedUrl.pathname,
        cacheKey,
        html;

    // 生成缓存 key
    // cacheKey = md5(pathname + filePath);
    cacheKey = md5(filePath);

    try {
        html = cache.get(cacheKey);
        if (!html) {
            console.log('not use html cache. cacheKey:', cacheKey, ' path:', filePath);
            html = fs.readFileSync(filePath, 'utf8');
            cache.set(cacheKey, html);
        }
    } catch (e) {
        console.error('HTML Process Error', e);
        next();
        return;
    }

    // 无法正确读取 HTML
    // 交给后续的 404 处理
    if (!html) {
        next();
        return;
    }

    // 对html作渲染处理（使用Handlebars渲染数据）
    if (options.renderData) {
        var template = Handlebars.compile(html);
        html = template(options.renderData);
    }

    // 对html注入相关变量
    if (options.fillVars) {
        html = fillHtmlVars(html, options.fillVars);
    }

    // 处理常用的标识变量替换（如时间戳）
    // html = replaceFlagParams(html);


    // 替换其它参数
    // html = replaceParams(html);


    // 页面缓存时间固定为 10 分钟
    // header.cacheControl('10m', res);
    // header.expire('10m', res);

    // 设置文件类型
    header.contentType('html', res);

    // 读取 route 的配置并设置对应的 headers 信息
    _.each(options.headers, function(value, key) {
        if (_.isFunction(value)) {
            value = value.call();
        }
        res.set(key, value);
    });

    // 返回网页
    res.status(200).send(html);
};

/**
 * 将html文本中以[[keyname]]括起来的变量名用data中对应keyname的值作替换
 * @param  {[type]} html [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var fillHtmlVars = function(html, data) {
    _.each(data, function(value, key) {
        var jsonV;
        if (_.isString(value)) {
            jsonV = value;
        } else {
            jsonV = JSON.stringify(value);
        }
        jsonV = (jsonV || '').replace(/(\u0085)|(\u2028)|(\u2029)/g, (m) => "");
        jsonV = (jsonV || '').replace(/\</g, (m) => "&lt;")
        jsonV = (jsonV || '').replace(/\>/g, (m) => "&gt;")
        html = html
                .replace(new RegExp('\\[\\[' + key + '\\]\\]', 'g'), (m) => jsonV);
    });

    return html;
};

/**
 * 将html中的flag标识变量作
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-06-23T16:05:14+0800
 * @param    {[type]}                           html [description]
 * @return   {[type]}                                [description]
 */
var replaceFlagParams = function(html) {
    // 加随机数
    html = html.replace('__date', Date.now().toString(32));

    return html;
};


/**
 * 替换其它参数
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
var replaceParams = function (html) {
    // html = html.replace('[[__WSURL__]]', conf.websocketUrl);
    return html;
};


module.exports = handle;
