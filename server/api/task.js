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
var tasklistDB = mongoose.model('tasklist')

const createTasklist = async (req, res, next) => {
    const userId = req.rSession.userId;
    const listname = req.body.name;
    const teamId = req.body.teamId;

    if (!listname || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.findByUserId(userId);
        const tasklist = await tasklistDB.createTasklist(userObj, listname, teamId);

        await teamDB.addTasklist(teamId, tasklist)

        const result = {
            id: tasklist._id,
            name: listname
        }

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

const updateTasklist = async (req, res, next) => {
    const userId = req.rSession.userId;
    const listId = req.body.listId;
    const name = req.body.name;
    const teamId = req.body.teamId;

    const editTasklist = {
        name: name,
        listid: listId
    }

    if (!listId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.findByUserId(userId);
        const result = await tasklistDB.updateTasklist(listId, editTasklist);

        await teamDB.updateTasklist(teamId, listId, editTasklist)

        if (result.ok) {
            resProcessor.jsonp(req, res, {
                state: { code: 0, msg: '请求成功' },
                data: editTasklist
            })
        } else {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '操作失败' },
                data: {}
            });
        }
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }

}


const delTasklist = async (req, res, next) => {
    const userId = req.rSession.userId;
    const listId = req.body.listId;

    if (!listId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const result = await tasklistDB.delTasklist(listId);

        await teamDB.delTasklist(listId)

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

const findTasklistById = async (req, res, next) => {
    const userId = req.rSession.userId;
    const listId = req.query.listId;

    if (!listId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const result = await tasklistDB.findByTasklistId(listId);

        const taskNum = result.taskList.length;
        var checkitemNum = 0;
        var checkitemDoneNum = 0;
        for (var i = 0; i < taskNum; i++) {
            const taskObj = await taskDB.findByTaskId(result.taskList[i]._id);
            const checkitemList = taskObj.checkitemList;
            checkitemNum += taskObj.checkitemList.length;
            for (var i = 0; i < checkitemList.length; i++) {
                if (checkitemList[i].state == true) {
                    checkitemDoneNum += 1;
                }
            }
        }
        // result["taskNum"] = taskNum;
        // result["checkItemNum"] = checkitemNum;
        // result["checkItemDoneNum"] = checkitemDoneNum;

        console.log(result);
        const taskarr = []
        for (var i = 0; i < result.taskList.length; i++) {
            const temp_data = {
                id: result.taskList[i]._id,
                title: result.taskList[i].title,
                content: result.taskList[i].content,
                deadline: result.taskList[i].deadline,
                header: result.taskList[i].header,
                state: result.taskList[i].state,
                completed_time: result.taskList[i].completed_time
            }
            taskarr.push(temp_data)
        }

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: {
                tasklist: taskarr,
                taskNum: taskNum,
                checkItemNum: checkitemNum,
                checkItemDoneNum: checkitemDoneNum,
                id: result._id,
                name: result.name
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

const createTask = async (req, res, next) => {
    const userId = req.rSession.userId;
    const taskTitle = req.body.name;
    const taskContent = req.body.desc;
    const fileList = req.body.fileList || [];
    const teamId = req.body.teamId || "";
    const tasklistId = req.body.listId || "";
    const taskDeadline = req.body.ddl || "";
    const taskHeader = req.body.assigneeId || "";

    console.log("teamId:" + teamId);

    if (!taskTitle) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.findByUserId(userId);
        const result = await taskDB.createTask(taskTitle, taskContent, userObj, fileList, teamId, tasklistId, taskDeadline, taskHeader);

        // if (teamId) {
        //     await teamDB.addTask(teamId, result)
        //     // const teamObj = await teamDB.findByTeamId(teamId)
        //     // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'CREATE_TASK', result._id, result.title, result)
        // }

        if (tasklistId) {
            //如果是有清单的则在清单中添加
            await tasklistDB.addTask(tasklistId, result)
        } else {
            await teamDB.addTask(teamId, result)
        }

        const taskObj = {
            id: result._id,
            title: result.title,
            content: result.content,
            deadline: result.deadline,
            header: result.header,
            teamId: teamId,
            listId: tasklistId
        }

        //todo 有负责人，走微信模板下发流程

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

const delTask = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const tasklistId = req.body.listId;

    const userId = req.rSession.userId;

    if (!taskId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const result = await taskDB.delTaskById(taskId);
        console.log(result);
        if (result.ok == 1) {
            if (tasklistId) {
                await tasklistDB.delTask(tasklistId, taskId);
            } else {
                await teamDB.delTask(teamId, taskId);
            }
            resProcessor.jsonp(req, res, {
                state: { code: 0, msg: '请求成功' },
                data: result
            })
        } else {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '操作失败' },
                data: {}
            });
            console.error(error);
        }
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
    const tasklistId = req.body.listId;
    const editTask = req.body.editTask;
    console.log(tasklistId);

    const userId = req.rSession.userId;

    if (!taskId || !editTask) {
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

        taskObj.title = editTask.name || taskObj.title;
        taskObj.content = editTask.desc || taskObj.content;
        taskObj.fileList = editTask.fileList || taskObj.fileList;
        taskObj.deadline = editTask.ddl || taskObj.deadline;
        taskObj.header = editTask.assigneeId || taskObj.header;
        if (editTask.hasDone == "true") {
            taskObj.state = true;
            taskObj.completed_time = new Date();
        } else {
            taskObj.state = false;
            taskObj.completed_time = "";
        }

        console.log(taskObj);

        const result1 = await taskDB.updateTask(taskId, taskObj);
        if (tasklistId) {
            await tasklistDB.updateTask(tasklistId, taskId, taskObj);
        } else {
            await teamDB.updateTask(teamId, taskId, taskObj);
        }

        //todo 给负责人发送微信下发模板

        //todo 还要在timeline中添加项目
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_TASK', result1._id, result1.title, result1)

        taskObj.creator = null

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

const taskInfo = async (req, res, next) => {
    const taskId = req.query.taskId
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
    const taskId = req.body.todoId;
    const content = req.body.name;
    const header = req.body.assigneeId || "";
    const deadline = req.body.ddl || "";

    const userId = req.rSession.userId;

    if (!taskId || !content) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const userObj = await userDB.findByUserId(userId);

        const checkitem = {
            content: content,
            creator: userObj,
            header: header || "",
            deadline: deadline || ""
        }

        if (checkitem.header != "") {
            //todo 给负责人下发微信模板
        }

        const result1 = await taskDB.appendCheckitem(taskId, checkitem);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'APPEND_CHECKITEM', taskId, checkitem.content, checkitem)

        const lastCheckitem = result1.checkitemList[result1.checkitemList.length - 1]
        const checkitemObj = {
            id: lastCheckitem._id,
            content: lastCheckitem.content,
            header: lastCheckitem.header,
            deadline: lastCheckitem.deadline,
            taskId: taskId,
        }

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

const dropCheckitem = async (req, res, next) => {
    const taskId = req.body.todoId;
    const checkitemId = req.body.checkitemId;

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
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }
        const result1 = await taskDB.dropCheckitem(taskId, checkitemId);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'DROP_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

        if (result1.ok == 1) {
            resProcessor.jsonp(req, res, {
                state: { code: 0, msg: '请求成功' },
                data: checkitemObj
            })
        }


    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const findCheckitem = async (req, res, next) => {
    const taskId = req.query.todoId;
    const checkitemId = req.query.checkitemId;

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
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'OPEN_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)


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
    const taskId = req.body.todoId;
    const checkitemId = req.body.checkitemId;
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
        const userObj = await userDB.findByUserId(userId);

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }

        checkitemObj.content = editCheckitem.name || checkitemObj.content || "";
        checkitemObj.header = editCheckitem.assigneeId || checkitemObj.header || "";
        checkitemObj.deadline = editCheckitem.ddl || checkitemObj.deadline || "";
        if (editCheckitem.hasDone == "true") {
            checkitemObj.state = true;
            checkitemObj.completed_time = new Date();
        } else {
            checkitemObj.state = false;
            checkitemObj.completed_time = "";
        }

        console.log(checkitemObj);

        const result1 = taskDB.updateCheckitem(taskId, checkitemId, checkitemObj);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

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
    ['POST', '/api/task/createTasklist', apiAuth, createTasklist],
    ['POST', '/api/task/updateTasklist', apiAuth, updateTasklist],
    ['GET', '/api/task/findTasklistById', apiAuth, findTasklistById],
    ['POST', '/api/task/create', apiAuth, createTask],
    ['POST', '/api/task/delTask', apiAuth, delTask],
    ['POST', '/api/task/edit', apiAuth, editTask],
    ['GET', '/api/task/taskInfo', apiAuth, taskInfo],
    ['POST', '/api/task/addCheckitem', apiAuth, addCheckitem],
    ['POST', '/api/task/dropCheckitem', apiAuth, dropCheckitem],
    ['GET', '/api/task/findCheckitem', apiAuth, findCheckitem],
    ['POST', '/api/task/editCheckitem', apiAuth, editCheckitem],
]