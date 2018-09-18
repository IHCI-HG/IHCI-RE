var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'
import {notificationMail} from '../components/mail/notificationMail'
import {
    createTopicTemplate,
    replyTopicTemplate
} from '../components/wx-utils/wx-utils'
import{
    isMember
}from '../middleware/auth-judge/auth-judge'

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var timelineDB = mongoose.model('timeline')


const createTopic = async (req, res, next) => {
    const teamId = req.body.teamId
    const title = req.body.title
    const topicContent = req.body.content
    const topicFileList = req.body.fileList
    const informList = req.body.informList
    const userId = req.rSession.userId



    if(!title || !topicContent) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.baseInfoById(userId)
        const result = await topicDB.createTopic(title, topicFileList, topicContent, userObj, teamId)
        await teamDB.addTopic(teamId, result)
        const teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj){
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'CREATE_TOPIC', result._id, result.title, result)

        //如果有需要通知的人，则走微信模板消息下发流程

        if(informList && informList.length) {
            createTopicTemplate(informList, result)

            //添加通知\
            await Promise.all(informList.map(async (item) => {
                await userDB.addCreateNotice(item, result, teamObj.name,"CREATE_TOPIC")
              }));

            notificationMail(informList, result, "创建了讨论")
        }
        
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {topicObj: result},
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

const changeTopicCreator = async (req, res, next) => {
    const personInfo = req.body.personInfo
    const originPersonInfo = req.body.originPersonInfo.name
    const userId = req.rSession.userId
    if(!personInfo || !originPersonInfo) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let discussObj = await discussDB.findDiscussByCreatorId(userId)
        // if(!discussObj) {
        //     resProcessor.jsonp(req, res, {
        //         state: { code: 1, msg: "话题不存在" },
        //         data: {}
        //     });
        //     return
        // }
        let timelineObj = await timelineDB.findByCreatorId(userId)
        let result = []
        let result1 = []
        let result2 = []
        let result3 = []
        timelineObj.map(async(item)=>{
            item.creator.headImg = personInfo.headImg
            item.creator.name = personInfo.name
            item.creator.phone = personInfo.phone
            item.creator.mail = personInfo.mail
            await timelineDB.updateTimeline(item._id, item)
        })
        discussObj.map(async(item,index)=>{
            item.creator.headImg = personInfo.headImg
            item.creator.name = personInfo.name
            item.creator.phone = personInfo.phone
            item.creator.mail = personInfo.mail
            result3[index] = await discussDB.updateDiscuss(item._id, item)
            result2[index] = await topicDB.updateDiscuss(item.topicId,item._id,item.content,item.fileList,personInfo)
        })
        let topicObj = await topicDB.findByTopicCreatorId(userId)
        topicObj.map(async(item,index)=>{
            item.creator.headImg = personInfo.headImg
            item.creator.name = personInfo.name
            item.creator.phone = personInfo.phone
            item.creator.mail = personInfo.mail
            result[index] = await topicDB.updateTopic(item._id, item)
            result1[index] = await teamDB.updateTopic(item.team, item._id, item)
        })
        let userObj = await userDB.findByUserId(userId)
        userObj.noticeList.map(async(item)=>{
            item.creator.headImg = personInfo.headImg
            item.creator.name = personInfo.name
            item.creator.phone = personInfo.phone
            item.creator.mail = personInfo.mail
        })
        await userDB.updateUser(userId,userObj)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {
                result: result,
                result1: result1,
                result2: result2
            }
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }

}

