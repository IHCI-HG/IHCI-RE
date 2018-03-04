var errorHandler = require('errorhandler'),

    conf = require('../../conf'),
    server = require('../../server'),

    app,
    mode;

// 生产环境下，给出简要的错误信息
function handleProd(err, req, res, next) {
    var msg = err.stack;
    if (err.mod) {
        msg = '[' + err.mod + '] ' + msg;
    }
    console.error(msg);

    if (err.status) {
        res.statusCode = err.status;
    }

    // Todo  这里可以配置一些错误的处理

    res.end();
}

module.exports = function () {
    app = server.app;
    mode = conf.mode;

    return mode === 'production' ? handleProd : errorHandler();
};
