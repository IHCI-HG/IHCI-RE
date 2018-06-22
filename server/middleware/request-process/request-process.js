
var lo = require('lodash'),
    proxy = require('../../components/proxy/proxy'),
    resProcessor = require('../../components/res-processor/res-processor');

/**
 * 通用接口请求处理中间件，负责参数传递和接口调用以及正常jsonp响应内容
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2017-02-07T17:11:46+0800
 * @param  {[type]} uri         接口url
 * @param  {[type]} secret      接口签名secret
 * @param  {[type]} otherParams 接口请求附带参数
 * @return {[type]}             [description]
 */
module.exports = (uri, secret, otherParams) => {
    return async (req, res, next) => {
        var result,
            params;

        if ('POST' === req.method) {
            params = req.body;
        } else {
            params = req.query;
        }

        // 组织分页参数
        if (params.size) {
            params.page = {
                page: params.page,
                size: params.size
            };
        }

        // 如果有用户信息，添加用户id
        var userId = lo.get(req, 'rSession.user.userId');
        if (userId) {
            params.userId = userId;
        }

        // 追加扩展参数
        if (otherParams) {
            lo.extend(params, otherParams);
        }

        // console.log(params);

        try {
            result = await proxy.apiProxyPromise(uri, params, secret, req);
        } catch (err) {
            resProcessor.error500(req, res, err);
            return;
        }

        resProcessor.jsonp(req, res, result);
    };
};
