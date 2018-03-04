/**
 * 数据以jsonp格式响应
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Array} data  响应的数据（json对象）
 * @return {null}
 */
var jsonp = function(req, res, data) {
    var callbackFn = req.query.callback;

    if (!data) {
        data = {};
    }

    var dataStr = JSON.stringify(data);
    dataStr = dataStr.replace(/(\u0085)|(\u2028)|(\u2029)/g, (m) => "");
    if (callbackFn) {
        res.set('Content-Type', 'application/javascript');
        res.send(callbackFn + '(' + dataStr + ')');
    } else {
        res.send(dataStr);
    }
};

/**
 * 缺少参数时的响应方法(带上data时以data数据响应。默认以缺少参数提示信息响应)
 * @param  {[type]} req  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var paramMissError = function(req, res, data) {
    console.error('[param miss error] req path: ', req.path, ', query: ', req.query, ', body:', req.body);

    // api 接口
    if (/^\/api/.test(req.originalUrl)) {
        if (!data || 'string' === typeof data) {
            data = {
                success: false,
                state: {
                    code: 1,
                    msg: data || '缺少必要参数',
                },
            };
        }

        jsonp(req, res, data);
    } else { // 页面路由
        res.status(404);
        res.send(data || '页面不存在');
    }
};

/**
 * 以状态码200响应，默认带上ok标识，可用msg替代
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
var ok = function(req, res, msg) {
    var sendText = msg || 'ok';
    res.status(200).send(sendText);
};

/**
 * 禁止访问
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var forbidden = function(req, res, msg) {
    res.status(403);

    if (msg && 'object' === typeof msg) {
        jsonp(req, res, msg);
        return;
    }

    res.send(msg || '无访问权限');
};

/**
 * 500内部服务错误
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @param  {[type]}   msg  [description]
 * @return {[type]}        [description]
 */
var error500 = function(req, res, error, msg) {
    res.status(500).send(msg || '内部服务错误');
};


var errorPage = function (req, res, next) {
    res.render('500', {
        // layout: 'not-main', // 指定其它layout模板，不配置默认用main
        msg: '这是一个错误页面'
    });
};

var reject = function(req, res, params) {
    res.render('reject', {
        isLive: params.isLive,
        liveId: params.liveId
    });
}

module.exports.jsonp = jsonp;
module.exports.paramMissError = paramMissError;
module.exports.ok = ok;
module.exports.forbidden = forbidden;
module.exports.error500 = error500;
module.exports.errorPage = errorPage;
module.exports.reject = reject;
