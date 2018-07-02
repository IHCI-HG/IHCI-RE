const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const timelineSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    teamId: {type: String, required: true , index: true},
    teamName: String,
    creatorId: {type: String, index: true},
    creator: mongoose.Schema.Types.Mixed,
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

    findByTeamId: function(teamId) {
        return this.find({teamId: teamId}).sort({create_time: -1}).exec()
    },

    findByTeamIdList: async function(teamIdList,currentPage) {

        var pageSize = 20;
        var sortFunc = {create_time:-1};
        var skipNumber = (currentPage - 1) * pageSize;

        const queryList = []
        teamIdList.map((item) => {
            queryList.push({teamId: item})
        })
        if(queryList && queryList.length) {
            var result = await this.find({$or: queryList}).skip(skipNumber).limit(pageSize).sort(sortFunc).exec();
            return result;
        } else {
            return []
        }
    },
}

mongoose.model('timeline', timelineSchema);