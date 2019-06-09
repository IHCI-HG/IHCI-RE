var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    lo = require('lodash'),
    uuid = require('uuid'),
    clientParams = require('../middleware/client-params/client-params'),
    proxy = require('../components/proxy/proxy'),
    resProcessor = require('../components/res-processor/res-processor'),
    htmlProcessor = require('../components/html-processor/html-processor'),
    envi = require('../components/envi/envi'),
    conf = require('../conf'),
    server = require('../server'),
    url = require('url');

// const axios = require('axios')
const { request } = require('../middleware/request/request')

const jwt    = require('jsonwebtoken');
const jwtsecret = 'myjwttest'

var pageHandle = require('../components/page-handle/page-handle')
var querystring = require('querystring');
var activityApi = require('../api/activity');

var mongoose = require('mongoose')

var UserDB = mongoose.model('user')
var teamDB = mongoose.model('team')
var topicDB = mongoose.model('topic')
var taskDB = mongoose.model('task')
var roleDB = mongoose.model('role')

import {
    pub_codeToAccessToken,
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
    pub_openidToUserInfo,
} from '../components/wx-utils/wx-utils'
// 路由前判定是否已经登录或信息填写完全
const routerAuthJudge = async (req, res, next) => {
    const userId = req.rSession.userId
    // if(userId) {
    //     const user = await UserDB.findByUserId(userId)

    //     if (!/person/.test(req.url)  &&  user.personInfo==null)
    //     {
    //         res.redirect('/person')
    //         return
    //     }
    // }
    if(!userId) {
        res.redirect('/')
        return
    }
    next()
}
const wxJudge = async (req, res, next) => {
    if(! envi.isWeixin(req)){
        res.redirect('/')
    }
    next()
}


// const getPermissionJudge = async (req,res,next) =>{
//    //看看怎么写入cookie，如果写不仅去就写到sotorage
//    console.log(req);
// }

const permissionJudge = async( req , res , next) => {
    
}

async function address(req, res, next) {
    var filePath = path.resolve(__dirname, '../../public/activity/page/address/full.html'),
    options = {
        filePath: filePath,
        fillVars: {},
        renderData: { blankFont: ""},
    };
    htmlProcessor(req, res, next, options);
}
const test = async (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../public/activity-react/complaint.html');
    const options = {
        filePath,
        fillVars: {
            INIT_DATA: {}
        },
        renderData: {},
    };
    req.rSession.expires = 10;
    req.rSession.noRobot = true;
    req.rSession.count = req.rSession.count + 1 || 1

    htmlProcessor(req, res, next, options)
}

const test1 = async (req, res, next) => {
    res.send('dataStr1')
}

// WARNING: 如果域名变更或者本地IP调试将会导致出错。
const addwww = async (req, res, next) => {
    console.log(req.url)
    if(req.url.indexOf('www.')=== -1&&req.url.indexOf('localhost')!== -1){
        res.redirect('https://www.animita.cn')
    }
    else{
        next()
    }
}
const mainPage = async (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../public/activity-react/main.html');
    const cccc = {
        ssdsds: '1',
        awdad: [
            1,2,3,4,5
        ]
    }
    const options = {
        filePath,
        fillVars: {
            INIT_DATA: {
                aaaa: 'aaaaaaaaaa',
                b: cccc
            }
        },
        renderData: {},
    };
    htmlProcessor(req, res, next, options)

}

const teamPage = async (req, res, next) => {
    const filePath = path.resolve(__dirname, '../../public/activity-react/team.html');
    const options = {
        filePath,
        fillVars: {
            INIT_DATA: {
                aaaa: 'aaaaaaaaaa'
            }
        },
        renderData: {},
    };
    htmlProcessor(req, res, next, options)
}



const wxAuthCodeHandle = async (req, res, next) => {
    req.INIT_DATA = {
        query: req.query
    }
    next()
}

