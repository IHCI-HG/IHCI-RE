var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf'),
    envi = require('../components/envi/envi');
const crypto = require('crypto-js');
const {
    sendNewSMS,
    sendPwd
} = require('../components/sms/sms');

import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

import {
    web_codeToAccessToken,
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
    pub_openidToUserInfo,
    pub_pushTemplateMsg
} from '../components/wx-utils/wx-utils'

import {
    set,
    get,
    del
} from '../middleware/redis/redis'

const Captcha = require("../middleware/captcha/captcha")

var mongoose = require('mongoose')
var teamDB = mongoose.model('team')
var UserDB = mongoose.model('user')
var SMS = mongoose.model('sms')
var followerDB = mongoose.model('follower')
const sortByCreateTime = function (a, b) {
    return b.create_time - a.create_time
}
var sysTime = function (req, res, next) {
    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: {
            sysTime: new Date().getTime()
        }
    });
};

const createSMS = async (req, res) => {
    const typeMap = {
        'isv.MOBILE_NUMBER_ILLEGAL': '手机号不正确',
        'isv.BLACK_KEY_CONTROL_LIMIT':'黑名单管控',
        'isv.BUSINESS_LIMIT_CONTROL':'同一手机号发送次数过多'
    }

    const phoneNumber = req.body.phoneNumber
    const result = await get(phoneNumber)
    
    var code
    try{
    if (result) {   
        code = await sendNewSMS(phoneNumber, result)
    } else {
        code = await sendNewSMS(phoneNumber)
    }
   }catch(err){

            resProcessor.jsonp(req, res, {
                state: {
                    code: 1,
                    msg:typeMap[err.code]
                },
                data: {}
            });
            
       return
   }

    await set(phoneNumber, code)
    

    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: {}
    });
}



const createCaptcha = async (req, res) => {
    const captcha = Captcha.generateCaptcha()
    resProcessor.jsonp(req, res, {
        state: {
            code: 0,
            msg: "操作成功"
        },
        data: {
            img: captcha.data,
            text: captcha.text
        }
    });

}


const modifyPassword = async (req, res) => {
    const username = req.body.username
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword

    if (!username || !oldPassword || !newPassword) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: '参数不全'
            },
            data: {}
        });
        return
    }
    if (oldPassword === newPassword) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '新老密码一样'
            },
            data: {}
        });
        return
    }

    const result = await UserDB.authJudge(username, oldPassword)

    if (result) {
        const result = await UserDB.updatePassword(username, newPassword)
        if (result) {
            resProcessor.jsonp(req, res, {
                state: {
                    code: 0,
                    msg: '修改成功'
                },
                data: {}
            });
        }
    } else {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '原密码错误'
            },
            data: {}
        });
    }


}

const forgotPassword = async (req, res) => {
    const username = req.body.phone
    const smsCode = req.body.code
    const password = req.body.password

    if (!username || !smsCode || !password) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: '参数不全'
            },
            data: {}
        });
        return
    }
    const code = await get(username)
    if (smsCode !== code) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '验证码错误'
            },
            data: {}
        });
        return
    }
    //删除验证码
    await del(username)
    const result = await UserDB.updatePassword(username, password)
    if (result) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '修改成功'
            },
            data: {}
        });
    }

}

const signUp = async (req, res, next) => {
    const userInfo = req.body.userInfo
    if (!userInfo.username || !userInfo.password || !userInfo.code || !userInfo.nickname) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: "参数不全"
            },
            data: {}
        });
        return
    }
    const code = await get(userInfo.username)
    if (userInfo.code !== code) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: "验证码错误"
            },
            data: {}
        });
        return
    }
    userInfo.personInfo = {}
    await del(userInfo.username)
    const result = await UserDB.createUser(
        userInfo.username,
        userInfo.password,
        userInfo,
    )
    if (!result) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: "用户名已经存在"
            },
            data: {}
        });
        return
    }

    req.rSession.userId = result._id

    resProcessor.jsonp(req, res, {
        state: {
            code: 0,
            msg: "操作成功"
        },
        data: {
            userPo: result
        }
    });
}

const fillUsernameAndPwd = async (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    const userId = req.rSession.userId
    if (!username || !password) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: "参数不全"
            },
            data: {}
        });
        return
    }
    const result = await UserDB.updateUser(userId, {
        username: username,
        password: crypto.SHA256(password).toString()
    })
    if (!result) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: "用户名已经存在"
            },
            data: {}
        });
        return
    }

    req.rSession.userId = result._id

    resProcessor.jsonp(req, res, {
        state: {
            code: 0,
            msg: "操作成功"
        },
        data: {
            userPo: result
        }
    });
}

