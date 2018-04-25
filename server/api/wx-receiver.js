var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
import lo from 'lodash';

var fs = require("fs")

import apiAuth from '../middleware/auth/api-auth'


var wxReceiver = function(req, res, next) {
    console.log(req.body);
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime()
        }
    });
};


module.exports = [
    ['GET', '/wxReceiver', wxReceiver],

    // ['POST', '/api/update-head-img' , updateHeadImgUrl],
    
    // ['POST', '/api/update-head-img' ,apiAuth, updateUserInfo],
];
