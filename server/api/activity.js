var _ = require('underscore'),
    request = require('request'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    wxAuth = require('../middleware/auth/1.0.0/wx-auth'),
    appAuth = require('../middleware/auth/1.0.0/app-auth'),
    clientParams = require('../middleware/client-params/client-params'),
    conf = require('../conf');

const requestProcess = require('../middleware/request-process/request-process');

import lo from 'lodash'


var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp')

/* 打日志 */
var increase = function(req, res, next) {
    const type = lo.get(req,'body.type')
    const channelId = lo.get(req,'body.channelId') || '230000493021827'
    const userId = lo.get(req,'rSession.user.userId')

    proxy.apiProxy(conf.baseApi.activity.storage.log+`?type=${type}&channelId=${channelId}&userId=${userId}`,
        {channelId, type, userId},
        function(err,body){
            if (err) {
                resProcessor.error500(req, res, err);
                return;
            }

            resProcessor.jsonp(req, res, {
                state: {
                    code: 0
                },
                data: {
                    sysTime: new Date().getTime()
                }
            });
        },
        conf.baseApi.secret, req);
};

var getConfig = function(req, res, next) {

    // const url = req.protocol + '://' + req.get('host') + '/wechat/page/activity/storage';
    const url = decodeURIComponent(req.query.url);
    proxy.apiProxy(conf.baseApi.activity.config + '?url='+encodeURIComponent(url), { },
        function(err,body){
            if (err) {
                resProcessor.error500(req, res, err);
                return;
            }

            resProcessor.jsonp(req, res, {
                state: {
                    code: 0
                },
                data: {
                    config: body,
                }
            });
        },
        conf.baseApi.secret, req);

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
    const stream = request(url);

    stream.pipe(res);
    stream.on('error', err => {
        resProcessor.error500(req, res, err, JSON.stringify(err, null, 4));
    });

}
module.exports = [
    // 活动统计日志
    ['POST', '/api/wechat/activity/log/increase', increase],
    // 获取微信配置
    ['GET', '/api/wechat/activity/config', getConfig],

    // 送书地址通用接口
    // ['POST', '/api/activity/saveAddress', clientParams(),appAuth(),wxAuth(), requestProcess(conf.activityApi.address.saveAddress, conf.baseApi.secret)],
    // ['POST', '/api/activity/addressInfo', clientParams(),appAuth(),wxAuth(), requestProcess(conf.activityApi.address.getAddressInfo, conf.baseApi.secret)],

    ['GET', '/api/wechat/image-proxy', imageProxy],
];
