const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const userSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    username: { type: String , default: '' },
    password: { type: String , default: '' },
    name: String,
    phone: String,
    mail: String,
    wechat: String,
    QQ: String,
    headImgUrl: String,
})

userSchema.statics = {
    createUser: async function(username, password, data, cb) {
        const result = await this.findOne({username: username}).exec()
        if(result) {
            return false
        } else {
            return this.create({
                ...data,
                username: username,
                password: crypto.createHmac('sha1', conf.salt).update(password).digest('hex'),
            }, cb)
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

    findUserById: async function(userId) {
        const result = await this.findById(userId)
        return result
    },
    updateHeadImgUrl: async function (userId, headImgUrl) {
        try {
            const userInfo = await this.findById(userId)
            if(userInfo) {
                userInfo.headImgUrl = headImgUrl
                const result = await this.update({_id: userId}, userInfo)
                return result.ok == 1
            } else {
                return false
            }
        } catch (error) {
            return false
        }
    },

}

const testModule = mongoose.model('user', userSchema);