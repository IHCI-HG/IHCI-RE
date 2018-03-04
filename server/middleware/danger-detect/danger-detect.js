var server = require('../../server'),
    conf = require('../../conf'),

    danger = require('./danger'),
    isXSS = danger.isXSS,

    app;

// 判断是否坏蛋
function detect(req, res) {
    return isXSS(req);
}

module.exports = function () {
    app = server.app;
    
    return function (req, res, next) {
        var isDanger = detect(req, res);
        if (isDanger) {
            console.log('DANGER URL:', req.originalUrl);
            res.status(403).send('<h1>403</h1><h2>You win!</h2>');
        } else {
            next();
        }
    };
};