var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
   
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

var mongoose = require('mongoose')
var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var timelineDB = mongoose.model('timeline')
const member = async (req, res, next) => {
    const teamId = req.body.teamId
    const userId = req.rSession.userId 
    const memberId = []
    //当没有传入teamId时，返回所有项目组成员信息；当传入时返回指定项目组成员信息
    if(teamId){
        console.log("团队Id:" , teamId)
        const teamObj = await teamDB.findByTeamId(teamId)
        teamObj.memberList.map((item)=>{           
            memberId.push(item.userId)
        })
    } else {
        const userObj = await userDB.findByUserId(userId)
        await Promise.all ( userObj.teamList.map(async item => {
            const teamObj = await teamDB.findByTeamId(item.teamId)
            teamObj.memberList.map((item)=>{              
                if(memberId.indexOf(item.userId)==-1){
                    memberId.push(item.userId)
                }
            })
        }))
    }
    const memberList = []
    await Promise.all ( memberId.map(async item => {
        const memberObj = await userDB.findByUserId(item)  
        console.log("这是我cha的数据:",memberObj)
        memberList.push(memberObj.personInfo)            
        }))        
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: memberList
    });

}

module.exports = [
    ['POST', '/api/member', apiAuth, member]
];
