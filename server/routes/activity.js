var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    lo = require('lodash'),
    uuid = require('uuid'),

    clientParams = require('../middleware/client-params/client-params'),
    appAuth = require('../middleware/auth/1.0.0/app-auth'),
    wxAppAuth = require('../middleware/auth/1.0.0/wx-app-auth'),

    proxy = require('../components/proxy/proxy'),
    resProcessor = require('../components/res-processor/res-processor'),
    htmlProcessor = require('../components/html-processor/html-processor'),
    conf = require('../conf'),

    server = require('../server');

var wxAuth = require('../middleware/auth/1.0.0/wx-auth');
var actAuth = require('../middleware/auth/1.0.0/act-auth');
var querystring = require('querystring');

var activityApi = require('../api/activity');

var redis = server.getRedisCluster();

var mongoose = require('mongoose')
var TestDB = mongoose.model('test')

// 领书页面
async function address(req, res, next) {

    // const userId = lo.get(req, 'rSession.user.userId');
    // const activityCode = req.query.activityCode;

    // const params = {
    //     userId,
    //     activityCode,
    // }
    // const result = await proxy.parallelPromise([
    //     ['addressWriteNum', conf.activityApi.address.addressWriteNum, params, conf.activityApi.secret],
    //     ['myAddress', conf.activityApi.address.getAddressInfo, params, conf.activityApi.secret],
    //     ['configs', conf.activityApi.configs, {...params, type: "sendBook"}, conf.activityApi.secret],
    // ], req);

    // const addressWriteNum = lo.get(result, 'addressWriteNum.data.num', 1001) || 1001
    // const isHaveWrite = lo.get(result, 'myAddress.data.isHaveWrite', 'N') || 'N'
    // const myAddress = lo.get(result, 'myAddress.data.addressPo', {name: "", phone: "", address: ""}) || {name: "", phone: "", address: ""}
    // const defaultFontObject = {
    //     topFont: "",
    //     bottomFont: "",
    //     blankFont: "",
    //     maxGiveNum: 0,
    // }
    // const configList = lo.get(result, 'configs.data.dataList', []) || []
    // let fontObject = {}
    // configList.forEach((item) => {
    //     switch (item.code) {
    //         case "topFont":
    //             fontObject.topFont = item.remark || ""
    //             break;
    //         case "bottomFont":
    //             fontObject.bottomFont = item.remark || ""
    //             break;
    //         case "blankFont":
    //             fontObject.blankFont = item.remark || ""
    //             break;
    //         case "maxGiveNum":
    //             fontObject.maxGiveNum = item.remark || "0"
    //             break;
    //         default:
    //             break;
    //     }
    // })


    // if(addressWriteNum >= parseInt(fontObject.maxGiveNum) && isHaveWrite === 'N') {
    //     var filePath = path.resolve(__dirname, '../../public/activity/page/address/full.html'),
    //     options = {
    //         filePath: filePath,
    //         fillVars: {},
    //         renderData: { blankFont: fontObject.blankFont},
    //     };
    // } else {
    //     var filePath = path.resolve(__dirname, '../../public/activity/page/address/address.html'),
    //     options = {
    //         filePath: filePath,
    //         fillVars: {
    //             ...myAddress,
    //             bottomFont: fontObject.bottomFont,
    //         },
    //         renderData: {
    //             topFont: fontObject.topFont,
    //             // bottomFont: fontObject.bottomFont.replace("\n", "</br>"),
    //         },
    //     };
    // }

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


module.exports = [
    // ['GET', '/wechat/page/activity/address', clientParams(), appAuth(), wxAuth(), address],
    ['GET', '/wechat/page/activity/address', clientParams(), address],
];
