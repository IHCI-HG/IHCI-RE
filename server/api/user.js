var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');


import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'


import { pub_pushTemplateMsg } from '../components/wx-utils/wx-utils'

import {
    web_codeToAccessToken,
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
} from '../components/wx-utils/wx-utils'

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
        userInfo
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

    console.log("..................................");
    console.log(req);
    console.log("..................................");

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

const getMyInfo = async (req, res, next) => {
    const userID = req.rSession.userId
    const result = await UserDB.findByUserId(userID)
    if(result) {
        result.password = undefined
        resProcessor.jsonp(req, res, {
            state: { code: 0 },
            data: result
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '未知错误'},
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
    const userId = lo.get(req, 'rSession.userId')

    try {
        const result = await web_codeToAccessToken(code)
        if (state == 'bind') {
            if(result.access_token && result.openid && result.unionid) {

                // 如果该微信号已经绑定，则无法继续绑定
                const findUser = await UserDB.findByUnionId(result.unionid)
                if(findUser) {
                    res.redirect('/person?alreadyBind=Y');
                    return
                }

                const userInfo = await web_accessTokenToUserInfo(result.access_token, result.openid)
                const userDBresult = await UserDB.updateUser(userId, {
                    unionid: result.unionid,
                    wxUserInfo: userInfo,
                })
                res.redirect('/person');
            } else {
                // 由于某些原因绑定失败
                res.redirect('/person?fail=true');
            }
        }

        if(state == 'auth') {
            if(result.unionid) {
                const userObj = await UserDB.findByUnionId(result.unionid)
                if(userObj) {
                    req.rSession.userId = userObj._id
                    res.redirect('/team');
                } else {
                    res.redirect('/sign');
                }
            } else {
                // 由于某些原因授权失败
                res.redirect('/?fail=true');
            }
        }

    } catch (error) {
        console.error(error);
    }
}

const unbindWechat = async (req, res, next) => {
    const userId = req.rSession.userId
    try {
        const result = await UserDB.updateUser(userId, {
            unionid: '',
            openid: '',
            subState: false,
        })
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                result: result,
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '解绑失败' },
            data: {}
        });
        console.error(error)
    }
}


const userInfoList = async (req, res, next) => {

    const userList = req.body.userList
    const resultPromiseList = []

    if(!userList || !userList.length) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数有误" },
            data: {}
        });
        return
    }

    try {
        userList.map((item) => {
            resultPromiseList.push(UserDB.baseInfoById(item))
        })
        const resultList = await Promise.all(resultPromiseList)

        if(resultList) {
            resProcessor.jsonp(req, res, {
                state: { code: 0 },
                data: resultList
            });
        } else {
            resProcessor.jsonp(req, res, {
                state: { code: 1 , msg: '找不到'},
                data: {}
            });
        }
    } catch (error) {
        console.log(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '有问题的userID'},
            data: {}
        });
    }

}


module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['GET', '/api/getMyInfo',apiAuth, getMyInfo],
    ['POST', '/api/userInfoList',apiAuth, userInfoList],

    ['POST', '/api/login', login],
    ['GET', '/wxLogin', wxLogin],

    ['POST', '/api/logout', apiAuth, logout],

    ['POST', '/api/unbindWechat', apiAuth, unbindWechat],

    ['POST', '/api/signUp', signUp],
    ['POST', '/api/setUserInfo', apiAuth, setUserInfo],

];
