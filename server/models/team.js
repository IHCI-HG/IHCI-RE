const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const teamSchema = new mongoose.Schema({
    create_time: { type: String, default: Date.now },

    name: { type: String, default: '' },
    teamImg: { type: String, default: '' },
    teamDes: { type: String, default: '' },

    topicList: [mongoose.Schema.Types.Mixed],
    memberList: [mongoose.Schema.Types.Mixed],
    taskList: [mongoose.Schema.Types.Mixed],
    tasklistList: [mongoose.Schema.Types.Mixed]

})

/* memberListItem
    {
        userId,
        role: 'creator' | 'admin' | 'member'
    }
*/

teamSchema.statics = {

    // teamInfo 操作
    createTeam: async function (name, imgUrl, des) {
        return this.create({
            name: name,
            teamImg: imgUrl,
            teamDes: des,
            topicList: [],
            memberList: [],
        })
    },

    updateTeam: async function (teamId, teamInfo) {
        const result = await this.findByIdAndUpdate(teamId, teamInfo, () => { })
        return result
    },
    findByTeamId: function (teamId) {

        return this.findById(teamId)
    },

    // member 操作

    addMember: function (teamId, userId, role) {
        return this.update(
            { _id: teamId },
            { $addToSet: { memberList: { userId: userId, role: role } } }
        ).exec()
    },
    delMember: async function (teamId, userId) {
        return this.update(
            { _id: teamId },
            { $pull: { memberList: { userId: userId } } }
        ).exec()
    },

    changeMemberRole: async function (teamId, userId, role) {
        return this.update(
            { _id: teamId, "memberList.userId": userId },
            { $set: { "memberList.$.role": role } },

        ).exec()
    },

    // topic 操作
    addTopic: async function (teamId, topicObj) {
        return this.update(
            { _id: teamId },
            { $push: { topicList: topicObj } }
        ).exec()
    },
    updateTopic: async function (teamId, topicId, editTopic) {
        const result = await this.update(
            { _id: teamId, "topicList._id": mongoose.Types.ObjectId(topicId) },
            { $set: { 
                "topicList.$.title": editTopic.title, 
                "topicList.$.content": editTopic.content,
                "topicList.$.creator": editTopic.creator,} }
        ).exec()
        return result;
    },
    delTopic: async function (teamId, topicId) {
        return this.update(
            { _id: teamId },
            { $pull: { topicList: { _id: mongoose.Types.ObjectId(topicId) } } }
        ).exec()
    },

    // task 操作
    addTask: async function (teamId, taskObj) {
        return this.update(
            { _id: teamId },
            { $push: { taskList: taskObj } }
        ).exec()
    },
    updateTask: async function (teamId, taskId, editTask) {
        return this.update(
            { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
            {
                $set: {
                    "taskList.$.title": editTask.title,
                    "taskList.$.header": editTask.header,
                    "taskList.$.content": editTask.content,
                    "taskList.$.deadline": editTask.deadline,
                    "taskList.$.completed_time": editTask.completed_time,
                    "taskList.$.state": editTask.state,
                    "taskList.$.completer": editTask.completer
                }
            }
        ).exec()
    },
    // updateTask: async function (teamId, taskId, editTask) {
    //     return this.update(
    //         { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.header": editTask.header } }
    //     ).update(
    //         { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.content": editTask.content } }
    //     ).update(
    //         { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.deadline": editTask.deadline } }
    //     ).update(
    //         { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.completed_time": editTask.completed_time } }
    //     ).update(
    //         { _id: teamId, "taskList._id": mongoose.Types.ObjectId(taskId) },
    //         { $set: { "taskList.$.state": editTask.state } }
    //     ).exec()
    // },
    delTask: async function (teamId, taskId) {
        return this.update(
            { _id: teamId },
            {
                $pull: {
                    taskList: {
                        _id: mongoose.Types.ObjectId(taskId)
                    }
                }
            }
        ).exec()
    },

    //tasklist操作
    addTasklist: async function (teamId, tasklistObj) {
        return this.update(
            { _id: teamId },
            { $push: { tasklistList: tasklistObj } }
        ).exec()
    },
    updateTasklist: async function (teamId, tasklistId, editTasklist) {
        return this.update(
            { _id: teamId, "tasklistList._id": mongoose.Types.ObjectId(tasklistId) },
            { $set: { "tasklistList.$.name": editTasklist.name } }
        ).exec()
    },
    delTasklist: async function (teamId, tasklistId) {
        return this.update(
            { _id: teamId },
            {
                $pull: {
                    tasklistList:
                        {
                            _id: mongoose.Types.ObjectId(tasklistId)
                        }
                }
            }
        ).exec()
    },
    changeTaskIndex: async function (teamId, index, task) {
        return this.update(
            {_id: teamId,},
            { $push: 
                { taskList: {
                $each: [task,""] ,
                $position:index} } }
        ).exec()
    },
    delNonSence: async function (teamId) {
        return this.update(
            { _id: teamId },
            {
                $pull: {
                    taskList: ""
                }
            }
        ).exec()
    },
    changeListIndex: async function (teamId, index, list) {
        return this.update(
            {_id: teamId,},
            { $push: 
                { tasklistList: {
                $each: [list,""] ,
                $position:index} } }
        ).exec()
    },
    delListNonSence: async function (teamId) {
        return this.update(
            { _id: teamId },
            {
                $pullAll: {
                    tasklistList: ["",null]
                }
            }
        ).exec()
    },
}

mongoose.model('team', teamSchema);