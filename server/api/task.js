var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'

import {
    createTopicTemplate,
    replyTopicTemplate,
    createTaskTemplate
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
    const listDesc = req.body.desc;
    const teamId = req.body.teamId;

    if (!listname || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = (await userDB.findByUserId(userId)).toObject();
        const simpleUser = {
            _id: userObj._id,
            name: userObj.username
        }
        const tasklist = await tasklistDB.createTasklist(simpleUser, listname, listDesc, teamId);

        await teamDB.addTasklist(teamId, tasklist)

        const result = {
            id: tasklist._id,
            name: listname,
            desc: listDesc
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
    const desc = req.body.desc;

    const editTasklist = {
        name: name,
        listId: listId,
        desc: desc
    }

    if (!listId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
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
            console.log(checkitemList)
            checkitemNum += taskObj.checkitemList.length;
            for (var i = 0; i < checkitemList.length; i++) {
                console.log(checkitemList[i].state);
                if (checkitemList[i].state == true) {
                    checkitemDoneNum += 1;
                }
            }
        }
        const taskarr = []
        for (var i = 0; i < result.taskList.length; i++) {
            const userObj = await userDB.findByUserId(result.taskList[i].header);
            const temp_data = {
                id: result.taskList[i]._id,
                title: result.taskList[i].title,
                content: result.taskList[i].content,
                deadline: result.taskList[i].deadline,
                header: result.taskList[i].header,
                headername: userObj.username,
                headeravator: userObj.personInfo.headImg,
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
    const taskContent = req.body.desc || "";
    const fileList = req.body.fileList || [];
    const teamId = req.body.teamId || "";
    const tasklistId = req.body.listId || "";
    const taskDeadline = req.body.ddl || "";
    const taskHeader = req.body.assigneeId || "";

    if (!taskTitle) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const userObj = await userDB.findByUserId(userId);
        const simpleUser = {
            _id: userObj._id,
            name: userObj.username
        }
        const result = await taskDB.createTask(taskTitle, taskContent, simpleUser, fileList, teamId, tasklistId, taskDeadline, taskHeader);
        if (tasklistId) {
            //如果是有清单的则在清单中添加
            await tasklistDB.addTask(tasklistId, result)
        } else {
            await teamDB.addTask(teamId, result)
        }

        const user = await userDB.findByUserId(taskHeader)
        const headername = user.username
        const taskObj = {
            id: result._id,
            title: result.title,
            content: result.content,
            deadline: result.deadline,
            header: result.header,
            teamId: teamId,
            listId: tasklistId
        }

        const headerList = []
        headerList.push(taskHeader)

        //todo 有负责人，走微信模板下发流程
        if (taskHeader) {
            createTaskTemplate(headerList, result, headername)
        }

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
        const taskObj = taskDB.findByTaskId(taskId)
        const result = await taskDB.delTaskById(taskId);
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

        if (!taskObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: "任务不存在" },
                data: {}
            })
        }

        const task = {}
        task.title = editTask.name || taskObj.title;
        task.content = editTask.desc || taskObj.content;
        task.fileList = editTask.fileList || taskObj.fileList;
        task.deadline = editTask.ddl || taskObj.deadline;
        task.header = editTask.assigneeId || taskObj.header;
        if (editTask.hasDone == "true") {
            task.state = true;
            task.completed_time = new Date();
        } else {
            task.state = false;
            task.completed_time = "";
        }

        const result1 = await taskDB.updateTask(taskId, task);
        if (tasklistId) {
            await tasklistDB.updateTask(tasklistId, taskId, task);
        } else {
            await teamDB.updateTask(teamId, taskId, task);
        }

        //todo 给负责人发送微信下发模板

        //todo 还要在timeline中添加项目
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_TASK', result1._id, result1.title, result1

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: task
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

        if (!taskObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: "任务不存在" },
                data: {}
            })
        }

        const checkitemList = []
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            var checklitemHeaderId = taskObj.checkitemList[i].header;
            const userObj = userDB.findByUserId(checklitemHeaderId);
            const headername = userObj.username
            const checkitemObj = {
                _id: taskObj.checkitemList[i]._id,
                state: taskObj.checkitemList[i].state,
                content: taskObj.checkitemList[i].content,
                headerId: taskObj.checkitemList[i].header,
                headername: taskObj.checkitemList[i].headername,
                deadline: taskObj.checkitemList[i].deadline,
                completed_time: taskObj.checkitemList[i].completed_time
            }
            checkitemList.push(checkitemObj);
        }

        const result = {
            _id: taskObj._id,
            title: taskObj.title,
            content: taskObj.content,
            deadline: taskObj.deadline,
            header: taskObj.header,
            state: taskObj.state,
            completed_time: taskObj.completed_time,
            teamId: taskObj.teamId,
            listId: taskObj.tasklistId,
            checkitemList: checkitemList
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


//文威 6.22修改
const taskCopy = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const copyCount = req.body.copyCount;

    if (!taskId || copyCount <= 0) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        var returnObj = [];
        var copyObj = await taskDB.findByTaskId(taskId);
        delete copyObj._id;

        for (var i = 0; i < copyCount; i++) {
            var taskObj = await taskDB.create(copyObj);
            teamDB.addTask(teamId, taskObj);
            returnObj.push(taskObj);
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: returnObj
        });

    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const taskMove = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamIdMoveTo;
    const tasklistId = req.body.tasklistId;

    if (!taskId || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {

        var result = await taskDB.findByTaskId(taskId);
        result.create_time = Date.now;
        result.teamId = teamId;
        result.tasklistId = tasklistId || {};
        result.deadline = undefined;
        result.completed_time = undefined;
        result.header = undefined;
        result.state = false;

        for (x in result.checkitemList) {
            x.create_time = Date.now;
            x.header = undefined;
            x.deadline = undefined;
            x.completed_time = undefined;
        }
        result = taskDB.updateTask(taskId, result);


        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const createDiscuss = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId
    //const topicId = req.body.topicId
    const content = req.body.content
    const informList = req.body.informList || []

    // todo 回复可以添加附件，这里留着
    const fileList = req.body.fileList || []

    const userId = req.rSession.userId

    // todo 各种权限判断

    if (!teamId || !taskId || !content) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }



    try {
        const userObj = await userDB.baseInfoById(userId)
        const result = await discussDB.createDiscuss(teamId, "", "", content, userObj, fileList);
        taskDB.addDiscuss(taskId, result._id);

        const teamObj = await teamDB.findByTeamId(teamId)

        //await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'REPLY_TOPIC', result._id, topicObj.title, result)

        //如果有需要通知的人，则走微信模板消息下发流程
        if (informList && informList.length) {
            replyTopicTemplate(informList, result)
        }

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const editDiscuss = async (req, res, next) => {
    const taskId = req.body.taskId;
    const discussId = req.body.discussId
    const content = req.body.content
    const informList = req.body.informList || []

    // todo 回复可以添加附件，这里留着
    const fileList = req.body.fileList || []

    const userId = req.rSession.userId

    // todo 各种权限判断

    if (!discussId || !taskId || !content) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }


    try {

        const result = await discussDB.updateDiscuss(discussId, { content: content })

        //todo 还要在timeline表中增加项目

        //如果有需要通知的人，则走微信模板消息下发流程
        if (informList && informList.length) {
            replyTopicTemplate(informList, result)
        }

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const delDiscuss = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const discussId = req.body.discussId;
    //const topicId = req.body.topicId
    //const content = req.body.content
    //const informList = req.body.informList || []

    // todo 回复可以添加附件，这里留着
    //const fileList = req.body.fileList || []

    const userId = req.rSession.userId

    // todo 各种权限判断

    if (!teamId || !taskId || !discussId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }



    try {
        const result = await discussDB.delDiscussById(discussId);
        const result1 = await taskDB.delDiscuss(taskId, discussId);
        //await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'REPLY_TOPIC', result._id, topicObj.title, result)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result1
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
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

    ['POST', '/api/task/taskCopy', apiAuth, taskCopy],
    ['POST', '/api/task/taskMove', apiAuth, taskMove],

    //6.26
    ['POST', '/api/task/createDiscuss', apiAuth, createDiscuss],
    ['POST', '/api/task/editDiscuss', apiAuth, editDiscuss],
    ['POST', '/api/task/delDiscuss', apiAuth, delDiscuss],
]
