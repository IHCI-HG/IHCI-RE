var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

var file = require('../models/file');  
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

import { 
    web_codeToAccessToken, 
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
} from '../components/wx-utils/wx-utils'

import{
    isMember,
    isAdmin,
    isCreator
}from '../middleware/auth-judge/auth-judge'

var mongoose = require('mongoose')
var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var timelineDB = mongoose.model('timeline')

const sortByCreateTime = function(a,b){  
    return b.create_time-a.create_time  
 }
const search = async (req, res, next) => {
    const keyWord = req.body.keyWord
    const teamId = req.body.teamId
    const timeStamp = req.body.timeStamp
    const type = req.body.type
    const userId = req.rSession.userId 
    if(!keyWord) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try{
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
        const allFolder = await file.findFolderByTeamIdList(teamIdList)
        const allFile = await file.findFileByTeamIdList(teamIdList)
        const key = keyWord.replace(/([\^\$\(\)\*\+\?\.\\\|\[\]\{\}])/g, "\\$1");
        const str = new RegExp(key)
        const searchResult =[]
        allTimeline.map((item)=> {
             if(str.test(item.title)||str.test(item.content.content)){
                searchResult.push(item)
             }
         })
         allFolder.map((item)=> {
            if(str.test(item.folderName)){
               item = {...item._doc,type: 'FOLDER'}
               searchResult.push(item)
            }
        })
        allFile.map((item)=> {
            if(str.test(item.fileName)){
               item = {...item._doc,type: 'FILE'}
               searchResult.push(item)
            }
        })
        searchResult.sort(sortByCreateTime)
        const result = []
        if(type){
            if(type=="TOPIC"){
                searchResult.map((item) => {    
                    if((item.type=="CREATE_TOPIC")||(item.type=="EDIT_TOPIC")){
                        if(str.test(item.title)||str.test(item.content.content)){                    
                        result.push(item)
                        }
                     }                              
                })
            }else if(type=="REPLY"){
                searchResult.map((item) => {
                    if((item.type=="REPLY_TOPIC")||(item.type=="EDIT_REPLY")&&str.test(item.content.content)){
                        result.push(item)
                      } 
                 })               
            }else if(type=="TASK"){
                searchResult.map((item) => {
                    if((item.type=="CREATE_TASK")||(item.type=="CREATE_CHECK_ITEM")||(item.type=="COPY_TASK")||(item.type=="MOVE_TASK")){
                        result.push(item)
                      } 
                 })  
            }else if(type=="FILE"){
                searchResult.map((item) => {
                    if((item.type=="FILE")||(item.type=="FOLDER")){
                        result.push(item)
                      } 
                 })  

            }
            
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
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg:"检索成功"},
            data: Result
        });
    }catch (error) {
        console.error(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000, msg:'操作失败' },
            data: {},
        })
    }
}

module.exports = [
    ['POST', '/api/search', apiAuth, isMember, search]
];