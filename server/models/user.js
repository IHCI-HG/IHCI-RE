const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const userSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    userName: { type: String , default: '' },
    passWord: { type: String , default: '' },_
})

userSchema.statics = {
    createUser: async function(userName, passWord, cb) {
        const result = await this.findOne({un: un}).exec()
        this.create({
            userName: userName,
            passWord: crypto.createHmac('sha1', conf.salt).update(passWord).digest('hex')
        }, cb)
    },
    check: async function(un, pw) {
        const result = await this.findOne({un: un}).exec()
        console.log('result:', result.hashedKey);
        console.log('input:', hashKey);
        return result.hashedKey == hashKey
    }
}

const testModule = mongoose.model('user', userSchema);