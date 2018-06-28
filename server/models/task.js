const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')
const Schema = mongoose.Schema

const taskSchema = new Schema({
    create_time: { type: String, default: Date.now },
    title: String,
    content: String,
    creator: { type: mongoose.Schema.Types.Mixed, require: true },
    fileList: [mongoose.Schema.Types.Mixed],
    teamId: String,
    tasklistId: String,
    deadline: { type: Date },
    completed_time: { type: Date },
    header: String,
    state: Boolean,
    checkitemList: [{
        create_time: { type: String, default: Date.now },
        content: String,
        creator: { type: mongoose.Schema.Types.Mixed, required: true },
        header: String,
        deadline: String,
        completed_time: String,
        state: Boolean,
    }],
    discussList: [mongoose.Schema.Types.Mixed]
})

taskSchema.statics = {
    createTask: async function (title, content, creator, fileList, teamId, tasklistId, deadline, header) {
        return this.create({
            title: title,
            content: content,
            creator: creator,
            fileList: fileList || [],
            teamId: teamId,
            tasklistId: tasklistId,
            deadline: deadline,
            header: header,
            checkitemList: [],
            state: false,
            discussList: []
        })
    },

    updateTask: async function (taskId, taskObj) {
        const result = await this.findByIdAndUpdate(taskId, taskObj, () => { })
        return result
    },

    delTaskById: async function (taskId) {
        const result = await this.remove({ _id: taskId }).exec()
        return result
    },

    findByTaskId: function (taskId) {
        return this.findById(taskId)
    },

    findByTaskIdList: function (taskIdList) {
        const queryList = []
        taskIdList.map((item) => {
            queryList.push({ _id: item })
        })
        if (queryList && queryList.length) {
            return this.find({ $or: queryList }).sort({ create_time: -1 }).exec()
        } else {
            return []
        }
    },

    appendCheckitem: async function (taskId, checkitemObj) {
        const result = await this.findOneAndUpdate(
            { _id: taskId },
            {
                $push: {
                    checkitemList: {
                        content: checkitemObj.content,
                        creator: checkitemObj.creator,
                        header: checkitemObj.header,
                        deadline: checkitemObj.deadline
                    }
                }
            },
            {
                'new': true
            }
        ).exec()
        return result
    },

    dropCheckitem: async function (taskId, checkitemId) {
        return this.update(
            { _id: taskId },
            {
                $pull: {
                    checkitemList: {
                        _id: checkitemId
                    }
                }
            }
        ).exec()
    },



    updateCheckitem: async function (taskId, checkitemId, checkitemObj) {
        return this.update(
            { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
            {
                $set: {
                    "checkitemList.$.content": checkitemObj.content,
                    "checkitemList.$.header": checkitemObj.header,
                    "checkitemList.$.deadline": checkitemObj.deadline,
                    "checkitemList.$.completed_time": checkitemObj.completed_time,
                    "checkitemList.$.state": checkitemObj.state
                }
            }
        ).exec()
    },

    addDiscuss: async function (taskId, discussId) {
        const result = await this.update({ _id: taskId }, { $push: { discussList: { _id: discussId } } });
        return result;
    },

    delDiscuss: async function (taskId, discussId) {
        const result = await this.update({ _id: taskId }, { $pull: { discussList: { _id: mongoose.Types.ObjectId(discussId) } } });
        return result;
    }

}

mongoose.model('task', taskSchema);