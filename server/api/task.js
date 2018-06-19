var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'

import {
    createTopicTemplate,
    replyTopicTemplate
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var topicDB = mongoose.model('topic')
var discussDB = mongoose.model('discuss')
var timelineDB = mongoose.model('timeline')
var taskDB = mongoose.model('task')

const createTask = async (req, res, next) => {
    const userId = req.rSession.userId;
    const taskTitle = req.body.title;
    const taskContent = req.body.content;
    const fileList = req.body.fileList;
    const teamId = req.body.teamId;
    const taskDeadline = req.body.deadline;
    const taskHeader = req.body.header;

    console.log("teamId:" + teamId);

    if (!taskHeader || !taskContent) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.findByUserId(userId);
        const result = await taskDB.createTask(taskTitle, taskContent, userObj, fileList, teamId, taskDeadline, taskHeader);

        console.log("..............................");
        console.log(result);
        console.log("..............................");

        await teamDB.addTask(teamId, result)
        const teamObj = await teamDB.findByTeamId(teamId)
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'CREATE_TASK', result._id, result.title, result)

        //todo 有负责人，走微信模板下发流程

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        })

    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const editTask = async (req, res, next) => {
    const teamId = req.body.teamId;
    const taskId = req.body.taskId;
    const editTask = req.body.editTask;

    const userId = req.rSession.userId;

    if (!teamId || !taskId || !editTask) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        var taskObj = await taskDB.findByTaskId(taskId);
        const userObj = await userDB.findByUserId(userId);
        const teamObj = await teamDB.findByTeamId(teamId);

        if (!taskObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: "任务不存在" },
                data: {}
            })
        }

        console.log(editTask);
        console.log(editTask.header);

        if (editTask.title != undefined) {
            taskObj.title = editTask.title
        }
        if (editTask.content != undefined) {
            taskObj.content = editTask.content
        }
        if (editTask.fileList != undefined) {
            taskObj.fileList = editTask.fileList
        }
        if (editTask.deadline != undefined) {
            taskObj.deadline = editTask.deadline
            console.log(editTask.deadline);
        }
        if (editTask.header != undefined) {
            taskObj.header = editTask.header
            console.log(editTask.header);
        }
        if (editTask.state != undefined) {
            taskObj.state = editTask.state
        }

        console.log(taskObj);

        const result1 = await taskDB.updateTask(taskId, taskObj);
        const result2 = await teamDB.updateTask(teamId, taskId, taskObj);

        //todo 给负责人发送微信下发模板

        //todo 还要在timeline中添加项目
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_TASK', result1._id, result1.title, result1)


        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {
                result1: result1,
                result2: result2
            }
        })

    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const taskInfo = async (req, res, next) => {
    const taskId = req.body.taskId
    const userId = req.rSession.userId

    if (!taskId) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: taskObj
        })
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const addCheckitem = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const checkitem = req.body.checkitem;

    const userId = req.rSession.userId;

    if (!taskId || !checkitem.content) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const teamObj = await teamDB.findByTeamId(teamId);
        const userObj = await userDB.findByUserId(userId);

        checkitem.creator = checkitem.creator || userObj;
        checkitem.header = checkitem.header || "";
        checkitem.deadline = checkitem.deadline || "";

        if (checkitem.header != "") {
            //todo 给负责人下发微信模板
        }

        const result1 = await taskDB.appendCheckitem(taskId, checkitem);
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'APPEND_CHECKITEM', taskId, checkitem.content, checkitem)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result1
        })
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }

}

const dropCheckitem = async (req, res, next) => {
    const taskId = req.body.taskId;
    const checkitemId = req.body.checkitemId;
    const teamId = req.body.teamId;

    const userId = req.rSession.userId;

    if (!taskId || !checkitemId) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const teamObj = await teamDB.findByTeamId(teamId);
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }
        const result1 = await taskDB.dropCheckitem(taskId, checkitemId);
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'DROP_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result1
        })
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }


}

const findCheckitem = async (req, res, next) => {
    const taskId = req.body.taskId;
    const checkitemId = req.body.checkitemId;
    const teamId = req.body.teamId;

    const userId = req.rSession.userId;

    if (!checkitemId || !taskId) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const teamObj = await teamDB.findByTeamId(teamId);
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'OPEN_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: checkitemObj
        })
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const editCheckitem = async (req, res, next) => {
    const taskId = req.body.taskId;
    const checkitemId = req.body.checkitemId;
    const teamId = req.body.teamId;
    const editCheckitem = req.body.editCheckitem;

    const userId = req.rSession.userId;

    if (!checkitemId || !editCheckitem) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const teamObj = await teamDB.findByTeamId(teamId);
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }

        checkitemObj.content = editCheckitem.content || checkitemObj.content || "";
        checkitemObj.header = editCheckitem.header || checkitemObj.header || "";
        checkitemObj.deadline = editCheckitem.deadline || checkitemObj.deadline || "";
        checkitemObj.completed_time = editCheckitem.completed_time || checkitemObj.completed_time || "";
        checkitemObj.state = editCheckitem.state || checkitemObj.state || "false";

        console.log(checkitemObj);

        const result1 = taskDB.updateCheckitem(taskId, checkitemId, checkitemObj);
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: checkitemObj
        })
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const copyTask = async (req, res, text) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const copyCount = req.body.copyCount;

    if (!taskId || !teamId || !copyCount) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);

    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}



module.exports = [
    ['POST', '/api/task/create', apiAuth, createTask],
    ['POST', '/api/task/edit', apiAuth, editTask],
    ['POST', '/api/task/taskInfo', apiAuth, taskInfo],
    ['POST', '/api/task/addCheckitem', apiAuth, addCheckitem],
    ['POST', '/api/task/dropCheckitem', apiAuth, dropCheckitem],
    ['POST', '/api/task/findCheckitem', apiAuth, findCheckitem],
    ['POST', '/api/task/editCheckitem', apiAuth, editCheckitem],
]