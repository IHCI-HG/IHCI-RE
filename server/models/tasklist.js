const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')
const Schema = mongoose.Schema

const tasklistSchema = new Schema({
    create_time: { type: String, default: Date.now },
    name: String,
    creator: { type: mongoose.Schema.Types.Mixed, require: true },
    teamId: String,
    taskList: []
})

tasklistSchema.statics = {
    createTasklist: async function (creator, name, teamId) {
        return this.create({
            creator: creator,
            name: name,
            teamId: teamId
        })
    },

    delTasklist: async function (tasklistId) {
        const result = await this.remove({ _id: tasklistId }).exec()
        return result
    },

    findByTasklistId: function (tasklistId) {
        return this.findById(tasklistId)
    },

    updateTasklist: async function (tasklistId, editTasklist) {
        return this.update(
            { _id: tasklistId },
            { $set: { "name": editTasklist.name } }
        ).exec()
    },

    addTask: async function (tasklistId, taskObj) {
        return this.update(
            { _id: tasklistId },
            { $push: { taskList: taskObj } }
        ).exec()
    },

    delTask: async function (tasklistId, taskId) {
        return this.update(
            { _id: tasklistId },
            { $pull: { taskList: { _id: mongoose.Types.ObjectId(taskId) } } }
        ).exec()
    },

    updateTask: async function (tasklistId, taskId, editTask) {
        return this.update(
            { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
            {
                $set: {
                    "taskList.$.title": editTask.title,
                    "taskList.$.header": editTask.header,
                    "taskList.$.content": editTask.content,
                    "taskList.$.deadline": editTask.deadline,
                    "taskList.$.completed_time": editTask.completed_time,
                    "taskList.$.state": editTask.state
                }
            }
        ).exec()
    },

    // updateTask: async function (tasklistId, taskId, editTask) {
    //     return this.update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.title": editTask.title } }
    //     ).update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.header": editTask.header } }
    //     ).update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.content": editTask.content } }
    //     ).update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.deadline": editTask.deadline } }
    //     ).update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.completed_time": editTask.completed_time } }
    //     ).update(
    //         { _id: tasklistId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.state": editTask.state } }
    //     ).exec()
    // },
}

mongoose.model('tasklist', tasklistSchema);
