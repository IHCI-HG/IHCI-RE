const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const topicSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    title: String,
    content: String,
    creator: { type: String , required: true },
    team: String, // team的_id
    discussList: [mongoose.Schema.Types.Mixed],
})

topicSchema.statics = {
    createTopic: async function(title, content, creator, teamId) {
        return this.create({
            title: title, 
            content: content,
            creator: creator,
            team: teamId,
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
    

    addDiscuss: async function(topicId, discussObj) {
        return this.update(
            {_id: topicId},
            { $addToSet: { discussList: discussObj}}
        ).exec()
    },
    delDiscuss: async function(topicId, discussId) {
        return this.update(
            {_id: topicId},
            { $pull: { discussList: {discussId: discussId}}}
        ).exec()
    },
    updateDiscuss: async function(topicId, discussId, discussObj) {
        return this.update(
            {_id: topicId, "discussList._id": discussId},
            { $set: { "discussList.$": discussObj}}
        ).exec()
    },

}

mongoose.model('topic', topicSchema);