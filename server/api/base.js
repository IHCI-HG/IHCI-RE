var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
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

    const result = UserDB.authJudge(username, password)

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

const signUp = async (req, res, next) => {
    const userInfo = lo.get(req, 'body.userInfo', {})
    if(!userInfo || !userInfo.username || !userInfo.password) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全"},
            data: {}
        });
        return
    }
    const result = await UserDB.createUser(
        userInfo.username,
        userInfo.password,
        userInfo,
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

const logOut = async (req, res, next) => {
    req.rSession.userId = null
    resProcessor.jsonp(req, res, {
        state: { code: 0, msg: "登出成功" },
        data: {}
    });
}

const updateHeadImgUrl = async (req, res, next) => {
    const userId = req.rSession.userId
    const imgUrl = lo.get(req, 'body.headImgUrl')
    const result = await UserDB.updateHeadImgUrl(userId, Math.random().toString())
    if(result) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '操作成功' },
            data: {}
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const updateUserInfo = async (req, res, next) => {
    const result = await UserDB.updateHeadImgUrl(req.query.id || "5aa77aa0e71aa72584bdad44", Math.random().toString())

    if(result.ok == 1) {
        // 真的OK了
    } else {
        // 失败了
    }

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            result: result,
        }
    });
}

module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['POST', '/api/login', login],

    ['POST', '/api/sign-up', signUp],

    ['POST', '/api/logout', logOut],
    
    ['POST', '/api/update-head-img' ,apiAuth, updateHeadImgUrl],
    
    ['POST', '/api/update-head-img' ,apiAuth, updateUserInfo],
];
