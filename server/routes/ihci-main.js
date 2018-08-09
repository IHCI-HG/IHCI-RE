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

var TestDB = mongoose.model('test')
var UserDB = mongoose.model('user')
var TeamDB = mongoose.model('team')

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
    if(!userObj){
        var newUserObj = await UserDB.findByOldId(userId)
        req.rSession.userId = newUserObj._id
    }
    if(userObj) {
        userObj.password = undefined
    }
    if(newUserObj){
        newUserObj.password = undefined
    }
    req.INIT_DATA = {
        userObj: userObj || newUserObj,
        isWeixin: envi.isWeixin(req)
    }
    next()
}

const joinTeam = async (req, res, next) => {
    const userId = req.rSession.userId
    const teamId = req.params.teamId

    const teamObj = await TeamDB.findByTeamId(teamId)

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
            res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx87136e7c8133efe3&redirect_uri=http%3A%2F%2Fwww.animita.cn&response_type=code&scope=snsapi_base&state=123#wechat_redirect`)
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
                    const result2 = await UserDB.createUser(null,null,{
                        unionid:result1.unionid,
                        wxUserInfo:result1
                    })
                    const findUser = await UserDB.findByUnionId(result1.unionid)
                    if(findUser){
                        req.rSession.userId = findUser._id
                    }
                    res.redirect('/person')
                }
            }
            else{
                res.redirect('/wxcode')
                //关注公众号
            }
        }
        if(req.rSession.userId&&urlObj.pathname==='/'){
            res.redirect('/team')
        }
        if(req.rSession.userId&&urlObj.pathname!=='/'){
            next()
        }
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

    ['GET', '/auth', clientParams(), wxAuthCodeHandle , mainPage],

    ['GET', '/team', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/files/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/sign', clientParams(), routerAuthJudge, pageHandle() ],

    ['GET', '/team/:id', clientParams(), routerAuthJudge, silentAuth, pageHandle() ],
    ['GET', '/todo/:id', clientParams(), routerAuthJudge, silentAuth, pageHandle() ],
    ['GET', '/team-edit/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/team-admin/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/team-management',clientParams(), routerAuthJudge, pageHandle()],
    ['GET', '/team-join/:teamId', clientParams(), joinTeam, pageHandle() ],

    ['GET', '/team-create', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/person', clientParams(), routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/discuss/topic/:id', clientParams(), routerAuthJudge, silentAuth, pageHandle() ],
    ['GET', '/timeline', clientParams(),    routerAuthJudge, silentAuth, pageHandle() ],
    ['GET', '/member', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/search', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/completed/:id', clientParams(), routerAuthJudge, silentAuth, pageHandle() ],
    ['GET', '/inform', clientParams(),   routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/wxcode', clientParams(),  pageHandle() ],
];
