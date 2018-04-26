var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../middleware/auth/api-auth'

var mongoose = require('mongoose')
var UserDB = mongoose.model('user')

var sysTime = function(req, res, next) {
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime()
        }
    });
};

const signUp = async (req, res, next) => {

    const userInfo = req.body.userInfo

    if(!userInfo.username || !userInfo.password) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全"},
            data: {}
        });
        return
    }

    const result = await UserDB.createUser(
        userInfo.username,
        userInfo.password,
    )

    if(!result) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "用户名已经存在"},
            data: {}
        });
        return
    }

    req.rSession.userId = result._id

    resProcessor.jsonp(req, res, {
        state: { code: 0, msg: "操作成功" },
        data: {
            userPo: result
        }
    });
}

const login = async (req, res, next) => {
    const username = lo.get(req, 'body.username')
    const password = lo.get(req, 'body.password')

    if(!username || !password) {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '参数不全'},
            data: {}
        });
        return
    }
    const result = await UserDB.authJudge(username, password)
    if(result) {
        req.rSession.userId = result._id
        resProcessor.jsonp(req, res, {
            state: { code: 0 },
            data: {
                sysTime: new Date().getTime(),
                userPo: result
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '账号或密码错误'},
            data: {}
        });
    }
}

const logout = async (req, res, next) => {
    req.rSession.userId = null

    resProcessor.jsonp(req, res, {
        state: { code: 0, msg: "登出成功" },
        data: {}
    });
}

const setUserInfo = async (req, res, next) => {
    const userId = req.rSession.userId
    const personInfoObj = {}
    if(req.body.headImg) {
        personInfoObj.headImg = req.body.headImg
    }
    if(req.body.name) {
        personInfoObj.name = req.body.name
    }
    if(req.body.phone) {
        personInfoObj.phone = req.body.phone
    }
    if(req.body.mail) {
        personInfoObj.mail = req.body.mail
    }
    const result = await UserDB.updateUser(userId, {
        personInfo: personInfoObj
    })
    if(result) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                result: result,
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '设置失败' },
            data: {}
        });
    }
}

const wxLogin = async (req, res, next) => {
    const code = lo.get(req, 'query.code')
    const state = lo.get(req, 'query.state')

    fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${conf.webAppId}&secret=${conf.webAppSe}&code=${code}&grant_type=authorization_code`)
    const data = await result.json()

    console.log(data);

    if(result) {
        // req.rSession.userId = result._id
        resProcessor.jsonp(req, res, {
            state: { code: 0 },
            data: {
                sysTime: new Date().getTime(),
                userPo: result
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '账号或密码错误'},
            data: {}
        });
    }
}


module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['POST', '/api/login', login],
    ['GET', '/wxLogin', wxLogin],

    ['POST', '/api/logout', apiAuth, logout],

    ['POST', '/api/signUp', signUp],
    ['POST', '/api/setUserInfo', apiAuth, setUserInfo]

];
