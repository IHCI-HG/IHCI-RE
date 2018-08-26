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

var pageHandle = require('../components/page-handle/page-handle')
var querystring = require('querystring');
var activityApi = require('../api/activity');

var mongoose = require('mongoose')

var UserDB = mongoose.model('user')
var teamDB = mongoose.model('team')
var topicDB = mongoose.model('topic')
var taskDB = mongoose.model('task')

import {
    pub_codeToAccessToken,
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
    pub_openidToUserInfo,
} from '../components/wx-utils/wx-utils'
// 路由前判定是否已经登录或信息填写完全
const routerAuthJudge = async (req, res, next) => {
    const userId = req.rSession.userId
    if(userId) {
        const user = await UserDB.findByUserId(userId)

        if (!/person/.test(req.url)  &&  user.personInfo==null)
        {
            res.redirect('/person')
            return
        }
    } 
    else {
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

    const teamObj = await teamDB.findByTeamId(teamId)

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
        console.log(urlObj)
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

const userAuthJudge = async(req, res, next) => {
    var userId = req.rSession.userId
    if(req.url.indexOf('/discuss/topic/')!== -1){
        const topicId = req.url.split('/')[3]
        const topicObj = await topicDB.findByTopicId(topicId)
        var teamId = topicObj.team
    }
    if(req.url.indexOf('/files/')!== -1||req.url.indexOf('/team/')!== -1||req.url.indexOf('/team-admin/')!== -1||req.url.indexOf('/completed/')!== -1){
        var teamId = req.url.split('/')[2]
    }
    if(req.url.indexOf('/todo/')!==-1){
        const taskId = req.url.split('/')[2]
        const taskObj = await taskDB.findByTaskId(taskId)
        var teamId = taskObj.teamId
    }
    const teamObj = await teamDB.findByTeamId(teamId)
    var auth = []
    if(req.url === '/team-admin/:teamId'){
        auth = teamObj.memberList.filter((item)=>{
            return item.userId === userId && item.role === 'creator'
        })
    }
    else{
        auth = teamObj.memberList.filter((item)=>{
            return item.userId === userId
        })
    }
    if(auth.length === 0){
        //提示权限不足
        res.redirect('/team')
    }
    else{
        next()
    }
}

module.exports = [
    // 主页
    ['GET', '/', clientParams(), silentAuth, mainPage],
    // ['GET', '/', clientParams(), mainPage],
    ['GET', '/activate', clientParams(), pageHandle()],
    ['GET','/wx-choose',clientParams(), pageHandle()],
    //['GET','/wx-choose',clientParams(), wxJudge, pageHandle()],
    ['GET','/ihci-join',clientParams(), pageHandle()],

    ['GET', '/auth', clientParams(), wxAuthCodeHandle , mainPage],

    ['GET', '/team', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/files/:teamId', clientParams(), routerAuthJudge, userAuthJudge, pageHandle() ],
    ['GET', '/sign', clientParams(), routerAuthJudge, pageHandle() ],

    ['GET', '/team/:id', clientParams(), silentAuth, routerAuthJudge, userAuthJudge, pageHandle() ],
    ['GET', '/todo/:id', clientParams(), silentAuth, routerAuthJudge, userAuthJudge, pageHandle() ],
    ['GET', '/team-admin/:teamId', clientParams(), routerAuthJudge, userAuthJudge, pageHandle() ],
    ['GET', '/team-management',clientParams(), routerAuthJudge, pageHandle()],
    ['GET', '/team-join/:teamId', clientParams(), silentAuth, joinTeam, pageHandle() ],

    ['GET', '/team-create', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/person', clientParams(), routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/discuss/topic/:id', clientParams(), silentAuth, routerAuthJudge, userAuthJudge, pageHandle() ],
    ['GET', '/timeline', clientParams(), silentAuth,    routerAuthJudge, pageHandle() ],
    ['GET', '/member', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/search', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/completed/:id', clientParams(), silentAuth, routerAuthJudge, userAuthJudge,pageHandle() ],
    ['GET', '/inform', clientParams(),   routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/wxcode', clientParams(),  pageHandle() ],
];
