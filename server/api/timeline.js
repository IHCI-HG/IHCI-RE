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
const returnTimeline = async (req, res, next) => {
    const teamId = req.body.teamId
    const personId = req.body.userId
    const timeStamp = req.body.timeStamp
    const userId = req.rSession.userId 
    const teamIdList = []
    const result = []
    if(teamId) {
        teamIdList.push(teamId)
        const allTimeline = await timelineDB.findByTeamIdList(teamIdList)
        allTimeline.map((item)=>{
            result.push(item)
        })
    } else if(personId){
        const userObj = await userDB.findById(userId)
        userObj.teamList.map((item) => {
            teamIdList.push(item.teamId)
        })
        const allTimeline = await timelineDB.findByTeamIdList(teamIdList)
        const personTimeline = []
        allTimeline.map((item)=>{
            if(item.creator._id==personId){
                personTimeline.push(item)
            }
        })
        personTimeline.map((item)=>{
            result.push(item)
        })
    }
      else {
        const userObj = await userDB.findById(userId)
        userObj.teamList.map((item) => {
            teamIdList.push(item.teamId) 
        })
        const allTimeline = await timelineDB.findByTeamIdList(teamIdList)
        allTimeline.map((item)=>{
            result.push(item)
        })
    }
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

module.exports = [
    ['POST', '/api/timeline/getTimeline', returnTimeline],
];
