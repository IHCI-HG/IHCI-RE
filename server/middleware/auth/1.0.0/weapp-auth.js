var _ = require('underscore'),
    crypto = require('crypto'),
    lo = require('lodash'),

    auth = require('./auth'),

    envi = require('../../../components/envi/envi'),
    proxy = require('../../../components/proxy/proxy'),
    resProcessor = require('../../../components/res-processor/res-processor'),
    urlUtils = require('../../../components/url-utils/url-utils'),
    wxUtils = require('../../../components/wx-utils/wx-utils'),

    redis3xSession = require('../../../middleware/redis3x-session/redis3x-session'),

    conf = require('../../../conf');

/**
 * 在路由中添加该方法对微信小程序登录状态进行验证
 * 注：该中间件提供绕过该验证中间件方式------req._skipWxAuth = true;
 * @param  {Object} options 配置项
 *     options.expires           Number           session失效时间，单位秒（s)，选填，默认24小时
 *     options.successRedirect   String           验证成功时的跳转路由字符串。可选，若配置，则跳转到该路由，否则继续执行
 *     options.failureRedirect   String/Function  验证失败时的跳转路由字符串或方法。 若不配置，则不论验证是否通过，均放行
 * @return {[type]}         [description]
 */
var required = function(opts) {
    opts = opts || {};

    // 验证用户是否登录
    opts.isLogined = function(req, res) {
        var rs = req.rSession || {};

        return rs.user && rs.user.userType === 'weapp';
    };

    // 默认登录验证失败时的处理
    opts.failureProcess = opts.failureRedirect || function(req, res, next) {
        req.authFailureData = {
            state: {
                code: 110,
                msg: '无权限访问'
            },
            data: null
        };
        resProcessor.forbidden(req, res, req.authFailureData);
    };

    return function(req, res, next) {
        var sid = lo.get(req, 'query.sid') || lo.get(req, 'body.sid');

        if (sid) {
            redis3xSession.getSessionBySid(req, sid).then(function(rs) {
                req.rSession = rs;
                auth.required(opts)(req, res, next);
            }, function(err) {
                console.log(err);
                auth.required(opts)(req, res, next);
            }).catch(function(err) {
                console.log(err);
                auth.required(opts)(req, res, next);
            });
        } else {
            auth.required(opts)(req, res, next);
        }
    };
};


module.exports = required;
module.exports.required = auth.validate;
module.exports.required = required;
