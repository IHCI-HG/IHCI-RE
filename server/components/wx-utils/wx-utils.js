var _ = require('underscore'),
    lo = require('lodash'),

    conf = require('../../conf'),
    server = require('../../server'),

    envi = require('../envi/envi'),
    proxy = require('../proxy/proxy'),
    urlUtils = require('../url-utils/url-utils');

/**
 * 从redis获取微信相关配置信息
 * 例："{\"accessToken\":\"mv73GxENZ94FViXsKwGJPEP-PT5nCDOJgyMdmROkWiLUbIn4rEiexziGSThsimyMTpxWuUmvMT65iwXe0O8WBDay5tXhuaWx_oOG3Ozhn02D4F0isBz_Y7q8p3VG0hbZYBXdACAJMI\",\"appId\":\"wx6b010e5ae2edae95\",\"appsecret\":\"c21e72db8d46ea7f2d35910212241a00\",\"expiresIn\":7200,\"jsapiTicket\":\"sM4AOVdWfPE4DxkXGEs8VDBiTkMK_4q5Pam6Jf1M6kHxA25yb0_VO5aAkHlS-eoSlydE7ug1PtwLPloQ0emG-A\",\"rediectUri\":\"http%3A%2F%2Fm.qlchat.com%2Flogin.htm\",\"token\":\"live\"}"
 * @return {[type]}      [description]
 */
function getConfig (appId, callback){

    if(!server.app.redisCluster) {
        if ('function' === typeof callback) {
            callback({});

        }
        return ;
    }

    let key = '_WT_WX_ACCESS_TOKEN';

    if (appId) {
        key = `WX_ACCESS_TOKEN_${appId}`
    }

    server.app.redisCluster.get(key, function(err, config){
        if(err){
            config = {};
        } else {
            try {
                config = JSON.parse(config);
            } catch(error) {
                config = {};
                console.error('parse wxconfig error:', error);
            }

            if (!config) {
                config = {};
            }
        }

        if ('function' === typeof callback) {
            callback(config);
        }
    });
}

/**
 * 获取页面的微信手动授权页完整地址
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-30T19:42:58+0800
 * @param    {[type]}                           pageUrl  [description]
 * @param    {Function}                         callback [description]
 * @return   {[type]}                                    [description]
 */
module.exports.getAuthLoginUrl = function(pageUrl, appId, scope, state) {
    // getConfig(function(wxConf) {
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize' +
            '?appid=' + appId +
            '&redirect_uri=' + encodeURIComponent(urlUtils.fillParams({
                    loginType: 'auth'
                }, pageUrl, ['code', 'state', 'authDataKey', 'client'])) +
            '&response_type=code' +
            '&scope=' + scope +
            '&state=' + (state || Date.now()) +
            '#wechat_redirect';

        return url;
    // });
};

/**
 * 知识店铺授权过后走千聊静默授权
 * @param  {[type]} req     [description]
 * @param  {[type]} res     [description]
 * @param  {[type]} pageUrl [description]
 * @return {[type]}         [description]
 */
module.exports.goKnowledgeToQlCodeAuth = async function(req, res, pageUrl, state) {
    let appId;
    let scope = 'snsapi_base';

    try {
        let params = {
            subscription: 'qlchatLive',
        };
        let result = await proxy.apiProxyPromise(conf.baseApi.getWxAppId, params, conf.baseApi.secret);
        if (result && result.state && result.state.code === 0) {
            appId = result.data.appId;
        } else {
            res.render('500');
            return;
        }
    } catch (err) {
        console.error(err);
        res.render('500');
        return;
    }

    let url = module.exports.getAuthLoginUrl(pageUrl, appId, scope, state);

    try {
        res.redirect(url);
    } catch (error) {
        console.error('千聊授权，跳转异常 ------ ', error);
    }

    // module.exports.getAuthLoginUrl(pageUrl, appId, scope, state, function(url) {
    //     try {
    //         res.redirect(url);
    //     } catch (error) {
    //         console.error('知识店铺授权过后走千聊静默授权，跳转异常 ------ ', error);
    //     }
    // });
};


/**
 * 获取页面的二维码微信登录授权页完整地址
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-30T19:44:36+0800
 * @param    {[type]}                           pageUrl [description]
 * @return   {[type]}                                   [description]
 */
module.exports.getQRLoginUrl = function(pageUrl, appId = conf.wxOpenAppId) {
    const url = 'https://open.weixin.qq.com/connect/qrconnect?' +
        'appid=' + appId +
        '&redirect_uri=' + encodeURIComponent(urlUtils.fillParams({
                loginType: 'qrCode'
            }, pageUrl, ['code', 'state', 'authDataKey', 'client'])) +
        '&response_type=code' +
        '&scope=snsapi_login' +
        '&state=' + Date.now() +
        '#wechat_redirect';

    return url;
};

