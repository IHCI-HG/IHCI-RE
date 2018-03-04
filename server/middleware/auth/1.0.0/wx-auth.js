var _ = require('underscore'),
    lo = require('lodash'),
    crypto = require('crypto'),

    auth = require('./auth'),

    envi = require('../../../components/envi/envi'),
    proxy = require('../../../components/proxy/proxy'),
    resProcessor = require('../../../components/res-processor/res-processor'),
    urlUtils = require('../../../components/url-utils/url-utils'),
    wxUtils = require('../../../components/wx-utils/wx-utils'),

    conf = require('../../../conf'),

    cookieTimeout = 60 * 60 * 24 * 1000,

    // 旧项目生成的cookie的sessionId对应的key
    jsessionIdCookieKey = 'QLZB_SESSIONID',

    // sessionid 加密因子
    sessionidFeed = 'QiAnLiAo03251450aES';


/**
 * 根据code验证用户
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-30T16:06:13+0800
 * @param    {[type]}                           username [description]
 * @param    {[type]}                           password [description]
 * @param    {[type]}                           req      [description]
 * @param    {[type]}                           res      [description]
 * @param    {Function}                         done     [description]
 * @return   {[type]}                                    [description]
 */
async function checkUser(username, password, req, res, done) {

    // 知识店铺过来，直接失败处理，让失败处理中调用接口获取知识店铺的unionId的state，然后走千聊静默授权
    if (req.query._klca) {
        done(null, null);
    // 知识店铺授权后走千聊静默授权流程过来
    } else if (req.query._kltoqlca) {
        let params = _.pick(req.query, 'code', 'loginType', 'state');
        proxy.apiProxy(conf.baseApi.bindAndGetUserInfo, params, function(err, body) {
            if (err) {
                done(err, null);
                return;
            }

            // 验证成功
            if (body && body.state && body.state.code === 0) {
                // 回填usertype标识
                var userObj = _.extend({
                    userType: 'weixin', // 标识是微信登录
                }, body.data && body.data.user || {});

                // 兼容旧项目，写入jsession的cookie
                if (body.data && body.data.cookie) {
                    res.cookie(jsessionIdCookieKey, body.data.cookie, {
                        maxAge: cookieTimeout, // expires * 1000, // 毫秒
                        httpOnly: true,
                    });
                }

                // 成功写入session
                done(null, userObj);

                // 验证失败
            } else {
                req.tipMessage = body && body.state && body.state.msg;
                console.error('wx user login response:', JSON.stringify(body));
                done(null, null);
            }
        }, conf.baseApi.secret);

    // 非知识店铺授权过来，走千聊授权流程
    } else {
        let params = _.pick(req.query, 'code', 'loginType', 'state');


        proxy.apiProxy(conf.wechatApi.checkLogin, params, function(err, body) {
            if (err) {
                done(err, null);
                return;
            }

            // 验证成功
            if (body && body.state && body.state.code === 0) {
                // 回填usertype标识
                var userObj = _.extend({
                    userType: 'weixin', // 标识是微信登录
                }, body.data && body.data.user || {});

                // 兼容旧项目，写入jsession的cookie
                if (body.data && body.data.cookie) {
                    res.cookie(jsessionIdCookieKey, body.data.cookie, {
                        maxAge: cookieTimeout, // expires * 1000, // 毫秒
                        httpOnly: true,
                    });
                }

                // 成功写入session
                done(null, userObj);

                // 验证失败
            } else {
                req.tipMessage = body && body.state && body.state.msg;
                console.error('wx user login response:', JSON.stringify(body));
                done(null, null);
            }
        }, conf.wechatApi.secret);
    }
}

/**
 * 兼容旧项目使有jessionid验证用户
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-30T16:39:23+0800
 * @param    {[type]}                           username [description]
 * @param    {[type]}                           password [description]
 * @param    {[type]}                           req      [description]
 * @param    {[type]}                           res      [description]
 * @param    {Function}                         done     [description]
 * @return   {[type]}                                    [description]
 */
