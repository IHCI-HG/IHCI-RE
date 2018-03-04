var path = require('path');
var _ = require('underscore');
var lo = require('lodash');
var async = require('async');
var clientParams = require('../middleware/client-params/client-params');
var proxy = require('../components/proxy/proxy');
var envi = require('../components/envi/envi');
var resProcessor = require('../components/res-processor/res-processor');
var htmlProcessor = require('../components/html-processor/html-processor');
var urlUtils = require('../components/url-utils/url-utils');
var conf = require('../conf');
var wxAuth = require('../middleware/auth/1.0.0/wx-auth');
var auth = require('../middleware/auth/1.0.0/auth');

function pageLogin(req, res, next) {
    var filePath = path.resolve(__dirname, '../../public/weibo/page/login/login.html'),
        options = {
            filePath: filePath,
            fillVars: {
                WEIBOAUTHURL: ''
            },
            renderData: {
                weiboAuthUrl: '',
                showWeiboLogin: true,
            },
        };

    var redirectUrl = req.flash('_loginRedirectUrl'),
        baseUrl = (conf.mode === 'prod'? 'https': req.protocol) + '://' + req.get('Host');

    redirectUrl = redirectUrl ||
        req.query.redirect_url ||
        req.get('referrer') ||
        req.get('referer') ||
        (baseUrl + '/live/entity/mine.htm'); // Todo 这里填写默认登录跳转页面

    // To remove
    var refer = req.get('referer') || req.get('referrer');
    if ((redirectUrl.indexOf('client=weibo') > -1 || envi.isWeibo(req) || (refer && (refer.indexOf('sina.') > -1 || refer.indexOf('weibo.') > -1))) && redirectUrl.indexOf('live/100000081018489.htm') > -1) {
        options.renderData.showWeiboLogin = true;
    }

    var orgUrl = urlUtils.fillParams({}, redirectUrl, ['code', 'client']);
    redirectUrl = urlUtils.fillParams({client: 'weibo'}, redirectUrl, ['code']);

    var weiboAuthUrl = 'https://api.weibo.com/oauth2/authorize' +
        '?client_id=' + conf.weiboClientId +
        '&scope=direct_messages_write,follow_app_official_microblog' +
        '&response_type=code' +
        '&redirect_uri=' + encodeURIComponent(redirectUrl);

    // 在非微博路由的三个页面请求访问时， showWeiboLogin = false
    if (!isWeiboRoutePage(redirectUrl)) {
        options.renderData.showWeiboLogin = false;
    }

    var params = {
        redirectUri: orgUrl,
    };

    let apiUrl = conf.baseApi.createAuthState;

    // 使用知识店铺授权
    if (req.query._klca === '1') {
        apiUrl = conf.baseApi.createKnowledgeState;
    }

    proxy.apiProxy(apiUrl, params, async function(err, body) {
        if (err) {
            resProcessor.error500(req, res, err);
            return;
        }

        if (lo.get(body, 'state.code') !== 0) {
            res.render('500', {
                msg: '',
            });
            return;
        }

        let wxOpenAppId = conf.wxOpenAppId;
        let wxRedirectUrl = baseUrl + '/qrLogin.htm';

        // 知识店铺授权时，使用它对应的开放平台id和授权跳转页面
        let isKnowledgeCodeAuth = false;
        if (req.query._klca === '1') {
            try {
                let params = {
                    subscription: 'knowledgePC',
                };
                let result = await proxy.apiProxyPromise(conf.baseApi.getWxAppId, params, conf.baseApi.secret);
                if (result && result.state && result.state.code === 0) {
                    wxOpenAppId = result.data.appId;
                    wxRedirectUrl = baseUrl + '/qrKnowledgeLogin.htm';
                    isKnowledgeCodeAuth = true;
                }
            } catch (err) {
                console.error(err);
            }
        }

        options.fillVars.LOGINDATA = {
            wxOpenAppId: wxOpenAppId,
            state: lo.get(body, 'data.state'),
            wxRedirectUrl: wxRedirectUrl, // 使用旧的登录授权页
        };

        options.renderData.isKnowledgeCodeAuth = isKnowledgeCodeAuth;
        options.renderData.weiboAuthUrl = weiboAuthUrl;
        // options.fillVars.WEIBOAUTHURL = weiboAuthUrl;

        htmlProcessor(req, res, next, options);
    }, conf.baseApi.secret, req);
}

function pageActLogin (req, res, next) {
    let filePath = path.resolve(__dirname, '../../../public/weibo/page/login/login.html'),
        options = {
            filePath: filePath,
            fillVars: {
                WEIBOAUTHURL: ''
            },
            renderData: {
                weiboAuthUrl: '',
                showWeiboLogin: true,
            },
        };

    htmlProcessor(req, res, next, options);
}

/**
 * 退出登录方法
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-12-13T14:44:56+0800
 * @param    {[type]}                           req  [description]
 * @param    {[type]}                           res  [description]
 * @param    {Function}                         next [description]
 * @return   {[type]}                                [description]
 */
function pageLogout(req, res, next) {
    var redirectUrl = decodeURIComponent(req.query.redirectUrl || '') ||
        req.get('referrer');

    auth.logout(req, res, redirectUrl);
}

/**
 * 判断是否微博路由页面
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-12-09T17:33:40+0800
 * @param    {[type]}                           url [description]
 * @return   {Boolean}                              [description]
 */
function isWeiboRoutePage (url) {
    return /\/live\/(\w)*\.htm/.test(url) ||
        /\/live\/channel\/channelPage\/(\w)*\.htm/.test(url) ||
        /\/topic\/details\?/.test(url) ||
        /\/topic\/(\w)*\.htm/.test(url);
}

module.exports = [
    // 登录页
    // ['GET', '/page/login', pageLogin]
];

module.exports.pageLogin = pageLogin;
module.exports.pageLogout = pageLogout;
module.exports.pageActLogin = pageActLogin;
