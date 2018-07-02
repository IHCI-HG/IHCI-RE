var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

import { 
    web_codeToAccessToken, 
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var timelineDB = mongoose.model('timeline')


const returnAll = async (req, res, next) => {
    const allTimeline = await timelineDB.returnAll()
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: allTimeline
    });
}

// 如果传了teamID，就返回该teamID的动态，如果没有传，就返回该用户全部的动态
const returnByTeamList = async (req, res, next) => {
    const teamId = req.body.teamId
    const currentPage = req.body.currentPage;
    const userId = req.rSession.userId 

    const teamIdList = []
    if(teamId) {
        teamIdList.push(teamId)
    } else {
        const userObj = await userDB.findById(userId)
        userObj.teamList.map((item) => {
            teamIdList.push(item.teamId) 
        })
    }
    const allTimeline = await timelineDB.findByTeamIdList(teamIdList,currentPage)

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: allTimeline
    });
}

module.exports = [
    ['POST', '/api/timeline/getTimeline', returnByTeamList],
];
