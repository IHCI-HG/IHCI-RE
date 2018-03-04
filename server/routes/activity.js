var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    lo = require('lodash'),
    uuid = require('uuid'),

    clientParams = require('../middleware/client-params/client-params'),

    proxy = require('../components/proxy/proxy'),
    resProcessor = require('../components/res-processor/res-processor'),
    htmlProcessor = require('../components/html-processor/html-processor'),
    conf = require('../conf'),

    server = require('../server');


var querystring = require('querystring');

var activityApi = require('../api/activity');

var redis = server.getRedisCluster();

var mongoose = require('mongoose')
var TestDB = mongoose.model('test')

// 领书页面
async function address(req, res, next) {

    TestDB.check('588', '38fc40d19ed30da98d10d9b0eda744101311d8c3').then((e) => {
        console.log(e);
    })

    var filePath = path.resolve(__dirname, '../../public/activity/page/address/full.html'),
    options = {
        filePath: filePath,
        fillVars: {},
        renderData: { blankFont: ""},
    };
    htmlProcessor(req, res, next, options);
}

const test = async (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../public/activity-react/complaint.html');

    const options = {
        filePath,
        fillVars: {
            INIT_DATA: {
            }
        },
        renderData: {},
    };

    req.rSession.expires = 10;
    req.rSession.noRobot = true;
    req.rSession.count = req.rSession.count + 1 || 1

    console.log(req.rSession);
    
    htmlProcessor(req, res, next, options)
}

module.exports = [
    ['GET', '/wechat/page/activity/address', clientParams(), address],
    ['GET', '/test', clientParams(), test],
];
