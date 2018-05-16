var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
import lo from 'lodash';

var fs = require("fs")
var crypto = require('crypto');
const hash = crypto.createHash('sha1')

import apiAuth from '../middleware/auth/api-auth'

import {
    pub_openidToUserInfo,
    pub_pushTemplateMsg
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')
var UserDB = mongoose.model('user')

var subscribeEventHandle = async (openid) => {
    // 获取用户信息(拿uid)
    // 用uid查用户表（查到了 -》 添加uid, 改sub状态 -》发模板）
    try {
        const wxUserInfo = await pub_openidToUserInfo(openid)
        if(wxUserInfo && wxUserInfo.unionid) {
            const userObj = await UserDB.findByUnionId(wxUserInfo.unionid)
            if(userObj) {
                UserDB.updateUser(userObj._id, {
                    openid: wxUserInfo.openid,
                    subState: true
                })
            } 
            pub_pushTemplateMsg(openid, 'p6pZBXX0SaqODRDZgY_3NqyIAK0mYN9HXYq6yMLyA04', 'www.animita.cn', {
                "first": {
                    "value":"关注服务号成功",
                    "color":"#173177"
                },
                "keyword1":{
                    "value":"消息1",
                    "color":"#173177"
                },
                "keyword2": {
                    "value":"消息2",
                    "color":"#173177"
                },
                "keyword3": {
                    "value":"消息3",
                    "color":"#173177"
                },
                "remark":{
                    "value":"",
                    "color":"#173177"
                }
        })
        }
    } catch (error) {
        console.error(error);
    }

}

var unsubscribeEventHandle = () => {
    // 获取用户信息(拿uid)
    // 用uid查用户表 -》 改sub状态
    try {
        const wxUserInfo = await pub_openidToUserInfo(openid)
        if(wxUserInfo && wxUserInfo.unionid) {
            const userObj = await UserDB.findByUnionId(wxUserInfo.unionid)
            if(userObj) {
                UserDB.updateUser(userObj._id, {
                    openid: wxUserInfo.openid,
                    subState: false
                })
            } 
        }
    } catch (error) {
        console.error(error);
    }
}

var wxReceiver = function(req, res, next) {
    // console.log('wxReceiver-body: ', req.body);

    // const signature = req.query.signature
    // const timestamp = req.query.timestamp
    // const nonce = req.query.nonce
    // const echostr = req.query.echostr

    // const arr = [nonce, 'njjnjn', timestamp]
    // arr.sort()

    // const tStr = arr[0] + arr[1] + arr[2]
    // hash.update(tStr)
    // const hashResult = hash.digest('hex')

    // if(hashResult == signature) {
    //     // 这是来自微信官方的消息
    //     console.log('wxReceiver-body: ', req.body);
    // }


    // wxReceiver-body:  { xml:
    //     { tousername: [ 'gh_15a5ec8f6116' ],
    //       fromusername: [ 'oC9vJwnxrquE5Ss2PEL49TX-3hpI' ],
    //       createtime: [ '1526454546' ],
    //       msgtype: [ 'event' ],
    //       event: [ 'unsubscribe' ],
    //       eventkey: [ '' ] } }
    //  wxReceiver-body:  { xml:
    //     { tousername: [ 'gh_15a5ec8f6116' ],
    //       fromusername: [ 'oC9vJwnxrquE5Ss2PEL49TX-3hpI' ],
    //       createtime: [ '1526454558' ],
    //       msgtype: [ 'event' ],
    //       event: [ 'subscribe' ],
    //       eventkey: [ '' ] } } 

    const msgtype = req.body.xml && req.body.xml.msgtype[0]

    switch (msgtype) {
        case 'subscribe':

            break;
        case 'unsubscribe':
            
            break;
        default:
            break;
    }

    console.log('wxReceiver-body: ', req.body);

    if(req.query.echostr) {
        res.send(req.query.echostr)
    } 
};


module.exports = [
    ['GET', '/wxReceiver', wxReceiver],
    ['POST', '/wxReceiver', wxReceiver],

    // ['POST', '/api/update-head-img' , updateHeadImgUrl],
    
    // ['POST', '/api/update-head-img' ,apiAuth, updateUserInfo],
];
