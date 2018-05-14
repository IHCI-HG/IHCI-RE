var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../middleware/auth/api-auth'

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

const createTopic = async (req, res, next) => {
    const teamId = req.body.teamId
    const topicName = req.body.name
    const topicContent = req.body.content
    const informList = req.body.informList
    const userId = req.rSession.userId 

    if(!topicName || !topicContent) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    if(informList || informList.length) {
        //todo 走微信模板消息下发流程
    }

    try {
        const userObj = await userDB.baseInfoById(userId)
        const result = await topicDB.createTopic(topicName, topicContent, userObj, teamId)
        await teamDB.addTopic(teamId, result)
        //todo 还要在timeline表中增加项目

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
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


const editTopic = async (req, res, next) => {
    const teamId = req.body.teamId
    const topicId = req.body.topicId
    const editTopic = req.body.editTopic
    const informList = req.body.informList

    const userId = req.rSession.userId 

    if(!teamId || !topicId || !editTopic) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    if(informList && informList.length) {
        //todo 走微信模板消息下发流程
    }

    try {
        let topicObj = await topicDB.findByTopicId(topicId)
        if(!topicObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: "话题不存在" },
                data: {}
            });
            return
        }

        const result1 = await topicDB.updateTopic(topicId, editTopic)
        const result2 = await teamDB.updateTopic(teamId, topicId, editTopic)
        

        //todo 还要在timeline表中增加项目

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {
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
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    
    if(informList || informList.length) {
        //todo 走微信模板消息下发流程
    }

    try {
        const userObj = await userDB.baseInfoById(userId)
        const result = await discussDB.createDiscuss(teamId, topicId, content, userObj, fileList)
        await topicDB.addDiscuss(topicId, result)

        //todo 还要在timeline表中增加项目

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
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

const editDiscuss = async (req, res, next) => {
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
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    
    if(informList && informList.length) {
        //todo 走微信模板消息下发流程
    }

    try {

        const result = await discussDB.updateDiscuss(discussId, {content: content})
        await topicDB.updateDiscuss(topicId, discussId, content)

        //todo 还要在timeline表中增加项目

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
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



const topicInfo = async (req, res, next) => {
    const topicId = req.query.topicId
    const userId = req.rSession.userId 

    if(!topicId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const topicObj = await topicDB.findByTopicId(topicId)
    
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


module.exports = [
    ['GET', '/api/topic/get', apiAuth, topicInfo],

    ['POST', '/api/topic/createTopic', apiAuth, createTopic],
    ['POST', '/api/topic/editTopic', apiAuth, editTopic],
    ['POST', '/api/topic/createDiscuss', apiAuth, createDiscuss],
    ['POST', '/api/topic/editDiscuss', apiAuth, editDiscuss],
];
