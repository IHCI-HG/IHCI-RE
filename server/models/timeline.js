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