function jsessionIdCheckUser(username, password, req, res, done) {
    var params = {
        cookieValue: req.cookies[jsessionIdCookieKey],
    };
    // 根据jsessionid获取用户信息
    proxy.apiProxy(conf.wechatApi.checkLoginFromJSessionId, params, function(err, body) {
        if (err) {
            done(err, null);
            return;
        }

        // 验证成功
        if (body && body.state && body.state.code === 0) {
            // 回填usertype标识
            var userObj = _.extend({
                userType: 'weixin', // 标识是微信登录
            }, body.data && body.data.user || {});

            // 成功写入session
            done(null, userObj);

            // 验证失败
        } else {
            req.tipMessage = body && body.state && body.state.msg;
            console.error('wx user login response:', JSON.stringify(body));
            done(null, null);
        }
    }, conf.wechatApi.secret);
}


/**
 * 在路由中添加该方法对微信客户端用户登录验证
 * @param  {Object} options 配置项
 *     options.expires           Number           session失效时间，单位秒（s)，选填，默认24小时
 *     options.successRedirect   String           验证成功时的跳转路由字符串。可选，若配置，则跳转到该路由，否则继续执行
 *     options.failureRedirect   String/Function  验证失败时的跳转路由字符串或方法。 若不配置，则不论验证是否通过，均放行
 *     options.allowFree        Boolean     是否放行，若为true,则不登录仍然放行
 * @return {[type]}         [description]
 */
