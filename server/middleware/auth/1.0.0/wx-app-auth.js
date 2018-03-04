const wxAuth = require('./wx-auth')
const appAuth = require('./app-auth')
const clientParams = require('../../client-params/client-params')
const envi = require('../../../components/envi/envi')
import lo from 'lodash';

/**
 * 微信端和app端的登录验证中间件
 * @param {*} opts allowFree,
 */
export default function wxAppAuth (opts = {}) {

    return (req, res, next) => {

        // 如果不是app，就是微信访问
        if (!envi.isQlApp(req)) {

            // 无验证码 且无wt登录cookie，且中间件开放了允许放行，则放行
            if (opts.allowFree && !req.query.code && !req.cookies[jsessionIdCookieKey]) {
                next();
                return;
            }

            wxAuth(opts)(req, res, next);
        } else {
            // 如果是app
            clientParams()(req, res);
            appAuth(opts)(req, res, next);
        }
    }
}
