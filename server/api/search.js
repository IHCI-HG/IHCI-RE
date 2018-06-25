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
var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var timelineDB = mongoose.model('timeline')
const search = async (req, res, next) => {
    const keyWord = req.body.keyWord
    const teamId = req.body.teamId
    const timeStamp = req.body.timeStamp
    const type = req.body.type
    const userId = req.rSession.userId 
    if(keyWord){
        const teamIdList = []
        if(teamId) {
            teamIdList.push(teamId)
        } else {
            const userObj = await userDB.findById(userId)
            userObj.teamList.map((item) => {
                teamIdList.push(item.teamId) 
            })
        }
        const allTimeline = await timelineDB.findByTeamIdList(teamIdList)
        const  str = new RegExp(keyWord)
        const searchResult =[]
        allTimeline.map((item)=> {
             if(str.test(item.title)||str.test(item.content.content)){
                searchResult.push(item)
             }
         })
        const result = []
        if(type){
            const flag = type=="CREATE_TOPIC"
            // console.log("flag", flag)
            searchResult.map((item) => {    
                if(flag){
                    if(item.type=="CREATE_TOPIC"){
                        if(str.test(item.title)||str.test(item.content.content)){                    
                        result.push(item)
                        }
                     }  
                 }
                else if(item.type=="REPLY_TOPIC"&&str.test(item.content.content)){
                       result.push(item)
                     }                 
            })
        }else{
            searchResult.map((item) => {
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
        //console.log("这是搜索结果：", result)
        if(Result.length){
            resProcessor.jsonp(req, res, {
                state: { code: 0, msg:"检索成功"},
                data: Result
            });
        }else{
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg:"没有检索到任何结果"},
                data: {}
            });
        }
    }
    else{
        resProcessor.jsonp(req, res, {
            state: { code: 2, msg:"请输入检索词"},
            data: {}
        });
    }
}

module.exports = [
    ['POST', '/api/search', apiAuth, search]
];
