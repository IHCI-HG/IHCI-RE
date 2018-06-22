var path = require('path'),
    _ = require('underscore'),
    async = require('async'),
    lo = require('lodash'),
    uuid = require('uuid'),
    clientParams = require('../middleware/client-params/client-params'),
    proxy = require('../components/proxy/proxy'),
    resProcessor = require('../components/res-processor/res-processor'),
    htmlProcessor = require('../components/html-processor/html-processor'),
    conf = require('../conf'),
    server = require('../server');

var pageHandle = require('../components/page-handle/page-handle')
var querystring = require('querystring');
var activityApi = require('../api/activity');

var mongoose = require('mongoose')

var TestDB = mongoose.model('test')
var UserDB = mongoose.model('user')
var TeamDB = mongoose.model('team')

// 路由前判定是否已经登录
const routerAuthJudge = async (req, res, next) => {
    if(req.rSession.userId) {
    } else {
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

    if(userObj) {
        userObj.password = undefined
    }

    req.INIT_DATA = {
        userObj
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

module.exports = [
    // 主页
    ['GET', '/', clientParams(), mainPage],

    ['GET', '/auth', clientParams(), wxAuthCodeHandle , mainPage],

    ['GET', '/team', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/sign', clientParams(), routerAuthJudge, pageHandle() ],

    ['GET', '/test', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/test-editor', clientParams(), routerAuthJudge, pageHandle() ],

    ['GET', '/team-edit/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/team-admin/:teamId', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/team-join/:teamId', clientParams(), joinTeam, pageHandle() ],

    ['GET', '/team-create', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/person', clientParams(), routerAuthJudge, personSeting, pageHandle() ],
    ['GET', '/discuss/:id', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/discuss/topic/:id', clientParams(), routerAuthJudge, pageHandle() ],
    ['GET', '/timeline', clientParams(),    routerAuthJudge, pageHandle() ],
    ['GET', '/member', clientParams(),   routerAuthJudge, pageHandle() ],
    ['GET', '/search', clientParams(),   routerAuthJudge, pageHandle() ],
      ['GET', '/inform', clientParams(),   routerAuthJudge, personSeting, pageHandle() ],
];
