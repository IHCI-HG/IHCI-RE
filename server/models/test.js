const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const testSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    id: { type: Number , default: '' },
    hashedKey: String,
})

// 保存
// const testEntity = new testModule({
//     data: 'csscscscscs'
// })
// testEntity.save().then((e) => {
//     console.log(e);
// })

// 查询
// testModule.where('data')
// testModule.find({'data': 'csscscscscs'}).exec(function (err, docs) {
//     console.log(docs[0].data);
// })

// testSchema.method = {
//     encryptKey: function (key) {
//         return crypto.createHmac('sha1', conf.salt).update(key).digest('hex');
//     }
// }

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
        console.log('result:', result.hashedKey);
        console.log('input:', hashKey);
        return result.hashedKey == hashKey
    }
}

const testModule = mongoose.model('test', testSchema);