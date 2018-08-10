var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf'),
    envi = require('../components/envi/envi');
const crypto = require('crypto-js');


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
var followerDB = mongoose.model('follower')
const sortByCreateTime = function(a,b){
    return b.create_time-a.create_time
 }
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

const signUpAndBindWx = async (req, res, next) => {
    const userInfo = req.body.userInfo
    const userId = req.rSession.userId
    if(!userInfo.username || !userInfo.password || !userInfo.unionid) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全"},
            data: {}
        });
        return
    }
    const findUser = await UserDB.findByUnionId(userInfo.unionid)
    const result = await UserDB.updateUser(userId,{
        username: userInfo.username,
        password: crypto.SHA256(userInfo.password).toString()
    })
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

const loginAndBindWx = async (req, res, next) => {

    const username = lo.get(req, 'body.username')
    const password = lo.get(req, 'body.password')
    const unionid = lo.get(req, 'body.unionid')
    if(!username || !password || !unionid) {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '参数不全'},
            data: {}
        });
        return
    }
    const result = await UserDB.authJudge(username, password)
    
    if(result) {
        const findResult = await UserDB.findByUnionId(unionid)
        const wxUserId = findResult._id
        const userDBresult = await UserDB.delUserById(wxUserId)
        const result1 = (await UserDB.findByUsername(username)).toObject()
        result1.username = username
        result1.password = password
        result1.unionid = unionid
        result1.wxUserInfo = findResult.wxUserInfo
        result1.noticeList = [...result1.noticeList, ...findResult.noticeList]
        result1.teamList = [...result1.teamList, ...findResult.teamList]
        var userId = result1._id.toString()
        delete result1._id
        await UserDB.updateUser(userId,result1)    
        req.rSession.userId = userId
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

const getUserInfo = async (req, res, next) => {
    const userID = req.body.userId
    if(!userID) {
        resProcessor.jsonp(req, res, {
            state: { code: 1 , msg: '参数不全'},
            data: {}
        });
        return 
    }
    try{
    const result = await UserDB.findByUserId(userID)
    
        resProcessor.jsonp(req, res, {
            state: { code: 0 },
            data: result
        });
    } catch (error){
        resProcessor.jsonp(req, res, {
            state: { code: 2 , msg: '未知错误'},
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
    const user = await UserDB.findByUserId(userId)
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
        if(user.personInfo!=null && !(req.body.mail==user.personInfo.mail)){
            const result = await UserDB.findByIdAndUpdate({_id: userId}, {isLive: false}, {new: true})
        }
    }
    const result = await UserDB.updateUser(userId, {
        personInfo: personInfoObj
    })
    console.log(result)
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

const IfBeforeSub = async function(userId, unionid){
    const result = await followerDB.findByUnionId(unionid)
    if(result){
       const userObj = await UserDB.updateUser(userId, {
            openid: result.openid,
            subState: true
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
                //检查是否已经关注服务号
                const flag = await IfBeforeSub(userId, result.unionid)
                res.redirect('/person');
            } else {
                // 由于某些原因绑定失败
                res.redirect('/person?fail=true');
            }
        }

        if(state == 'auth') {
            if(result.unionid) {
                const unionid = result.unionid
                const userObj = await UserDB.findByUnionId(result.unionid)
                const userInfo = await web_accessTokenToUserInfo(result.access_token, result.openid)
                if(userObj) {
                    req.rSession.userId = userObj._id
                    res.redirect('/team');
                } else {
                    const result = await UserDB.createUser(null,null,{
                        unionid:unionid,
                        wxUserInfo:userInfo
                    })
                    req.rSession.userId = result._id   
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
            subState: false,
            wxUserInfo: null,
        })
        if(envi.isWeixin(req)&&result.unionid===''){
            req.rSession.userId = undefined
        }
        res.redirect('/person')
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

    userObj.noticeList.map((item)=>{
        if(item.readState){
            result.push(item)
        }
    })
    result.sort(sortByCreateTime)

    const Result = []

    if(!timeStamp){
        result.map((item, index)=>{
            if(index<20){
                Result.push(item)
            }
        })
    }else{
        result.map((item)=>{
            if(Result.length<10&&item.create_time<timeStamp){
                Result.push(item)
            }
        })
    }
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: Result
    });

}


const showUnreadList = async (req, res, next) => {
    const userId = req.rSession.userId
    const timeStamp = req.body.timeStamp
    const result = []


    const userObj = await UserDB.findById(userId)

    // const result = await UserDB.findUnreadNotice(userId)

    userObj.noticeList.map((item)=>{
        if(!item.readState){
            result.push(item)
        }
    })
  //  result = db.result1.find().sort({create_time: -1}
    result.sort(sortByCreateTime)
    console.log(result);
    const Result = []

    if(!timeStamp){
        result.map((item, index)=>{
            if(index<20){
                Result.push(item)
            }
        })
    }else{
        result.map((item)=>{
            if(Result.length<10&&item.create_time<timeStamp){
                Result.push(item)
            }
        })
    }
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: Result
    });

}
const readNotice = async (req, res, next) => {
    const userId = req.rSession.userId
    const noticeId = req.body.noticeId
    const readState = req.body.readState

    const result = await UserDB.readNotice(userId, noticeId, readState)
    console.log("dwdwwdw",result);

  //  const Result = await UserDB.findNotice( userId,noticeId)

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {}
    });
}

module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['GET', '/api/getMyInfo',apiAuth, getMyInfo],
    ['POST', '/api/getUserInfo',apiAuth, getUserInfo],
    ['POST', '/api/userInfoList',apiAuth, userInfoList],

    ['POST', '/api/login', login],
    ['GET', '/wxLogin', wxLogin],

    ['POST', '/api/logout', apiAuth, logout],
    ['POST', '/api/unbindWechat', apiAuth, unbindWechat],

    ['POST', '/api/signUp', signUp],
    ['POST', '/api/setUserInfo', apiAuth, setUserInfo],


    ['POST', '/api/user/showReadList', apiAuth, showReadList],
    ['POST', '/api/user/showUnreadList', apiAuth, showUnreadList],

    ['POST', '/api/user/readNotice', apiAuth, readNotice],
    //['POST', '/api/user/getUserId', apiAuth, getUserId],
    ['POST', '/api/user/loginAndBindWx', apiAuth, loginAndBindWx],
    ['POST', '/api/user/SignUpAndBindWx', apiAuth, signUpAndBindWx],
];
