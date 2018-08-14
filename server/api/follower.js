var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
import lo from 'lodash';

var fs = require("fs")
var crypto = require('crypto');
const hash = crypto.createHash('sha1')

import apiAuth from '../components/auth/api-auth'

import {
    pub_openidToUserInfo,
    pub_accessTokenToFollowerList
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')
var UserDB = mongoose.model('user')
var followerDB = mongoose.model('follower')


var follower = async function(req, res, next) {

    await followerDB.remove()     
    const followerList = await pub_accessTokenToFollowerList()
    console.log("这是关注列表：", followerList)
    followerList.data.openid.map(async (item)=>{
         const follower = await pub_openidToUserInfo(item)    
         const result = await followerDB.createFollower(item, follower.unionid) 
         console.log("这是结果", result)
    })

}


module.exports = [
    // ['GET', '/follower', follower],
    ['POST', '/follower', follower],
];
