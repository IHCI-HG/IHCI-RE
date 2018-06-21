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
    const personId = req.body.userId
    const userId = req.rSession.userId 
    const teamIdList = []
    const result = []
    //console.log("我是teamID:", teamId)
    //console.log("我是personID:", personId)
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
        //console.log("返回的数据",allTimeline)
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
    console.log("返回的数据",result)
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: result
    });
}

// const returnByPerson = async (req, res, next) => {
//     const personId = req.body.userId
//     const userId = req.rSession.userId 
//     const teamIdList = []
//     const userObj = await userDB.findById(userId)
//     userObj.teamList.map((item) => {
//         teamIdList.push(item.teamId)
//     })
//     const allTimeline = await timelineDB.findByTeamIdList(teamIdList)
//     //console.log("返回的数据",allTimeline)
//     const personTimeline = []
//     allTimeline.map((item)=>{
//         if(item.creator._id==personId){
//             personTimeline.push(item)
//         }
//     })
//     //console.log("个人动态：",personTimeline)
//     resProcessor.jsonp(req, res, {
//         state: { code: 0 },
//         data: personTimeline
//     });
// }
module.exports = [
    ['POST', '/api/timeline/getTimeline', returnByTeamList],
   // ['POST', '/api/timeline/personTimeline', returnByPerson],
];
