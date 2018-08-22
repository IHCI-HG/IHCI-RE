const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const timelineSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    teamId: {type: String, required: true , index: true},
    teamName: String,
    creatorId: {type: String, index: true},
    creator: {
        headImg: String,
        name: String,
        phone: String,
        mail: String,
        _id:mongoose.Schema.Types.ObjectId
    },
    type: String,
    tarId: String,
    title: String,
    content: mongoose.Schema.Types.Mixed,
})

/* 
    type:  
        CREATE_TOPIC
        REPLY_TOPIC

        //6.28
        CREATE_TOPIC
        DELETE_TOPIC

        REPLY_TOPIC
        DELETE_TOPIC_REPLY

        CREATE_TASK
        DELETE_TASK
        FINISH_TASK

        REPLY_TASK
        DELETE_TASK_REPLY

        CREATE_CHECK_ITEM
        DELETE_CHECK_ITEM
        FINISH_CHECITEM_ITEM

        COPY_TASK
        MOVE_TASK

        //7.5
        CREATE_TASKLIST
        DELETE_TASKLIST

        //7.6  
        CHANGE_TASK_HEADER
        CHANGE_CHECKITEM_HEADER
        CHANGE_TASK_DDL
        CHANGE_CHECKITEM_DDL
        REOPEN_TASK
        REOPEN_CHECKITEM

        //7.10
        EDIT_TASK
        EDIT_CHECK_ITEM




*/

timelineSchema.statics = {
    createTimeline: function(teamId, teamName, creator, type, tarId, title, content) {
        return this.create({
            teamId: teamId,
            teamName: teamName,
            creator: creator,
            type: type,
            tarId: tarId,
            title: title,
            content: content
        })
    },

    returnAll: function () {
        return this.find({}).sort({create_time: -1}).exec()
    },

    returnByTimeStampAndTeam: function(teamId,timeStamp) {
        return this.find({
            teamId: teamId,
            create_time:{
                $lt:timeStamp
            }}).limit(10).sort({create_time: -1}).exec()
    },

    firstReturnByTeam: function(teamId) {
        return this.find({teamId: teamId}).limit(20).sort({create_time: -1}).exec()
    },

    findByTeamId: function(teamId) {
        return this.find({teamId: teamId}).sort({create_time: -1}).exec()
    },

    findByCreatorId: async function(creatorId){
        return this.find({'creator._id': creatorId})
    },

    updateTimeline: async function(id, obj) {
        const result = await this.findByIdAndUpdate(id, obj,{ new: true }, () => {})
        return result
    },

    firstReturnByTeamIdList: function(teamIdList) {
        if(teamIdList && teamIdList.length) {
            return this.find({
                $or: teamIdList,
            }).limit(20).sort({create_time: -1}).exec()
        } else {
            return []
        }
    },

    returnByTimeStampAndTeamIdList: function(teamIdList,timeStamp) {
        teamIdList.map((item)=>{
            item.create_time = {
                $lt:timeStamp
            }
        })
        if(teamIdList && teamIdList.length) {
            return this.find({$or: teamIdList}).limit(10).sort({create_time: -1}).exec()
        } else {
            return []
        }
    },
    
    findByTeamIdList: function(teamIdList) {
        const queryList = []
        teamIdList.map((item) => {
            queryList.push({teamId: item})
        })
        if(queryList && queryList.length) {
            return this.find({$or: queryList}).sort({create_time: -1}).exec()
        } else {
            return []
        }
    },
}

mongoose.model('timeline', timelineSchema);