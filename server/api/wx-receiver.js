var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
import lo from 'lodash';

var fs = require("fs")
var crypto = require('crypto');
const hash = crypto.createHash('sha1')

import apiAuth from '../middleware/auth/api-auth'


var wxReceiver = function(req, res, next) {
    // console.log('wxReceiver-body: ', req.body);

    const signature = req.query.signature
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const echostr = req.query.echostr

    const arr = [nonce, 'njjnjn', timestamp]
    arr.sort()

    const tStr = arr[0] + arr[1] + arr[2]
    hash.update(tStr)
    const hashResult = hash.digest('hex')

    if(hashResult == signature) {
        // 这是来自微信官方的消息
        console.log('wxReceiver-body: ', req.body);
    }

    console.log('wxReceiver-body: ', req.body);


    res.send(echostr)
};


module.exports = [
    ['GET', '/wxReceiver', wxReceiver],
    ['POST', '/wxReceiver', wxReceiver],

    // ['POST', '/api/update-head-img' , updateHeadImgUrl],
    
    // ['POST', '/api/update-head-img' ,apiAuth, updateUserInfo],
];
