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
import{
    isMember
}from '../middleware/auth-judge/auth-judge'

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
const returnTimeline = async (req, res, next) => {
    const teamId = req.body.teamId
    const timeStamp = req.body.timeStamp
    const userId = req.rSession.userId 
    const teamIdList = []
    try{
        if(teamId) {
            if(!timeStamp){
                var result = await timelineDB.firstReturnByTeam(teamId)
            }else{
                var result = await timelineDB.returnByTimeStampAndTeam(teamId,timeStamp)
            }
        } 
          else {
            const userObj = await userDB.findById(userId)
            userObj.teamList.map((item) => {
                teamIdList.push({teamId: item.teamId}) 
            })
            if(!timeStamp){
                var result = await timelineDB.firstReturnByTeamIdList(teamIdList)  
            }else{
                var result = await timelineDB.returnByTimeStampAndTeamIdList(teamIdList,timeStamp)
            }
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0 },
            data: result
        });
    }
    catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

module.exports = [
    ['POST', '/api/timeline/getTimeline', isMember, returnTimeline],
];
