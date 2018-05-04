const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const teamSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},

    name: { type: String, default: ''},
    teamImg: { type: String, default: ''},
    teamDes: { type: String, default: ''},

    topicList: [mongoose.Schema.Types.Mixed],
    memberList: [mongoose.Schema.Types.Mixed],
})

/* memberListItem
    {
        userId,
        role: 'creator' | 'admin' | 'member'
    }
*/

teamSchema.statics = {

    // teamInfo 操作
    createTeam: async function(name, imgUrl, des) {
        return this.create({
            name: name, 
            teamImg: imgUrl,
            teamDes: des,
            topicList: [],
            memberList: [],
        })
    },
    updateTeam: async function(teamId, teamInfo) {
        const result = await this.findByIdAndUpdate(teamId, teamInfo, () => {})
        return result
    },
    findByTeamId: async function(teamId) {
        const result = await this.findById(teamId)
        return result
    },

    // member 操作
    addMember: async function(teamId, userId, role) {
        return this.update(
            {_id: teamId},
            { $addToSet: { memberList: {userId: userId, role: role}}}
        ).exec()
    },
    delMember: async function(teamId, userId) {
        return this.update(
            {_id: teamId},
            { $pull: { memberList: {userId: userId}}}
        ).exec()
    },

    changeMemberRole: async function(teamId, userId, role) {
        return this.update(
            {_id: teamId, "memberList.userId": userId},
            {$set: { "memberList.$.role": role}},
        ).exec()
    },

    // topic 操作
    addTopic: async function(teamId, topicId) {
        return this.update(
            {_id: teamId},
            { $push: { topicList : topicId}}
        ).exec()
    },
    delTopic: async function(teamId, topicId) {
        return this.update(
            {_id: teamId},
            { $pull: { topicList: topicId}}
        ).exec()
    },

}

mongoose.model('team', teamSchema);