const editTopic = async (req, res, next) => {
    const teamId = req.body.teamId
    const topicId = req.body.topicId
    const informList = req.body.informList
    const title = req.body.title
    const content = req.body.content
    const fileList = req.body.fileList
    const userId = req.rSession.userId
    
    const editTopic = {
        title: title,
        content: content,
        fileList: fileList
    }
    if(!teamId || !topicId || !editTopic) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let topicObj = await topicDB.findByTopicId(topicId)
          //   todo 走微信模板消息下发流程
         if(informList && informList.length) {
           // notificationMail(informList, result, "编辑了讨论")
         }
        if(!topicObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        editTopic.creator = topicObj.creator
        const result1 = await topicDB.updateTopic(topicId, editTopic)
        const result2 = await teamDB.updateTopic(teamId, topicId, editTopic)

        const userObj = await userDB.baseInfoById(userId)
        const teamObj = await teamDB.findByTeamId(teamId)
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_TOPIC', result1._id, result1.title, result1)
        //todo 还要在timeline表中增加项目
  
        if(informList && informList.length) {
            //replyTopicTemplate(informList, result1)

            //添加通知
            informList.map((item) => {
                userDB.addEditTopicNotice(item, result1, teamObj.name)
            })
            //notificationMail(informList, result1, "修改了讨论")

        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {
                topicObj: result1,
            }
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000 , msg: '操作失败' },
            data: {}
        });
    }
}


const createDiscuss = async (req, res, next) => {
    const teamId = req.body.teamId
    const topicId = req.body.topicId
    const content = req.body.content
    const informList = req.body.informList || []

    // todo 回复可以添加附件，这里留着
    const fileList = req.body.fileList || []
    const userId = req.rSession.userId
    // todo 各种权限判断

    if(!teamId || !topicId || !content) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.baseInfoById(userId)
        const topicObj = await topicDB.findByTopicId(topicId)
        if(!topicObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        const result = await discussDB.createDiscuss(teamId, topicId, topicObj.title, content, userObj, fileList)

        await topicDB.addDiscuss(topicId, result)

        const teamObj = await teamDB.findByTeamId(teamId)

        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'REPLY_TOPIC', result._id, topicObj.title, result)

        //如果有需要通知的人，则走微信模板消息下发流程
        if(informList && informList.length) {
            replyTopicTemplate(informList, result)

            //添加通知
            informList.map((item) => {
                userDB.addReplyNotice(item, result, teamObj.name)
            })
            notificationMail(informList, result, "回复了讨论")

        }

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {discussObj:result}
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

const editDiscuss = async (req, res, next) => {
    const teamId = req.body.teamId
    const topicId = req.body.topicId
    const discussId = req.body.discussId
    const content = req.body.content
    const informList = req.body.informList || []
    // todo 回复可以添加附件，这里留着
    const fileList = req.body.fileList || []

    const userId = req.rSession.userId

    // todo 各种权限判断

    if(!discussId || !topicId || !content) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    if(informList && informList.length) {
        //todo 走微信模板消息下发流程
       // notificationMail(informList, result, "编辑了回复")
    }
    try {
        var discussObj = (await discussDB.findTaskDiscuss(discussId)).toObject();
        if(!discussObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        //delete discussObj._id;
        discussObj.content = content;
        discussObj.fileList = fileList || discussObj.fileList;

        const result = await discussDB.updateDiscuss(discussId, discussObj)
  
        await topicDB.updateDiscuss(topicId, discussId, content,discussObj.fileList,discussObj.creator)

        const userObj = await userDB.baseInfoById(userId)
        const topicObj = await topicDB.findByTopicId(topicId)
        const teamObj = await teamDB.findByTeamId(teamId)
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_REPLY', result._id, topicObj.title, discussObj)
   
        
        if(informList && informList.length) {
            //replyTopicTemplate(informList, result)
            //添加通知
            await informList.map((item) => {
                userDB.addEditReplyNotice(item, discussObj, teamObj.name)
            })
            //notificationMail(informList, result, "编辑了回复")

        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {discussObj:result}
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}



const topicInfo = async (req, res, next) => {
    const topicId = req.body.topicId
    const userId = req.rSession.userId

    if(!topicId) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const topicObj = await topicDB.findByTopicId(topicId)
        if(!topicObj){
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {topicObj:topicObj}
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

//设置Topic已读
const readingNotice = async (req, res, next) => {
    const noticeId = req.body.topicId
    const readerId = req.rSession.userId

    if(!noticeId == undefined) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let topicObj = await topicDB.findByTopicId(noticeId)
        if(!topicObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '话题不存在'},
                data: {}
            });
            return
        }
        let userObj = await userDB.findByUserId(readerId)
        if(!userObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '用户不存在'},
                data: {}
            });
            return
        }

        const result = await userDB.readNotice(readerId, noticeId)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '已将消息设置为已读' },
            data: result
        });


        } catch (error) {
            console.error(error);
            resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }



}



