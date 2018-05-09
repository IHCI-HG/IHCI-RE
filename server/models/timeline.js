const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const timelineSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    teamId: {type: String, required: true , index: true},
    creator: mongoose.Schema.Types.Mixed,
    tType: String,
    title: String,
    content: String,
    tarId: String,
})

timelineSchema.statics = {
    createUser: async function(username, password, userInfo = {}) {
        const result = await this.findOne({username: username}).exec()
        if(result) {
            return null
        } else {
            return this.create({
                ...userInfo,
                username: username,
                password: crypto.createHmac('sha1', conf.salt).update(password).digest('hex'),
            })
        }
    },
    authJudge: async function(un, pw) {
        const result = await this.findOne({username: un}).exec()
        if(result) {
            return result.password == pw ? result : null
        } else {
            return null
        }
    },
    findByUserId: async function(userId) {
        const result = await this.findById(userId)
        return result
    },
    findByUnionId: async function(unionid) {
        const result = await this.findOne({unionid: unionid}).exec()
        return result
    },
    findByUsername: async function(username) {
        const result = await this.findOne({username: username}).exec()
        return result
    },
    updateUser: async function(userId, userObj) {
        const result = await this.findByIdAndUpdate(userId, userObj, () => {})
        return result
    },
    updateUserByUid: async function(unionid, userObj) {
        const result = await this.findOneAndUpdate({unionid: unionid}, userObj, () => {})
        return result
    },


    // team 操作相关
    addTeam: async function(userId, teamId, role) {
        return this.update(
            {_id: userId},
            { $addToSet: { teamList: {teamId: teamId, role: role, marked: false}}}
        ).exec()
    },
    delTeam: async function(userId, teamId) {
        return this.update(
            {_id: userId},
            { $pull: { teamList: {teamId: teamId}}}
        ).exec()
    },
    markTeam: async function(userId, teamId, markState) {
        return this.update(
            {_id: userId, "teamList.teamId": teamId},
            {$set: { "teamList.$.marked": markState}},
        ).exec()
    },
    changeTeamRole: async function(userId, teamId, role) {
        return this.update(
            {_id: userId, "teamList.teamId": teamId},
            {$set: { "teamList.$.role": role}},
        ).exec()
    }

}

mongoose.model('timeline', timelineSchema);