/**
 * 微信登录某页面（去到pc二维码登录页或微信授权（知识店铺手动授权或者千聊手动授权）
 * @param  {[type]} req      [description]
 * @param  {[type]} res      [description]
 * @param  {[type]} pageUrl  [description]
 * @param  {[type]} loginUrl 可指定登录页
 * @return {[type]}          [description]
 */
module.exports.goWxAuth = async function(req, res, pageUrl, loginUrl) {
    // 判断几个需要通过知识店铺授权的机构直播间页面才进行相关授权
    let isKnowledgeCodeAuth = false;
    // if (isGoKnowledgeCodeAuth(pageUrl)) {
    if (req._isGoKnowledgeToQlCodeAuth) {
        // 判断是否机构版直播间
        try {
            let params = {};
            if (req.query.topicId) {
                params.topicId = req.query.topicId;
            } else if (req.params.channelId) {
                params.channelId = req.params.channelId;
            } else if (req.params.liveId) {
                params.liveId = req.params.liveId;
            } else if (req.params.topicId) {
                params.topicId = req.params.topicId;
            } else if (req.query.channelId) {
                params.channelId = req.query.channelId;
            } else if (req.query.liveId) {
                params.liveId = req.query.liveId;

            // 这里的id没有区分，所以额外加上path的简单判断判断为作业
            } else if (req.query.id && req.path.indexOf('homework') > -1) {
                params.homeworkId = req.query.id;
            }

            let result = await proxy.apiProxyPromise(conf.baseApi.isLiveAdmin, params, conf.baseApi.secret);
            if (lo.get(result, 'data.isLiveAdmin', false)) {
                isKnowledgeCodeAuth = true;
            }
        } catch (err) {
            console.error(err);
            isKnowledgeCodeAuth = false;
        }
    }

    // 非微信内置浏览器，使用二维码登录
    if (!envi.isWeixin(req)) {

        pageUrl = urlUtils.fillParams({
            loginType: 'qrCode',
        }, pageUrl, ['code', 'state', 'authDataKey', '_klca']);

        // 记录来源页面地址
        req.flash('_loginRedirectUrl', pageUrl);

        let wxLoginPageUrl = '';
        if (loginUrl) {
            wxLoginPageUrl = loginUrl;
        } else {
            wxLoginPageUrl = '/page/login?redirect_url=' + encodeURIComponent(pageUrl);
        }

        // 跳转到微信登录页
        if (isKnowledgeCodeAuth) {
            wxLoginPageUrl += '&_klca=1'; // _klca为内部标识，表示通过知识店铺授权
        }

        // 跳转到微信登录页
        res.redirect(wxLoginPageUrl);

    // 微信内置浏览器，使用手动授权登录
    } else {
        // 灰度环境借助正式环境登录
        if (pageUrl.indexOf('://test.qlchat.com') > -1) {
             pageUrl = req.protocol + '://m.qlchat.com/api/go/wx-auth?target=' + encodeURIComponent(pageUrl);
        }

        let appId;
        let scope = 'snsapi_userinfo';
        let state = null;

        if (isKnowledgeCodeAuth) {
            try {
                let params = {
                    subscription: 'knowledge',
                };
                let result = await proxy.apiProxyPromise(conf.baseApi.getWxAppId, params, conf.baseApi.secret);
                if (result && result.state && result.state.code === 0) {
                    appId = result.data.appId;
                } else {
                    res.render('500');
                    return;
                }
            } catch (err) {
                console.error(err);
                res.render('500');
                return;
            }

            // 标识为知识店铺登录
            pageUrl = urlUtils.fillParams({
                _klca: '1', // _klca为内部标识，表示通过知识店铺授权
            }, pageUrl);

        // 千聊授权
        } else {
            try {
                let params = {
                    subscription: 'qlchatLive',
                };
                let result = await proxy.apiProxyPromise(conf.baseApi.getWxAppId, params, conf.baseApi.secret);
                if (result && result.state && result.state.code === 0) {
                    appId = result.data.appId;
                } else {
                    res.render('500');
                    return;
                }
            } catch (err) {
                console.error(err);
                res.render('500');
                return;
            }
        }


        let url = module.exports.getAuthLoginUrl(pageUrl, appId, scope, state);
    
        try {
            res.redirect(url);
        } catch (error) {
            console.error('千聊授权，跳转异常 ------ ', error);
        }
        // module.exports.getAuthLoginUrl(pageUrl, appId, scope, state, function(url) {
        //     try {
        //         res.redirect(url);
        //     } catch (error) {
        //         console.error('千聊授权，跳转异常 ------ ', error);
        //     }
        // });
    }
};


module.exports.getConfig = getConfig;
