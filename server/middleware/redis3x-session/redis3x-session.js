var signature = require('cookie-signature'),
    _ = require('underscore'),

    uuid = require('../../components/uuid/uuid'),
    server = require('../../server'),

    // session key
    redisSessionKey = "rsessionid";

module.exports = RedisSession;


/**
 * 根据sessionid查询session信息
 * @param  {[type]} sessionId [description]
 * @return {[type]}           [description]
 */
var getSessionBySid = function(req, sessionId) {

    return new Promise(function (resolve, reject) {
        // var _redisGetStartTime = process.hrtime();
        server.getRedisCluster().get(sessionId, function (err, sessionStr) {
            // var _redisGetEndTime = process.hrtime();

            // var ms = (_redisGetEndTime[0] - _redisGetStartTime[0]) * 1e3
                // + (_redisGetEndTime[1] - _redisGetStartTime[1]) * 1e-6;

            // console.log('[request get redis] key:' + sessionId + ' response-time: ' + ms.toFixed(3) + 'ms', '\n');

            // _redisGetStartTime = null;
            var rSessoin;

            // 读到缓存
            if (sessionStr) {
                try {
                    rSession = RSession.deserialize(req, sessionStr);
                    resolve(rSession);
                } catch (error) {
                    console.error('deserialize redis session error:', error);
                    reject(error);
                }
            // 读不到缓存
            } else {
                if (err) {
                    console.error('get redis session error:', err);
                }
                reject(err);
            }
        });
    });
};

module.exports.getSessionBySid = getSessionBySid;


/**
 * redis-session缓存中间件
 * @param {Object} opts [description]
 * opts.expires  缓存过期时间，单位秒(s), 默认值30 * 60（半小时）
 * opts.secret   加密私钥，取cookie-parser中间件设置的secret值作为opts.secret的值
 */
function RedisSession (options) {

    var opts = options || {};

    // 默认缓存时间30分钟
    var expires = opts.expires || 30 * 60,
        secret;


    if (!options.redisCluster) {
        throw Error('redis3x-session middleware args error, options.redisCluster is need!');
    }

    return function _redisSession3x (req, res, next) {

        // 重写writeHead， 在响应时写cookie
        var writeHead = res.writeHead;
        res.writeHead = function () {
            // 支持针对单独session定制过期时间
            // 保存cookie及redis缓存
            // 更新cookie对象
            res.cookie(redisSessionKey, signature.sign(req.rSession.sessionId, secret), {
                //maxAge: 0, //expires * 1000,
                httpOnly: true
            });

            return writeHead.apply(this, arguments);
        };


        // 同步方式，依赖redis响应结果然后响应请求结果
        var _end = res.end;
        res.end = function() {
            var args = arguments;

            // 支持针对单独session定制过期时间
            // 保存cookie及redis缓存
            // var _redisSaveStartTime = process.hrtime();
            req.rSession.save(res, options.redisCluster, secret, req.rSession.expires || expires, function() {
                // var _redisSaveEndTime = process.hrtime();

                // var ms = (_redisSaveEndTime[0] - _redisSaveStartTime[0]) * 1e3
                    // + (_redisSaveEndTime[1] - _redisSaveStartTime[1]) * 1e-6;

                // console.log('[request save redis] key:' + req.rSession.sessionId + ' response-time: ' + ms.toFixed(3) + 'ms', '\n');

                // _redisSaveStartTime = null;
                return _end.apply(res, args);
            });
        };

        // 由cookie-parser中间件生成，若自己实现，则不需依赖cookie-parser
        var cookies = req.cookies,
            signedSessionId = cookies[redisSessionKey],
            sessionId;

        // 可由cookie-parser传入带入到req.secret中
        secret = req.secret;

        // 签名验证及解签
        if (signedSessionId) {
            sessionId = signature.unsign(signedSessionId, secret);
        }

        if (!sessionId) {
            req.rSession = RSession.create(req, {
                // expire: (new Date()).getTime() + expires * 1000
            });

            next();
        } else {
            var rSession;

            getSessionBySid(req, sessionId).then(function(rs) {
                req.rSession = rs;
                next();
            }, function(err) {
                req.rSession = RSession.create(req, {
                    sessionId: sessionId
                });
                next();
            }).catch(function(err) {
                req.rSession = RSession.create(req, {
                    sessionId: sessionId
                });
                next();
            });
        }
    };
}

/**
 * redis session 类定义
 * @param {Context} ctx 上下文对象（sessionContext)
 * @param {Object} options session存储的值
 */
function RSession (ctx, options) {
    Object.defineProperty(this, '_ctx', {
        value: ctx
    });

    if (options) {
        for (var key in options) {
            this[key] = options[key];
        }
    }

    // 生成ressionid 用户唯一标识
    // 存在sessionId，则不进行更新
    if (!this.sessionId) {
        this.sessionId = generateId();
    }
}

/**
 * 创建RSession实例
 * @param  {Context} req 上下文
 * @param  {Object} obj 实例数据
 * @return {RSession}
 */
RSession.create = function (req, obj) {
    var ctx = new RSessionContext(req);

    return new RSession(ctx, obj);
};

/**
 * 序列化RSession对象
 * @param  {RSession} rs
 * @return {String}    rs序列化后的字符串
 */
RSession.serialize = function (rs) {
    return encode(rs);
};

RSession.deserialize = function (req, str) {
    var ctx = new RSessionContext(req),
        obj = decode(str);

    // 标识非新建（由反序列化得到）
    ctx._new = false;

    // 存放RSession序列化串
    ctx._val = str;

    return new RSession(ctx, obj);
};

/**
 * 保存RSession实例到Redis
 * @return {[type]} [description]
 */
RSession.prototype.save = function (res, redisCluster, secret, expires, cb) {
    var ctx = this._ctx,
        val = RSession.serialize(this);

    var sessionId = this.sessionId;

    // 只在值有变化时更新redis缓存内容
    if (ctx._val != val) {
        // 设置redis缓存
        redisCluster.set(sessionId, val, function(err, re) {
            if (err) {
                // throw Error(err);
                console.error('redis set error:', err);
            }
            if (cb) {
                cb();
            }
        });
    } else {
        if (cb) {
            cb();
        }
    }

    // 设置redis缓存时间
    redisCluster.expire(sessionId, expires);
};

/**
 * RSessionContext类封装
 * @param {Context} req ctx对象
 */
function RSessionContext(req) {
    this.req = req;
    this._new = true;
    this._val = undefined;
}

/**
 * 解码base64格式字符串为对象
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function decode(string) {
  var body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

/**
 * 将对象转化成base64编码的json字符串
 * @param  {[type]} obj [description]
 * @return {[type]}      [description]
 */
function encode(obj) {
  var str = JSON.stringify(obj);
  return new Buffer(str).toString('base64');
}

/**
 * 生成唯一的标识串
 * @return {[type]} [description]
 */
function generateId () {
    return 'qlwrsid:' + uuid.create();
}
