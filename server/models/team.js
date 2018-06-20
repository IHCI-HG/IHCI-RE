const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const teamSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},

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
    findByTeamId:  function(teamId) {
        return this.findById(teamId)
    },
    // findByTeamIdList: async function(teamIdList){                    //添加成员管理
    //     const queryList = []
    //     teamIdList.map((item) => {
    //         queryList.push({_id:item})
    //     })
    //     console.log("这是所有teamID:",queryList)
    //     if(queryList && queryList.length) {
    //         const result = await this.find({$or: queryList}).sort({create_time: -1}).exec()
    //         console.log("这是所有项目组：", result)
    //         return result
    //     } else {
    //         return []
    //     }
    // },
    // member 操作
    addMember: function(teamId, userId, role) {
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
    addTopic: async function(teamId, topicObj) {
        return this.update(
            {_id: teamId},
            { $push: { topicList : topicObj}}
        ).exec()
    },
    updateTopic: async function(teamId, topicId, editTopic) {
        return this.update(
            {_id: teamId, "topicList._id": mongoose.Types.ObjectId(topicId)},
            { $set: { "topicList.$.title" : editTopic.title}}
        ).update(
            {_id: teamId, "topicList._id": mongoose.Types.ObjectId(topicId)},
            { $set: { "topicList.$.content" : editTopic.content}}
        ).exec()
    },
    delTopic: async function(teamId, topicId) {
        return this.update(
            {_id: teamId},
            { $pull: { "topicList._id": topicId}}
        ).exec()
    },

}

mongoose.model('team', teamSchema);