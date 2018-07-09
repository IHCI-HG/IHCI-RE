const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const followerSchema = new mongoose.Schema({
    openid: String,
    unionid: String,
})

followerSchema.statics = {
    createFollower: async function (openid, unionid) {
        return this.create({
            openid: openid,
            unionid: unionid
        })
    },
    findByUnionId: async function(unionid) {
        const result = await this.findOne({unionid: unionid}).exec()
        return result
    },
    delFollowerByUnionId: async function (unionid) {
        const result = await this.remove({ unionid: unionid }).exec()
        return result
    },
    delFollowerByOpenId: async function (openid) {
        const result = await this.remove({ openid: openid }).exec()
        return result
    },


}

mongoose.model('follower', followerSchema);