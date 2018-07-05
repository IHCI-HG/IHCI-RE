var conf = require('../../conf'),

    _ = require('underscore');


/**
 * 公参注入中间件：用于将请求header或url中带入的公参注入到req对象中，并写入到客户端cookie中
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var fillClientParams = function (opts) {
    var options = opts || {};

    return function (req, res, next) {
        // 将公参更新写入cookie, 并代入到req中
        autoKeepAppClientParams(req, res);

        next && next();
    };
};

/**
 * 获取客户端传过来的公参
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getAppClientParams (req, res) {
    var headers = req.headers,
        cookies = req.cookies,
        clientParams = {};

    // console.log('headers:', headers);

    _.each(conf.client_params_keys, function (k) {
        clientParams[k] = headers[k] || headers[k.toLowerCase()];

        // 为空时从url取
        if (undefined === clientParams[k] ||
            'undefined' === clientParams[k]) {
            clientParams[k] = req.query[k];
        }

        // 为空时从cookie取
        if (undefined === clientParams[k] ||
            'undefined' === clientParams[k]) {
            clientParams[k] = cookies[k];
        }
    });

    return clientParams;
}

/**
 * 自动保存客户端公参到cookie中
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function autoKeepAppClientParams (req, res) {
    var clientParams = getAppClientParams(req, res);


    // 写入cookie
    _.each(conf.client_params_keys, function (k) {
        // 更新cookie对象
        if (!_.isUndefined(clientParams[k]) &&
            !_.isNull(clientParams[k]) &&
            k !== 'sid') {
            res.cookie(k, clientParams[k], {
                //maxAge: 0, //expires * 1000,
                // httpOnly: true
            });
        }
    });

    // console.log('clientParams:', JSON.stringify(clientParams));

    // 带入req
    req.clientParams = clientParams;
}

module.exports = fillClientParams;
