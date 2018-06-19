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
import { filter } from 'graphql-anywhere';

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var timelineDB = mongoose.model('timeline')

//如果传了teamID，就返回该teamID的动态，如果没有传，就返回该用户全部的动态
const search = async (req, res, next) => {
    const keyWord = req.body.keyWord
    const teamId = req.body.teamId
    const type = req.body.type
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
        searchResult.map((item) => {
         if(item.type==type){
            result.push(item)
            }
        })
    }else{
        searchResult.map((item) => {
            result.push(item)           
        })
    }
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: result
    });
}

// const searchTopic = async(req, res, next) =>{                          //tianjia
//     const keyWord = req.body.keyWord
//     const topic = await topicDB.findByKeyWord(keyWord)
//     console.log("这是搜索结果", topic)
//     console.log("查询到几条：",topic.length)
//     // console.log("分别是：", topic[0].title)
//     // console.log("分别是：", topic[1].title)
    
//     const result = await timelineDB.returnAll()
//     const filterResult = []
//     result.map((item) => {
//         if(item.type=="CREATE_TOPIC"){
//         filterResult.push(item)
//         }
//     })
//     const aaa = []
//     const  str = new RegExp("话题")
//         result.map((item)=> {
//              if(str.test(item.title)||str.test(item.content.content)){
//                 aaa.push(item)
//              }
//          })
     
   
    
//     console.log("这是所有结果：", result)
//     console.log("这是筛选type的所有结果：", filterResult)
//     console.log("这是搜索后的并且筛选type的所有结果：", aaa)
    
//     resProcessor.jsonp(req, res, {
//         state: { code: 0, msg: '请求成功' },
//         data:  topic
        
//     });
// }


module.exports = [
   // ['POST', '/api/searchTopic', apiAuth, searchTopic]
    ['POST', '/api/search', apiAuth, search]
];
