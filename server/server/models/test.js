const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const testSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    id: { type: Number , default: '' },
    hashedKey: String,
})

testSchema.statics = {
    s_search: function(id, cb) {
        return this.find({id: id}).exec(cb)
    },
    add: function(key, cb) {
        this.create({
            id: parseInt(Math.random() * 1000),
            hashedKey: crypto.createHmac('sha1', conf.salt).update(key).digest('hex')
        }, cb)
    },
    check: async function(id, hashKey) {
        const result = await this.findOne({id: id}).exec()
        console.log('result:', result);
        console.log('result:', result._id);
        return result.hashedKey == hashKey
    },
    findById: async function (_id) {
        const result = await this.findOne({_id: _id}).exec()
        console.log('result:', result);
        return result
    }
}

const testModule = mongoose.model('test', testSchema);