const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

/*
    密码不存明文
    库里存sha1 hash过的密码 （key 在conf.salt里)
    认证的时候传入hash过的密码
*/

/*
wxUserInfo 
{
    "openid": "oAX1fwRD4MfWXbsP5NJdUX4l2kGU",
    "nickname": "Arluber",
    "sex": 1,
    "language": "zh_CN",
    "city": "Guangzhou",
    "province": "Guangdong",
    "country": "CN",
    "headimgurl": "http://thirdwx.qlogo.cn/mmopen/vi_32/kQviaoWtNgHxz8aRwWR9pctqMia8NkohnwuWuHIJ14MtoXSNGibHV9QEskAib9RiaxW1jeJetkHyWVzqtuiacs7emH0g/132",
    "privilege": [],
    "unionid": "oTq_VwNhsB143AYULDVgm7PTQaLI"
}
*/

// teamList : {teamId: teamId, role: role, marked: false}

const userSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    username: { type: String , required: true , index: true },
    password: { type: String , required: true },
    personInfo: mongoose.Schema.Types.Mixed,
    teamList: [mongoose.Schema.Types.Mixed],
    openid: String,
    unionid: { type: String, index: true },
    subState: Boolean,
    wxUserInfo: mongoose.Schema.Types.Mixed
})

userSchema.statics = {
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

mongoose.model('user', userSchema);