var validate = function(opts) {
    opts = opts || {};

    // 验证用户是否登录
    opts.isLogined = function(req, res) {
        var rs = req.rSession || {};

        // if (!req.rSession) {
        //     return false;
        // }

        // return rs.user && rs.user.userType === 'weixin';
        return rs.user && rs.user.userType === 'weixin';
    };
    // 获取用户信息登录
    opts.checkUser = function(username, password, req, res, done) {
        var code = req.query.code;

        // 作为本地调试
        if (conf.localUserId || conf.mode === 'development') {

            // res.cookie(jsessionIdCookieKey, '4F2F79326F6476794335546863587961555A652B4A6171703554387376584370373149576656346B3234733D', {
            //     // maxAge: 0, //expires * 1000,
            //     httpOnly: true,
            // });

            // const userId = {
            //     development: '100000000000007',
            //     development1: {
            //         default: '100000000000007',
            //         dodomon: '100000000000007',

            //     }
            // }


            let userId = '100000012000002'; // 小强 dev1, 各位大佬留情，为啥别人都是注释掉，我的就删掉

            if (conf.localUserId) {
                userId = conf.localUserId;
            }

            done(null, {
                'userType': 'weixin', // 标识是微信登录
                'unionId': 'o8YuyszTvnufDrSkFqID1LMFkmtw', // dodomon DEV1
                // 'userId': '100000000000007', // dodomon DEV1
                'name': 'dodomon', // dodomon
                'headImgUrl': 'http://img.qlchat.com/qlLive/userHeadImg/7PACRS47-GZ3J-ITWN-1479908935934-DDWBDGYRID5A.jpg', // dodomon
                // 'userId': '100000001000032',
                // 'userId': '100000001000002',
                // 'userId': '100011797000012', // Dylan
                // 'userId': '100000000000054', // 文琦 dev1
                // 'userId': req.query.userId,
                // 'userId': '110000011000795', // 青霞 in dev
                // 'userId': '140000001000016', // 青霞 in test1
                // 'userId': '100000017000925', //qing in test3
                // 'userId': '100000000000193', // Dylan in dev1
                // 'userId': '100011797000012', // Dylan
	            // 'userId': '140000000000122', // 瑞坤test1
                // 'userId': '140000002000019', // Dylan in test1
                // 'userId': '100001205000070',// Dylan in test2
                // 'userId': '140000004000021', //arluber test1
                // 'userId': '140000004000021', //arluber dev2
                // 'userId': '100001116000041', //wofeng test1
                // 'userId': '100000001000999', // dodomon test2
                // 'userId': '140000026000047', // dodomon test3
                // 'userId': '100000000000048', // arluber dev1
                // userId: '100000000000488', // 搏命的dev1
                // 'userId': '100011797000025', // arluber
                // 'userId': '100000012000002', // 小强 dev1, 各位大佬留情，为啥别人都是注释掉，我的就删掉
                // 'userId': '100000039001540', // 小强 test3
                // 'userId': '100000002000901', // 小强 test1
                // userId: '100000000000605', // fisher dev1
                // userId: '100000000000006', // fisher test2
                // userId: '2000000014945706', // 李悦 test3
                userId: userId,
                'account': null,
                'mobile': null,
                'email': null,
                'appId': null,
                'mgForums': [],
                'mgLives': [],
            });

            return;
        }

        // 当旧项目完全迁移后可删除以下机制
        // 此处添加兼容旧项目session验证登录机制
        if (!code && req.cookies[jsessionIdCookieKey]) {
            jsessionIdCheckUser(username, password, req, res, done);
        } else if (code) {
            // 根据微信授权码(req.query.code)获取用户信息验证
            checkUser(username, password, req, res, done);
        } else {
            done(null, null);
        }
    };

    // 默认跳转失败时去到的页面
    opts.failureRedirect = opts.failureRedirect || async function(req, res, next) {
        var path = req.path,
            isApi = path.indexOf('/api/') > -1,
            ua = (req.headers['user-agent'] || '').toLowerCase(),
            wxLoginPageUrl = '/page/login';


        // 接口调用
        if (isApi) {
            req.authFailureData = {
                state: {
                    code: 110,
                    msg: '无权限访问',
                },
                data: {
                    url: '/page/login',
                },
            };
            resProcessor.forbidden(req, res, req.authFailureData);

        // 页面访问
        } else {
            var pageUrl = (conf.mode === 'prod' ? 'https' : req.protocol) + '://' + req.get('Host') + req.originalUrl;


            // 从知识店铺授权过来，调用接口获取知识店铺unionid的state,走千聊静默授权
            if (req.query.code && req.query._klca && envi.isWeixin(req)) {
                let params = _.pick(req.query, 'code', 'loginType', 'state');
                let state = null;
                try {
                    let result = await proxy.apiProxyPromise(conf.baseApi.knowledgeCodeAuth, params, conf.baseApi.secret);
                    if (result && result.state && result.state.code === 0) {
                        state = result.data.state;
                    }
                } catch (err) {
                    console.error(err);
                }

                pageUrl = urlUtils.fillParams({
                    _kltoqlca: '1', // 内部标识参数，标识是经过了知识店铺授权再经过千聊静态授权而来
                }, pageUrl, ['code', 'loginType', 'state', 'authDataKey', '_klca']);

                wxUtils.goKnowledgeToQlCodeAuth(req, res, pageUrl, state);
                return;
            }

            pageUrl = urlUtils.fillParams({

            }, pageUrl, ['code', 'state', 'authDataKey', '_klca', '_kltoqlca']);

            wxUtils.goWxAuth(req, res, pageUrl);
        }
    };

    return function(req, res, next) {

        // 判断为app内访问，则不使用微信登录中间件处理登录
        if (envi.getQlchatVersion(req)) {
            next();
            return;
        }

        // 无验证码 且无wt登录cookie，且中间件开放了允许放行，则放行
        if (opts.allowFree && !req.query.code && !req.cookies[jsessionIdCookieKey]) {
            next();
            return;
        }

        auth.validate(opts)(req, res, next);
    };
};


module.exports = validate;
module.exports.required = auth.required;
module.exports.validate = validate;
