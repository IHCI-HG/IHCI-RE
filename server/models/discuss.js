const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const discussSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    content: String,
    creator: { type: mongoose.Schema.Types.Mixed , required: true }, 
    fileList: [mongoose.Schema.Types.Mixed]
})

discussSchema.statics = {
    createTopic: async function(title, content, creatorObj, teamId) {
        return this.create({
            content: content,
            creator: creatorObj,
            discussList: [],
        })
    },
    delTopicById: async function(topicId) {
        const result = await this.remove({_id: topicId}).exec()
        return result
    },
    updateTopic: async function(topicId, topicObj) {
        const result = await this.findByIdAndUpdate(topicId, topicObj, () => {})
        return result
    },
    findByTopicId: async function(topicId) {
        const result = await this.findById(topicId)
        return result
    },

}

mongoose.model('discuss', discussSchema);