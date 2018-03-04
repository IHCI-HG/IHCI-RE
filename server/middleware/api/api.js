var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),
    express = require('express'),

    apiDir = '../../api',

    router = express.Router(),

    apiFiles = [],
    apis = [];

// 查找 API 文件
function fetchApi(p) {
    var _p = path.resolve(__dirname, p),
        stats = fs.statSync(_p);

    if (stats.isFile()) {
        if (/\.js$/.test(p)) {
            apiFiles.push(p.replace('.js', ''));
        }
    } else {
        var files = fs.readdirSync(_p);
        files.forEach(function (file) {
            fetchApi(p + '/' + file);
        });
    }
}

module.exports = function (opts) {
    var options = opts || {};

    var method, path, callback;

    fetchApi(apiDir);

    apiFiles.forEach(function (path) {
        var apiArray = require(path);
        if (_.isArray(apiArray)) {
            apiArray.forEach(function (o) {
                apis.push(o);
            });
        }
    });

    apis.sort(function (a, b) {
        var arr1 = a[1].split('/'),
            arr2 = b[1].split('/'),
            len = arr1.length > arr2.length ? arr1.length : arr2.length;
        if (arr1.length < arr2.length) {
            return -1;
        }
        for (var i = 0; i < len; i++) {
            var t1 = arr1[i],
                t2 = arr2[i];
            if (!t1) {
                return -1;
            } else if (!t2) {
                return 1;
            } else if (t1 !== t2) {
                if (t1.indexOf(':') === 0) {
                    return -1;
                } else if (t2.indexOf(':') === 0) {
                    return 1;
                } else {
                    return t1 < t2;
                }
            }
        }
    });

    apis.forEach(function (api) {
        if (!api) {
            return;
        }
        method = api[0].toLowerCase();
        path = api[1];
        let nextFuns = Array.prototype.slice.call(api, 2);
        router[method].apply(router, [path].concat(nextFuns));
        // logger.info('Handling API', method, path);
    });

    router.options = options || {};
    return router;
};