const login = async (req, res, next) => {

    const username = lo.get(req, 'body.username')
    const password = lo.get(req, 'body.password')

    if (!username || !password) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: '参数不全'
            },
            data: {}
        });
        return
    }
    const result = await UserDB.authJudge(username, password)
    if (result) {
        req.rSession.userId = result._id
        resProcessor.jsonp(req, res, {
            state: {
                code: 0
            },
            data: {
                sysTime: new Date().getTime(),
                userPo: result
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '账号或密码错误'
            },
            data: {}
        });
    }
}

const loginAndBindWx = async (req, res, next) => {

    const username = lo.get(req, 'body.username')
    const password = lo.get(req, 'body.password')
    const openid = lo.get(req, 'body.openid')
    if (!username || !password || !openid) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: '参数不全'
            },
            data: {}
        });
        return
    }
    const result = await UserDB.authJudge(username, password)

    if (result) {
        const wxUserInfo = await pub_openidToUserInfo(openid)
        const result1 = (await UserDB.findByUsername(username)).toObject()
        var userId = result1._id
        result1.unionid = wxUserInfo.unionid
        result1.wxUserInfo = wxUserInfo
        const result2 = await UserDB.updateUser(userId, result1)
        const flag = await IfBeforeSub(userId, wxUserInfo.unionid)
        req.rSession.userId = userId
        resProcessor.jsonp(req, res, {
            state: {
                code: 0
            },
            data: {
                sysTime: new Date().getTime(),
                userPo: result2
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '账号或密码错误'
            },
            data: {}
        });
    }
}

const getMyInfo = async (req, res, next) => {
    const userID = req.rSession.userId
    const result = await UserDB.findByUserId(userID)


    if (result) {
        result.password = undefined
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '请求成功'
            },
            //data: { teamObj:result }
            data: {
                userObj: result
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '操作失败'
            },
            data: {}
        });
    }
}

const getUserInfo = async (req, res, next) => {
    const userID = req.body.userId
    if (!userID) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: '参数不全'
            },
            data: {}
        });
        return
    }
    try {
        const result = await UserDB.findByUserId(userID)

        resProcessor.jsonp(req, res, {
            state: {
                code: 0
            },
            data: {
                userObj: result
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '未知错误'
            },
            data: {}
        });
    }
}

const logout = async (req, res, next) => {
    req.rSession.userId = null

    resProcessor.jsonp(req, res, {
        state: {
            code: 0,
            msg: "登出成功"
        },
        data: {}
    });
}

const setUserInfo = async (req, res, next) => {
    const userId = req.rSession.userId
    const user = await UserDB.findByUserId(userId)
    const personInfoObj = {}
    if (req.body.headImg) {
        personInfoObj.headImg = req.body.headImg
    }
    if (req.body.name) {
        personInfoObj.name = req.body.name
    }

    if (req.body.mail) {
        personInfoObj.mail = req.body.mail
        if (user.personInfo != null && !(req.body.mail == user.personInfo.mail)) {
            const result = await UserDB.findByIdAndUpdate({
                _id: userId
            }, {
                isLive: false
            }, {
                new: true
            })
        }
    }
    const result = await UserDB.updateUser(userId, {
        personInfo: personInfoObj
    })
    if (result) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '设置成功'
            },
            data: {
                result: result,
            }
        });
    } else {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '设置失败'
            },
            data: {}
        });
    }
}

const IfBeforeSub = async function (userId, unionid) {

    const result = await followerDB.findByUnionId(unionid)
    if (result) {
        const userObj = await UserDB.updateUser(userId, {
            openid: result.openid,
        })
        return true
    }
}


const wxLogin = async (req, res, next) => {
    const code = lo.get(req, 'query.code')
    const state = lo.get(req, 'query.state')
    const userId = lo.get(req, 'rSession.userId')
    try {
        const result = await web_codeToAccessToken(code)
        if (state == 'bind') {
            if (result.access_token && result.openid && result.unionid) {

                // 如果该微信号已经绑定，则无法继续绑定
                const findUser = await UserDB.findByUnionId(result.unionid)
                if (findUser) {
                    res.redirect('/person?alreadyBind=Y');
                    return
                }

                const userInfo = await web_accessTokenToUserInfo(result.access_token, result.openid)
                const userDBresult = await UserDB.updateUser(userId, {
                    unionid: result.unionid,
                    wxUserInfo: userInfo,
                })
                //检查是否已经关注服务号
                const flag = await IfBeforeSub(userId, result.unionid)
                res.redirect('/person');
            } else {
                // 由于某些原因绑定失败
                res.redirect('/person?fail=true');
            }
        }

        if (state == 'auth') {
            if (result.unionid) {
                const unionid = result.unionid
                const userObj = await UserDB.findByUnionId(result.unionid)
                const userInfo = await web_accessTokenToUserInfo(result.access_token, result.openid)
                if (userObj) {
                    req.rSession.userId = userObj._id
                    res.redirect('/team');
                } else {
                    const result = await UserDB.createUser(null, null, {
                        unionid: unionid,
                        wxUserInfo: userInfo,
                    })
                    req.rSession.userId = result._id
                    const flag = await IfBeforeSub(result._id, unionid)
                    res.redirect('/person');
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
            wxUserInfo: null,
        })
        if (envi.isWeixin(req) && result.unionid === '') {
            req.rSession.userId = undefined
        }
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '设置成功'
            },
            data: {
                result: result,
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '解绑失败'
            },
            data: {}
        });
        console.error(error)
    }
}


