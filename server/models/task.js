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
    }]
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
            state: false
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

    appendCheckitem: async function (taskId, checkitemObj) {
        return this.update(
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
            }
        ).exec()
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

    // updateCheckitem: async function (taskId, checkitemId, checkitemObj) {
    //     return this.update(
    //         { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
    //         { $set: { "checkitemList.$.content": checkitemObj.content } }
    //     ).update(
    //         { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
    //         { $set: { "checkitemList.$.header": checkitemObj.header } }
    //     ).update(
    //         { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
    //         { $set: { "checkitemList.$.deadline": checkitemObj.deadline } }
    //     ).update(
    //         { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
    //         { $set: { "checkitemList.$.completed_time": checkitemObj.completed_time } }
    //     ).update(
    //         { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
    //         { $set: { "checkitemList.$.state": checkitemObj.state } }
    //     ).exec()
    // }

    updateCheckitem: async function (taskId, checkitemId, checkitemObj) {
        return this.update(
            { _id: taskId, "checkitemList._id": mongoose.Types.ObjectId(checkitemId) },
            { $set: { "checkitemList.$": checkitemObj } }
        ).exec()
    }

}

mongoose.model('task', taskSchema);