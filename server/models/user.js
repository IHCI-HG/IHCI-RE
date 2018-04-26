const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

/*
    密码不存明文
    库里存sha1 hash过的密码 （key 在conf.salt里)
    认证的时候传入hash过的密码
*/

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
    createUser: async function(username, password) {
        const result = await this.findOne({username: username}).exec()
        if(result) {
            return null
        } else {
            return this.create({
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

}

mongoose.model('user', userSchema);