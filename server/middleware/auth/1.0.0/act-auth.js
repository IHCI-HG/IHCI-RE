const lo = require('lodash');
const auth = require('./auth');
const conf = require('../../../conf');
const envi = require('../../../components/envi/envi');
const proxy = require('../../../components/proxy/proxy');
const wxUtils = require('../../../components/wx-utils/wx-utils');
const urlUtils = require('../../../components/url-utils/url-utils');
const resProcessor = require('../../../components/res-processor/res-processor');

module.exports = function (opts = {}) {
    
    opts.isLogined = (req, res) => {
        const rs = req.rSession || {};
        return rs.user && rs.user.userType === 'activity';
    };

    opts.checkUser = (username, password, req, res, done) => {
        if (conf.localUserId || conf.mode === 'development') {
            done(null, {
                userType: 'activity',
                name: '喵神的蔑视',
                headImgUrl: 'https://img.qlchat.com/qlLive/userHeadImg/Y9S2DN5R-EUJC-HAN9-1513158218492-3WXXB97NXQ4B.png',
                userId: conf.localUserId || '1',
            });
            return;
        }

        const code = req.query.code;
        // const appIds = getAppId(req);
        const host = req.get('Host');
        // console.log(`[增粉活动] -- 当前域名 ${host}; 获取appId `, JSON.stringify(appIds));

        if (code) {
            // 根据微信授权码(req.query.code)获取用户信息验证
            let params = lo.pick(req.query, 'code', 'loginType', 'state');
            // 根据loginType获取appId
            // params.appId = appIds[params.loginType === 'auth' ? 'gongzhonghaoAppId' : 'kaifangAppI'];
            params.domain = host.split('.')[0];

            proxy.apiProxy(conf.incrFansApi.checkLogin, params, function(err, body) {
                if (err) {
                    done(err, null);
                    return;
                }

                // 验证成功
                if (lo.get(body, 'state.code') === 0) {
                    // 回填usertype标识
                    var userObj = lo.extend({
                        userType: 'activity', // 标识是微信登录
                    }, lo.get(body, 'data.user') || {});

                    userObj.userId = userObj.id

                    // 成功写入session
                    done(null, userObj);

                    // 验证失败
                } else {
                    req.tipMessage = lo.get(body, 'state.msg');
                    console.error('wx user login response:', JSON.stringify(body));
                    done(null, null);
                }
            }, conf.incrFansApi.secret);
        } else {
            done(null, null);
        }
    };

    opts.failureRedirect = (req, res, next) => {
        const path = req.path
        const isApi = path.indexOf('/api/') > -1
        const ua = (req.headers['user-agent'] || '').toLowerCase()

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
            const host = req.get('Host');
            let pageUrl = req.protocol + '://' + host + req.originalUrl;

            pageUrl = urlUtils.fillParams(
                {
                },
                pageUrl, 
                ['code', 'state', 'authDataKey']
            );

            try {
                const appIds = getAppId(req);
                console.log(`[增粉活动] -- 当前域名 ${host}; 获取appId `, JSON.stringify(appIds));

                if (!appIds) {
                    throw new Error('appId 获取失败');
                }
                
                // 开放的授权链接
                const kaifangLoginPageUrl = wxUtils.getQRLoginUrl(pageUrl, appIds.kaifangAppI)
                // 公众号的授权链接
                const gongzhonghaoLoginPageUrl = wxUtils.getAuthLoginUrl(pageUrl, appIds.gongzhonghaoAppId, 'snsapi_userinfo');

                console.log('---------------------------', envi.isWeixin(req));
    
                if (envi.isWeixin(req)) {
                    res.redirect(gongzhonghaoLoginPageUrl);
                } else {
                    res.render('go-to-weixin');
                    // res.redirect(kaifangLoginPageUrl);
                }
            } catch (error) {
                console.error('授权失败 ----', error);
                resProcessor.forbidden(req, res);
            }
            
        }
    };

    return function(req, res, next) {
        // 判断为app内访问，则不使用微信登录中间件处理登录
        if (envi.getQlchatVersion(req)) {
            next();
            return;
        }

        auth.validate(opts)(req, res, next);
    };
}

function getAppId (req) {
    let host = req.get('Host');
    try {
        return {
            kaifangAppI: conf.authAppIds[host].qrCodeAppId,
            gongzhonghaoAppId: conf.authAppIds[host].authAppId
        }
    } catch (error) {
        console.error(`[增粉活动] -- 获取appId失败 -- 当前域名 ${host}; 获取appId `, conf.authAppIds[host]);
        return null;
    }
}