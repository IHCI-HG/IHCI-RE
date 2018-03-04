
var express = require('express'),
    router = express.Router(),

    fs = require('fs'),
    path = require('path'),

    _ = require('underscore');

/**
 * 路由中间件，按目录文件管理路由，简化路由配置
 * @param  {String} routesPath 存放路由配置的目录
 * @param  {Object} options    router配置选项
 * @return {Object}            router
 */
module.exports = function (routesPath, options) {
    var routes = [],
        filesPath = [];

    // 获取路由路径下所有路由js路径
    (function (p) {
        var fileStat = fs.statSync(p),
            selfFun = arguments.callee;

        if (fileStat.isFile()) {
            if (/\.js$/.test(p)) {
                filesPath.push(p.replace('.js', ''));
            }
        } else {
            fs.readdirSync(p).forEach(function (f) {
                selfFun(p + '/' + f);
            });
        }

        p = null;
    })(routesPath);

    // 拿到路由配置
    _.each(filesPath, function (fp) {
        var routeConf = require(fp);
        if (_.isArray(routeConf)) {
            _.each(routeConf, function (route) {
                routes.push(route);
            });
        }
    });

    routes.sort(function(r1, r2) {
        if (!_.isArray(r1) || !r1.length) {
            return 1;
        }

        if (!_.isArray(r2) || !r2.length) {
            return -1;
        }

        if ('number' === typeof r1[0]) {
            if ('number' === typeof r2[0]) {
                return r1[0] - r2[0] >= 0? 1: -1;
            }

            return -1;
        }

        if ('number' === typeof r2[0]) {
            if ('number' === typeof r1[0]) {
                return r1[0] - r2[0] >= 0? 1: -1;
            }

            return 1;
        }

        return 0;
    });

    // 注册路由
    _.each(routes, function (r) {
        if (_.isArray(r) && r.length > 1) {
            var method,
                path,
                nextFuns;

            method = r[0];

            if ('number' === typeof method && r.length > 2) {
                method = r[1].toLowerCase();
                path = r[2];
                nextFuns = Array.prototype.slice.call(r, 3);
            } else {
                method = r[0].toLowerCase(),
                path = r[1],
                nextFuns = Array.prototype.slice.call(r, 2);
            }

            if (_.isFunction(router[method])) {
                // console.log(method, path, nextFuns);
                router[method].apply(router, [path].concat(nextFuns));
            }
        }
    });

    // 路由选项配置
    if (options) {
        router.options = options;
    }

    return router;
};
