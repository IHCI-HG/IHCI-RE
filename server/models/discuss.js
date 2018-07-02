const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const discussSchema = new mongoose.Schema({
    create_time: { type: String, default: Date.now },
    title: String,
    content: {type: mongoose.Schema.Types.Mixed},
    creator: { type: mongoose.Schema.Types.Mixed, required: true },
    fileList: [mongoose.Schema.Types.Mixed],
    teamId: String,
    topicId: String,
})

discussSchema.statics = {
    createDiscuss: async function (teamId, topicId, title, content, creatorObj, fileList) {
        return this.create({
            teamId: teamId,
            topicId: topicId,
            title: title,
            content: content,
            creator: creatorObj,
            fileList: fileList || [],
        })
    },

    updateDiscuss: async function (discussId, discussObj) {
        const result = await this.findByIdAndUpdate(discussId, discussObj, () => { })
        return result
    },

    delDiscussById: async function (discussId) {
        const result = await this.remove({ _id: discussId }).exec()
        return result
    },

    // updateTopic: async function(topicId, topicObj) {
    //     const result = await this.findByIdAndUpdate(topicId, topicObj, () => {})
    //     return result
    // },
    // findByTopicId: async function(topicId) {
    //     const result = await this.findById(topicId)
    //     return result
    // },

    findTaskDiscuss: async function (DiscussId) {
        const result = await this.findById(DiscussId);
        return result;
    },

    //7.2
    getDiscussByPage:async function(queryList,currentPage){
        var pageSize = 20;
        var sortFunc = {create_time:-1};
        var skipNumber = (currentPage - 1) * pageSize;

        var result;
        if (queryList && queryList.length) {
            result = await this.find({ $or: queryList }).skip(skipNumber).limit(pageSize).sort(sortFunc).exec();
            return result;
        } else {
            return [];
        }
    }

}

mongoose.model('discuss', discussSchema);