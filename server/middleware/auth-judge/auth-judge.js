var resProcessor = require('../../components/res-processor/res-processor')
var mongoose = require('mongoose')

var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var taskDB = mongoose.model('task')
var tasklistDB = mongoose.model('tasklist')
var roleDB = mongoose.model('role')

const getTeamId = async(req, res, next) => {
    if(req.body.teamId){
        return req.body.teamId
    } else if (req.body.taskId){
        const taskObj = await taskDB.findByTaskId(req.body.taskId)
        var teamId = taskObj.teamId
        return teamId
    } else if (req.body.listId){
        const tasklistObj = await tasklistDB.findByTasklistId(req.body.listId)
        var teamId = tasklistObj.teamId
        return teamId
    } else if (req.body.taskId){
        const topicObj = await topicDB.findByTopicId(topicId)
        var teamId = topicObj.team
        return teamId
    } else if (req.body.discussId){
        const discussObj = await discussDB.findTaskDiscuss(req.body.taskId)
        var teamId = discussObj.teamId
        return teamId
    }
}
export const isMember = async (req, res, next) =>{
    console.log('!!!!!!!!!!!!!!!!!!!')
    console.log(req.rSession)
    var teamId = await getTeamId(req, res, next)
    if(!teamId){
        next()
    }
    else{
        var userId = req.rSession.userId
        const result = await roleDB.findRole(userId, teamId)
        if(!result){
            resProcessor.jsonp(req, res, {
                state: { code: 2000, msg: '权限不足' },
                data: {}
            });
        }
        else{
            if(result.role === "member"||"admin"||"creator"){
                next()
            }
            else{
                resProcessor.jsonp(req, res, {
                    state: { code: 2000, msg: '权限不足' },
                    data: {}
                });
            }
        }
    }
}

export const isAdmin = async (req, res, next) =>{
    var teamId = await getTeamId(req, res, next)
    if(!teamId){
        next()
    }
    else{
        var userId = req.rSession.userId
        const result = await roleDB.findRole(userId, teamId)
        if(!result){
            resProcessor.jsonp(req, res, {
                state: { code: 2000, msg: '权限不足' },
                data: {}
            });
        }
        else{
            if(result.role === "admin"||"creator"){
                next()
            }
            else{
                resProcessor.jsonp(req, res, {
                    state: { code: 2000, msg: '权限不足' },
                    data: {}
                });
            }
        }
    }
}

export const isCreator = async (req, res, next) => {
    var teamId = await getTeamId(req, res, next)
    if(!teamId){
        next()
    }
    else{
        var userId = req.rSession.userId
        const result = await roleDB.findRole(userId, teamId)
        if(!result){
            resProcessor.jsonp(req, res, {
                state: { code: 2000, msg: '权限不足' },
                data: {}
            });
        }
        else{
            if(result.role === "creator"){
                next()
            }
            else{
                resProcessor.jsonp(req, res, {
                    state: { code: 2000, msg: '权限不足' },
                    data: {}
                });
            }
        }
    }
}