const userInfoList = async (req, res, next) => {

    const userList = req.body.userList
    const resultPromiseList = []

    if (!userList || !userList.length) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: "参数有误"
            },
            data: {}
        });
        return
    }

    try {
        userList.map((item) => {
            resultPromiseList.push(UserDB.baseInfoById(item))
        })
        const resultList = await Promise.all(resultPromiseList)

        if (resultList) {
            resProcessor.jsonp(req, res, {
                state: {
                    code: 0
                },
                data: resultList
            });
        } else {
            resProcessor.jsonp(req, res, {
                state: {
                    code: 1000,
                    msg: '找不到'
                },
                data: {}
            });
        }
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: {
                code: 1,
                msg: '有问题的userID'
            },
            data: {}
        });
    }

}


// const showNoticeList = async (req, res, next) => {

//     const topicIdList = req.body.topicIdList

//     if(!topicIdList || !topicIdList.length) {
//         resProcessor.jsonp(req, res, {
//             state: { code: 1, msg: "参数不全" },
//             data: {}
//         });
//         return
//     }

//     try {
//         const promiseList = []
//         topicIdList.map((item) => {
//             if(item)
//             promiseList.push(topicDB.findByTopicId(item))
//         })
//         const result = await Promise.all(promiseList)
//         resProcessor.jsonp(req, res, {
//             state: { code: 0, msg: '请求成功' },
//             data: result
//         });
//     } catch (error) {
//         console.error(error);
//         resProcessor.jsonp(req, res, {
//             state: { code: 1, msg: '操作失败' },
//             data: {}
//         });
//     }
//
//}


const showReadList = async (req, res, next) => {
    const userId = req.rSession.userId
    const timeStamp = req.body.timeStamp
    const result = []

    const userObj = await UserDB.findById(userId)

    // const result = await UserDB.findReadNotice(userObj)

    userObj.noticeList.map((item) => {
        if (item.readState) {
            result.push(item)
        }
    })
    result.sort(sortByCreateTime)

    const Result = []

    if (!timeStamp) {
        result.map((item, index) => {
            if (index < 20) {
                Result.push(item)
            }
        })
    } else {
        result.map((item) => {
            if (Result.length < 10 && item.create_time < timeStamp) {
                Result.push(item)
            }
        })
    }
    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: Result
    });

}

const showUnreadList = async (req, res, next) => {
    const userId = req.rSession.userId
    const timeStamp = req.body.timeStamp
    const result = []


    const userObj = await UserDB.findById(userId)

    // const result = await UserDB.findUnreadNotice(userId)

    userObj.noticeList.map((item) => {
        if (!item.readState) {
            result.push(item)
        }
    })
    //  result = db.result1.find().sort({create_time: -1}
    result.sort(sortByCreateTime)
    const Result = []

    if (!timeStamp) {
        result.map((item, index) => {
            if (index < 20) {
                Result.push(item)
            }
        })
    } else {
        result.map((item) => {
            if (Result.length < 10 && item.create_time < timeStamp) {
                Result.push(item)
            }
        })
    }
    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: Result
    });

}

const readNotice = async (req, res, next) => {
    const userId = req.rSession.userId
    const noticeId = req.body.noticeId
    const readState = req.body.readState

    const result = await UserDB.readNotice(userId, noticeId, readState)

    //  const Result = await UserDB.findNotice( userId,noticeId)

    resProcessor.jsonp(req, res, {
        state: {
            code: 0
        },
        data: {}
    });
}
const readNoticeArray = async (req, res, next) => {

    const userId = req.rSession.userId
    const isReadNoticeArray = req.body.isReadNoticeArray
    try {
        for (let i = 0; i < isReadNoticeArray.length; i++) {
            await UserDB.readNotice(userId, isReadNoticeArray[i], true)
        }
    } catch (err) {
        console.error(err)
    }

}

