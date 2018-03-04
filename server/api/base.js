var _ = require('underscore'),

    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    wxAuth = require('../middleware/auth/1.0.0/wx-auth'),
    conf = require('../conf');

import lo from 'lodash';
import stream from 'stream';
import request from 'request';


/**
 * 获取系统时间
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var sysTime = function(req, res, next) {

    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: {
            sysTime: new Date().getTime()
        }
    });
};


/**
 * 图片代理
 */
const imageProxy = function (req, res, next) {
    let url = lo.get(req, 'query.url');

    if (!url || !/^https?:\/\//.test(url)) {
        resProcessor.forbidden(req, res, '无效的图片地址');
        return;
    }

    // img.qlchat.com下载速度过慢，怀疑是cdn限速了，直接使用oss域名
    if (url.indexOf('img.qlchat.com') > -1) {
        url = url.replace('https://img.qlchat.com', 'http://ql-res.img-cn-hangzhou.aliyuncs.com');
    }

    var _serverRequestStartTime = process.hrtime();

    const stream = request({
        // pool: requestPool,
        url: url,
        timeout: 3000
    });

    stream.pipe(res);
    stream.on('response', (res) => {
        var _serverRequestEndTime = process.hrtime(),
            ms = (_serverRequestEndTime[0] - _serverRequestStartTime[0]) * 1e3 +
        (_serverRequestEndTime[1] - _serverRequestStartTime[1]) * 1e-6;

        console.log('[image proxy response] url: ', url, ' time: ', ms, 'ms');
    });
    stream.on('error', err => {
        var _serverRequestEndTime = process.hrtime(),
            ms = (_serverRequestEndTime[0] - _serverRequestStartTime[0]) * 1e3 +
        (_serverRequestEndTime[1] - _serverRequestStartTime[1]) * 1e-6;

        console.error('[image proxy err] url:', url, ' err:', err, ' time:', ms, 'ms');
        resProcessor.error500(req, res, err, JSON.stringify(err, null, 4));
    });
}


module.exports = [
    // 微信登录授权接口
    ['GET', '/api/base/sys-time', sysTime],
    ['GET', '/activity/api/image-proxy', imageProxy]
];
