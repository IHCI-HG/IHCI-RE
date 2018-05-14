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
];
