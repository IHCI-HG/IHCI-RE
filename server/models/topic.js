const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const topicSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    title: String,
    content: {type: mongoose.Schema.Types.Mixed},
    fileList: [mongoose.Schema.Types.Mixed],
    creator: {
        headImg: String,
        name: String,
        phone: String,
        mail: String
    },
    team: String, // team的_id
    discussList: [
        {   
            fileList: [mongoose.Schema.Types.Mixed],
            creator: {
                headImg: String,
                name: String,
                phone: String,
                mail: String
            },
            teamId: String,
            topicId: String,
            title: String,
            content: String,
            create_time: String,
        }
    ],
})
topicSchema.statics = {
    createTopic: async function(title, fileList, content, creatorObj, teamId) {
        return this.create({
            title: title, 
            fileList: fileList,
            content: content,
            creator: creatorObj,
            team: teamId,
            discussList: [],
        })
    },
    delTopicById: async function(topicId) {
        const result = await this.remove({_id: topicId}).exec()
        return result
    },
    updateTopic: async function(topicId, topicObj) {
        const result = await this.findByIdAndUpdate(topicId, topicObj,{ new: true }, () => {})
        return result
    },
    findByTopicId: function(topicId) {
        return this.findById(topicId)
    },
    findByTopicCreatorName: async function(creatorName){
        return this.find({'creator.name': creatorName})
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
    updateDiscuss: async function(topicId, discussId, content, fileList, creator) {
        return this.update(
            {_id: topicId, "discussList._id":  mongoose.Types.ObjectId(discussId)},
            { $set: { 
                "discussList.$.content": content,
                "discussList.$.fileList":fileList,
                "discussList.$.creator":creator,
            }}
        ).exec()
    },

    //6.22
    getByPage:async function(teamId,currentPage){
        var pageSize = 20;
        var sortFunc = {create_time:-1};
        var skipNumber = (currentPage - 1) * pageSize;

        const result = this.find({team:teamId}).skip(skipNumber).limit(pageSize).sort(sortFunc).exec();
        return result;
    }

}

mongoose.model('topic', topicSchema);