const wxEnter = async (req, res, next) => {
    const openid = req.body.openid
    const personInfo = {
        name: req.body.name,
        phone: req.body.phone,
        code: req.body.code
    }
    if (!openid || !personInfo.name || !personInfo.phone || !personInfo.code) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 3000,
                msg: "参数不全"
            },
            data: {}
        });
        return
    }
    const code = await get(personInfo.phone)

    if (personInfo.code !== code) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: "验证码错误"
            },
            data: {}
        });
        return
    }
    try {
        await del(personInfo.phone)
        const pwd = await sendPwd(personInfo.phone)
        var result1 = await pub_openidToUserInfo(openid)
        const result2 = await UserDB.createUser(personInfo.phone, pwd, {
            unionid: result1.unionid,
            wxUserInfo: result1,
            personInfo: {
                ...personInfo,
                headImg: result1.headimgurl
            }
        })
        const findUser = await UserDB.findByUnionId(result1.unionid)
        if (findUser) {
            const flag = await IfBeforeSub(findUser._id, result1.unionid)
            req.rSession.userId = findUser._id
        }

        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '登陆成功'
            },
            data: {
                result: result2,
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: {
                code: 1000,
                msg: '登陆失败'
            },
            data: {}
        });
        console.error(error)
    }
}

const permissionJudge = async(req,res,next) =>{
    const teamId = req.body.teamId
    const permission = req.body.permission
    const userId = req.rSession.userId
    const permissionList = req.rSession[userId][teamId]
    console.log(permissionList)
    if(permissionList.indexOf(permission) !== -1){
        resProcessor.jsonp(req, res, {
            state: {
                code: 1,
                msg: '拥有权限'
            },
            data: {}
        });
    }else{
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '未拥有该权限'
            },
            data: {}
        });
    }

}

const getPermissionJudgeList = async(req,res,next) =>{
    const teamId = req.body.teamId
    const userId = req.rSession.userId
    const permissionList = req.rSession[userId][teamId]
    console.log(permissionList)
    if(permissionList){
        resProcessor.jsonp(req, res, {
            state: {
                code: 1,
                msg: ''
            },
            data: {
                permissionList
            }
        });
    }else{
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '未找到权限列表'
            },
            data: {
            }
        });
    }
}


const userRightsServiceOpen = async(req,res,next) =>{
    console.log('come in !!!')
    if(req.rSession['userRights']){
        resProcessor.jsonp(req, res, {
            state: {
                code: 0,
                msg: '权限管理服务器开'
            },
            data: {
            }
        });
    }else{
        resProcessor.jsonp(req, res, {
            state: {
                code: -1,
                msg: '权限管理服务器关'
            },
            data: {
            }
        }); 
    }
}

module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['POST', '/api/createSMS', createSMS],

    ['POST', '/api/createCaptcha', createCaptcha],

    ['POST', '/api/forgotPassword', forgotPassword],
    ['POST', '/api/modifyPassword', modifyPassword],

    ['POST', '/api/getMyInfo', apiAuth, getMyInfo],
    ['POST', '/api/getUserInfo', apiAuth, getUserInfo],
    ['POST', '/api/userInfoList', apiAuth, userInfoList],

    ['POST', '/api/modifyPassword', modifyPassword],
    ['POST', '/api/forgotPassword', forgotPassword],


    ['POST', '/api/login', login],
    ['GET', '/wxLogin', wxLogin],

    ['POST', '/api/logout', apiAuth, logout],
    ['POST', '/api/unbindWechat', apiAuth, unbindWechat],

    ['POST', '/api/signUp', signUp],
    ['POST', '/api/setUserInfo', apiAuth, setUserInfo],


    ['POST', '/api/user/showReadList', apiAuth, showReadList],
    ['POST', '/api/user/showUnreadList', apiAuth, showUnreadList],

    ['POST', '/api/user/readNotice', apiAuth, readNotice],
    ['POST', '/api/user/readNoticeArray', apiAuth, readNoticeArray],
    //['POST', '/api/user/getUserId', apiAuth, getUserId],
    ['POST', '/api/user/loginAndBindWx', loginAndBindWx],
    ['POST', '/api/user/fillUsernameAndPwd', apiAuth, fillUsernameAndPwd],
    ['POST', '/api/user/wxEnter', wxEnter],

    ['POST','/api/permissionJudge',permissionJudge],
    ['POST','/api/permissionJudgeList',getPermissionJudgeList],
    ['POST','/api/userRightsServiceOpen',userRightsServiceOpen]
];