const getMoreTopic = async (req,res,next) =>{
    const teamId = req.body.teamId;
    const currentPage = req.query.currentPage;



    if(!teamId || currentPage <= 0) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不正确" },
            data: {}
        });
        return
    }

    try {

        const topicObj = await topicDB.getByPage(teamId,currentPage);

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: topicObj
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }


}
//6.28
const delTopic = async (req,res,next) =>{
    const topicId = req.body.topicId;


    if(!topicId) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不正确" },
            data: {}
        });
        return
    }

    try {
        const topicObj = await topicDB.findByTopicId(topicId);
        if(!topicObj){
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        const teamId = topicObj.team;

        const discussList = topicObj.discussList;


        for(var x in discussList){
            discussDB.delDiscussById(discussList[x]._id)
        }

        await teamDB.delTopic(teamId,topicId)
        const result = await topicDB.delTopicById(topicId);

        //创建动态6.28
        const baseInfoObj = await userDB.baseInfoById(userId)
        const teamObj = await teamDB.findByTeamId(teamId)
        await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'DELETE_TOPIC', topicObj._id, topicObj.title, topicObj)



        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {topicObj:result}
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }


}

    //6.28
const delDiscuss = async (req,res,next)=>{
    const discussId = req.body.discussId;
    const userId = req.rSession.userId;


    if(!discussId) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不正确" },
            data: {}
        });
        return
    }

    try {
        const result = await discussDB.findDiscussById(discussId);
        if(!result){
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        const teamId = result.teamId;
        const topicId = result.topicId;


        await topicDB.delDiscuss(topicId,discussId);
        await discussDB.delDiscussById(discussId);

        //创建动态6.28
        const baseInfoObj = await userDB.baseInfoById(userId)
        const teamObj = await teamDB.findByTeamId(teamId)
        await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'DELETE_TOPIC_REPLY', result._id, result.title, result);



        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },

            //需要修改
            data: result
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

const getDiscuss = async (req, res, next) => {
    const topicId = req.body.topicId
    const userId = req.rSession.userId

    if(!topicId) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const discussList = await discussDB.getDiscussByTopicId(topicId)
        if(!discussList){
            resProcessor.jsonp(req, res, {
                state: { code: 3001, msg: "无效的id" },
                data: {}
            });
            return
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data:{ discussList:discussList}
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1000, msg: '操作失败' },
            data: {}
        });
    }
}

module.exports = [
    ['POST', '/api/topic/get', apiAuth, topicInfo],
    //6.22
    ['GET','/api/topic/getMoreTopic', apiAuth, isMember,getMoreTopic],

    ['POST', '/api/topic/createTopic', apiAuth, isMember, createTopic],
    ['POST', '/api/topic/editTopic', apiAuth, isMember, editTopic],
    ['POST', '/api/topic/createDiscuss', apiAuth, isMember, createDiscuss],
    ['POST', '/api/topic/editDiscuss', apiAuth, isMember, editDiscuss],
    ['POST', '/api/topic/changeCreator', apiAuth, isMember, changeTopicCreator],
    ['POST', '/api/topic/readingNotice', apiAuth,isMember, readingNotice],

    //6.28
    ['POST','/api/topic/delTopic',apiAuth,isMember, delTopic],
    ['POST','/api/topic/delDiscuss',apiAuth,isMember, delDiscuss],
    ['POST','/api/topic/getDiscuss',apiAuth,isMember, getDiscuss],

];