const personSeting = async (req, res, next) => {
    const userId = req.rSession.userId
    const userObj = await UserDB.findById(userId)
    if(userObj) {
        userObj.password = undefined
    }
    req.INIT_DATA = {
        userObj: userObj,
        isWeixin: envi.isWeixin(req)
    }
    next()
}

const joinTeam = async (req, res, next) => {
    const userId = req.rSession.userId
    const teamId = req.params.teamId

    const userObj = await UserDB.findById(userId)
    const teamObj = await teamDB.findByTeamId(teamId)

    try{
        var result = await request("addOrganUser",{
            organId:teamId,
            userId:userId,
            userName:userObj.personInfo.name
        })
    }catch(err){
        console.log(err)
    }

    const initData = {
        login: false,
        teamObj: null
    }
    if(userId) {
        initData.login = true
    }
    if(teamObj) {
        initData.teamObj = teamObj
    }
    req.INIT_DATA = initData
    next()
}

const silentAuth = async(req, res, next) => {
    if(envi.isWeixin(req)){
        //静默授权
        var urlObj = url.parse(req.url,true)
        if(!req.rSession.userId&&!urlObj.query.code){
            res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx87136e7c8133efe3&redirect_uri=http%3A%2F%2Fwww.animita.cn${urlObj.pathname.substr(0,urlObj.pathname.length)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`)
        }
        if(!req.rSession.userId&&urlObj.query.code){
            var code = urlObj.query.code
            const result = await pub_codeToAccessToken(code)
            if(result.openid){
                var result1 = await pub_openidToUserInfo(result.openid)
            }
            if(result1.unionid) {
                const findUser = await UserDB.findByUnionId(result1.unionid)
                if(findUser){
                    req.rSession.userId = findUser._id
                    if(urlObj.pathname === '/'){
                        res.redirect('/team')
                    }
                    else{
                        res.redirect(urlObj.pathname)
                    }
                }
                else{
                    if(req.url.indexOf('/team-join/')!== -1){
                        res.redirect(`/wx-choose?openid=${result.openid}&teamjoin=${req.url.split('/')[2]}`)
                    }else{
                        res.redirect(`/wx-choose?openid=${result.openid}`)
                    }
                }
            }
            else{
                res.redirect('/wxcode')
                //关注公众号
            }
        }
        if(req.rSession.userId){
            if(urlObj.pathname==='/'){
                res.redirect('/team')
            }
            else{
                next()
            }
        }
    }
    else{
        next()
    }
}

//chaneg
const userAuthJudge = async(req, res, next) => {
    try{
        const userId = req.rSession.userId
        const userObj = await UserDB.findById(userId)
        const teamList = userObj.teamList
        const obj = {}
        for(let i=0;i<teamList.length;i++){
            let teamId = teamList[i].teamId
            var result = await request("authenticate",{
                organId:teamId,
                userId:userId,
            })
            if(result.data.state.code === 0) {
                const token = result.data.token
                jwt.verify(token, jwtsecret, function(err, decoded) {      
                    if (err) {
                        console.log('无效的token');
                    } else {
                    // 如果验证通过，在req中写入解密结果
                    req.decoded = decoded;  
                    obj[teamId] = decoded.permissionValueList
                    
                }
              });
            }
        }
        req.rSession['userRights'] = true
        req.rSession[userId] = obj;
        // const teamId = req.url.split('/')[2]
        // console.log('------------------------')
        // console.log(userId)
        // console.log(teamId)
        // var result = await request("authenticate",{
        //     organId:teamId,
        //     userId:userId,
        // })
        // console.log(result);
        // if(result.data.state.code === 0) {
        //     const token = result.data.token
        //     jwt.verify(token, jwtsecret, function(err, decoded) {      
        //         if (err) {
        //     //   return res.json({ success: false, message: '无效的token.' });    
        //             console.log('无效的token');
        //         } else {
        //           // 如果验证通过，在req中写入解密结果
        //           req.decoded = decoded;  
        //           console.log(req)
        //           console.log(decoded);
        //         //   const obj = {
        //         //       teamId:decoded.permissionNameList
        //         //   }
        //         const obj = {}
        //         obj[teamId] = decoded.permissionValueList
        //         //   window.sessionStorage.setItem(decoded.userId, obj);
        //         req.rSession['userRights'] = true
        //         req.rSession[userId] = obj;
        //         console.log('$$$$$$$$$$$$$$$$$$$$');
        //         console.log(req.rSession);
        //     }
        //   });
        // }else{
        //     console.log('come in')
        //     // next()
        // }
        // if(req.url.indexOf('/discuss/topic/')!== -1){
        //     const topicId = req.url.split('/')[3]
        //     const topicObj = await topicDB.findByTopicId(topicId)
        //     var teamId = topicObj.team
        // }
        // if(req.url.indexOf('/files/')!== -1||req.url.indexOf('/team/')!== -1||req.url.indexOf('/team-admin/')!== -1||req.url.indexOf('/completed/')!== -1){
        //     var teamId = req.url.split('/')[2]
        // }
        // if(req.url.indexOf('/todo/')!==-1){
        //     const taskId = req.url.split('/')[2]
        //     const taskObj = await taskDB.findByTaskId(taskId)
        //     var teamId = taskObj.teamId
        // }
        // const result = await roleDB.findRole(userId, teamId)
        // if(req.url.indexOf('/team-admin/')!== -1&&result.role!=="creator"&&result.role!=="admin"){
        //     res.redirect(`/team/${teamId}`)
        // }
        // req.INIT_DATA = {
        //     role: result?result.role:"visitor"
        // }
        next()

    }catch(err){
        console.log(err)
        console.log('come in err')
        req.rSession['userRights'] = false
        console.log('have set false')
        next()

    }
   
}

module.exports = [
    // 主页
    ['GET', '/', clientParams(), silentAuth , mainPage , addwww],
    // ['GET', '/', clientParams(), mainPage],
    ['GET', '/activate', clientParams(), pageHandle()],
    //['GET','/wx-choose',clientParams(), pageHandle()],
    ['GET','/wx-choose',clientParams(), wxJudge, pageHandle()],
    ['GET','/ihci-join',clientParams(), pageHandle()],
    ['GET','/password-reset',clientParams(),pageHandle()],

    ['GET', '/auth', clientParams(), wxAuthCodeHandle , mainPage],

    ['GET', '/team', clientParams(), routerAuthJudge,userAuthJudge, pageHandle() ],
    ['GET', '/files/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/sign', clientParams(), routerAuthJudge,pageHandle() ],

    ['GET', '/team/:id', clientParams(), silentAuth, routerAuthJudge, pageHandle() ],
    ['GET', '/todo/:id', clientParams(), silentAuth, routerAuthJudge, pageHandle() ],
    ['GET', '/team-admin/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/team-management',clientParams(), routerAuthJudge, pageHandle()],
    ['GET', '/modify-password',clientParams(), routerAuthJudge, pageHandle()],
    ['GET', '/team-join/:teamId', clientParams(), silentAuth, joinTeam, pageHandle() ],

    ['GET', '/team-create', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/person', clientParams(), routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/discuss/topic/:id', clientParams(), silentAuth, routerAuthJudge, pageHandle() ],
    ['GET', '/timeline', clientParams(), silentAuth,    routerAuthJudge, pageHandle() ],
    ['GET', '/member', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/search', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/completed/:id', clientParams(), silentAuth, routerAuthJudge, pageHandle() ],
    ['GET', '/inform', clientParams(),   routerAuthJudge, personSeting, pageHandle() ],
	['GET', '/wxcode', clientParams(),  pageHandle() ],
	
    ['GET', '/user-rights-management/:actor/:teamId',  pageHandle() ],
    ['GET', '/system-user-rights-management/:actor',  pageHandle() ],
];
