var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'

import {
    createTopicTemplate,
    replyTopicTemplate,
    createTaskTemplate,
    delTaskTemplate,
    delHeaderTemplate,
    compTaskTemplate,
    createCheckitemTemplate,
    delCheckitemTemplate,
    delCheckHeaderTemplate,
    compCheckitemTemplate
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
        const userObj = await userDB.findByUserId(userId);
        const tasklist = await tasklistDB.createTasklist(userObj, listname, listDesc, teamId);

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
        listid: listId,
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
    const taskDeadline = new Date(req.body.ddl) || "";
    const taskHeader = req.body.assigneeId || "";
    console.log(taskDeadline)

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

        //6.28
        if (teamId) {
            const teamObj = await teamDB.findByTeamId(teamId)
            const baseInfoObj = await userDB.baseInfoById(userId)
            await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'CREATE_TASK', result._id, result.title, result)
        }

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

        const headerList = []
        headerList.push(taskHeader)

        //todo 有负责人，走微信模板下发流程
        if (taskHeader) {
            const user = await userDB.findByUserId(taskHeader)
            const headername = user.username
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
        console.log(result);
        if (result.ok == 1) {
            if (tasklistId) {
                await tasklistDB.delTask(tasklistId, taskId);
            } else {
                await teamDB.delTask(teamId, taskId);
            }

            const headerList = []
            headerList.push(taskObj.header)
            console.log(taskObj.header)
            if (taskObj.header) {
                delTaskTemplate(headerList, taskObj)
            }
            //6.28
            const baseInfoObj = await userDB.baseInfoById(userId);
            const teamObj = await teamDB.findByTeamId(teamId);
            await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'DELETE_TASK', taskObj._id, taskObj.title, taskObj);


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
        const taskObj = await taskDB.findByTaskId(taskId)

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
        if (editTask.assigneeId === undefined) {
            task.header = taskObj.header
        } else {
            task.header = editTask.assigneeId
        }
        console.log(task.header)
        var headername = ""
        if (task.header) {
            const headerObj = await userDB.findByUserId(task.header);
            headername = headerObj.username
        }
        task.headername = headername
        console.log(task)
        if (editTask.hasDone == true) {
            task.state = true;
            task.completed_time = new Date()

            //6.28
            const baseInfoObj = await userDB.baseInfoById(userId);
            const teamObj = await teamDB.findByTeamId(teamId);
            await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'FINISH_TASK', taskObj._id, taskObj.title, taskObj);


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
        if (editTask.assigneeId != taskObj.header) {
            if (editTask.assigneeId) {
                const headerObj = await userDB.findByUserId(editTask.assigneeId);
                const headername = headerObj.username;
                const headerList = []
                headerList.push(editTask.assigneeId)
                createTaskTemplate(headerList, taskObj, headername)
            }
            if ((editTask.assigneeId === null && taskObj.header) || (editTask.assigneeId && taskObj.header)) {
                const headerObj = await userDB.findByUserId(taskObj.header);
                const headername = headerObj.username;
                const headerList = []
                headerList.push(taskObj.header)
                delHeaderTemplate(headerList, taskObj, headername)
            }
        }


        if (editTask.hasDone == true) {
            if (task.header) {
                const headerObj = await userDB.findByUserId(task.header);
                const headername = headerObj.username;
                console.log(headername)
                const creatorId = []
                creatorId.push(taskObj.creator._id)
                compTaskTemplate(creatorId, taskObj, headername)
            }
        }

        //todo 还要在timeline中添加项目
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_TASK', result1._id, result1.title, result1)


        if (task.completed_time) {
            const date = new Date(task.completed_time)
            task.completed_time = (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2')
        }
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
            var headername = ""
            if (checklitemHeaderId) {
                const userObj = await userDB.findByUserId(checklitemHeaderId);
                headername = userObj.username
            }
            var completed_time = ""
            if (taskObj.checkitemList[i].completed_time) {
                const date = new Date(taskObj.checkitemList[i].completed_time)
                completed_time = (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2')
            }
            const checkitemObj = {
                _id: taskObj.checkitemList[i]._id,
                state: taskObj.checkitemList[i].state,
                content: taskObj.checkitemList[i].content,
                headerId: taskObj.checkitemList[i].header,
                headername: headername,
                deadline: taskObj.checkitemList[i].deadline,
                completed_time: completed_time
            }
            checkitemList.push(checkitemObj);
        }

        var taskCompleted_time = ""
        if (taskObj.completed_time) {
            const date = new Date(taskObj.completed_time)
            taskCompleted_time = (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).replace(/([\-\: ])(\d{1})(?!\d)/g, '$10$2')
        }

        var headername = ""
        if (taskObj.header) {
            const headerObj = await userDB.findByUserId(taskObj.header)
            headername = headerObj.username
        }
        const result = {
            _id: taskObj._id,
            title: taskObj.title,
            content: taskObj.content,
            deadline: taskObj.deadline,
            header: taskObj.header,
            headername: headername,
            state: taskObj.state,
            completed_time: taskCompleted_time,
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
    const teamId = req.body.teamId
    const taskId = req.body.todoId;
    const content = req.body.name;
    const header = req.body.assigneeId || "";
    const deadline = req.body.ddl || "";
    console.log('assigneeId', header)

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


        const result1 = await taskDB.appendCheckitem(taskId, checkitem);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'APPEND_CHECKITEM', taskId, checkitem.content, checkitem)
        //6.28 //我不知道怎么找到checkItem的ID，不过好像也没什么用
        const teamObj = await teamDB.findByTeamId(taskObj.teamId);
        const baseInfoObj = await userDB.baseInfoById(userId);
        await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'CREATE_CHECK_ITEM', result1._id, checkitem.content, checkitem)

        const lastCheckitem = result1.checkitemList[result1.checkitemList.length - 1]
        const checkitemObj = {
            id: lastCheckitem._id,
            content: lastCheckitem.content,
            header: lastCheckitem.header,
            deadline: lastCheckitem.deadline,
            taskId: taskId,
        }

        if (checkitem.header) {
            //todo 给负责人下发微信模板
            const headerObj = await userDB.findByUserId(checkitem.header)
            console.log(headerObj)
            const headername = headerObj.username
            const headerList = []
            headerList.push(checkitem.header)
            console.log(lastCheckitem)
            console.log(headername)
            createCheckitemTemplate(headerList, lastCheckitem, headername)
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

         //6.28
         const teamId = taskObj.teamId;

         //6.28
         const userObj = await userDB.baseInfoById(userId);
 

        var checkitemObj = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObj = taskObj.checkitemList[i];
                break;
            }
        }
        const result1 = await taskDB.dropCheckitem(taskId, checkitemId);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'DROP_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)


         //6.28
         const teamObj = await teamDB.findByTeamId(teamId)
         await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'DELETE_CHECK_ITEM', checkitemId, checkitemObj.content, checkitemObj)
 

        if (checkitemObj.header) {
            const headerList = []
            headerList.push(checkitemObj.header)
            delCheckitemTemplate(headerList, checkitemObj)
        }

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

        var checkitemObjTemp = null;
        for (var i = 0; i < taskObj.checkitemList.length; i++) {
            if (checkitemId == taskObj.checkitemList[i]._id) {
                checkitemObjTemp = taskObj.checkitemList[i];
                break;
            }
        }

        const checkitemObj = {}
        checkitemObj.content = editCheckitem.name || checkitemObjTemp.content || ""
        if (editCheckitem.assigneeId === undefined) {
            checkitemObj.header = checkitemObjTemp.header
        } else {
            checkitemObj.header = editCheckitem.assigneeId
        }
        checkitemObj.deadline = editCheckitem.ddl || checkitemObjTemp.deadline || ""
        if (checkitemObj.header) {
            const headerObj = await userDB.findByUserId(checkitemObj.header)
            checkitemObj.headername = headerObj.username
        }
        if (editCheckitem.hasDone == true) {
            checkitemObj.state = true;
            checkitemObj.completed_time = new Date();

             //6.28
             const teamId = taskObj.teamId;
             const teamObj = teamDB.findByTeamId(teamId);
             const baseInfoObj = await userDB.baseInfoById(userId);
             await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'FINISH_CHECITEM_ITEM', checkitemObj._id, checkitemObj.title, checkitemObj);
 
        } else {
            checkitemObj.state = false;
            checkitemObj.completed_time = "";
        }

        const result1 = taskDB.updateCheckitem(taskId, checkitemId, checkitemObj);
        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'EDIT_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)

        if (editCheckitem.hasDone == true && checkitemObj.header) {
            const creatorId = []
            creatorId.push(checkitemObjTemp.creator._id)
            const headerObj = await userDB.findByUserId(checkitemObj.header)
            const headername = headerObj.username
            compCheckitemTemplate(creatorId, checkitemObjTemp, headername)
        }
        if (editCheckitem.assigneeId != checkitemObjTemp.header) {
            if (editCheckitem.assigneeId) {
                const headerList = []
                headerList.push(editCheckitem.assigneeId)
                const headerObj = await userDB.findByUserId(editCheckitem.assigneeId)
                const headername = headerObj.username
                createCheckitemTemplate(headerList, checkitemObjTemp, headername)
            }
            if ((editCheckitem.assigneeId === null && checkitemObjTemp.header) || (editCheckitem.assigneeId && checkitemObjTemp.header)) {
                const headerList = []
                headerList.push(checkitemObjTemp.header)
                const headerObj = await userDB.findByUserId(checkitemObjTemp.header)
                const headername = headerObj.username
                delCheckHeaderTemplate(headerList, checkitemObjTemp, headername)
            }
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


//文威 6.22修改
const taskCopy = async (req, res, next) => {
    const taskId = req.body.taskId;
    const teamId = req.body.teamId;
    const copyCount = req.body.copyCount;
    const userId = req.rSession.userId;

    if (!taskId || copyCount <= 0) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        var returnObj = [];
        var copyObj = (await taskDB.findByTaskId(taskId)).toObject();
        var tasklistId = copyObj.tasklistId;
        delete copyObj._id;

        console.log("......................................................")
        console.log(copyObj);
        console.log(".......................................................")

        for (var i = 0; i < copyCount; i++) {
            const taskObj = await taskDB.create(copyObj);


            const baseInfoObj = await userDB.baseInfoById(userId);
            const teamObj = await teamDB.findByTeamId(teamId);
            await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'COPY_TASK', taskObj._id, taskObj.title, taskObj);

            if (tasklistId) {
                //如果是有清单的则在清单中添加
                await tasklistDB.addTask(tasklistId, taskObj)
            } else {
                await teamDB.addTask(teamId, taskObj)
            }

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
    const teamIdMoveTo = req.body.teamIdMoveTo;
    const tasklistId = req.body.tasklistId;
    const userId = req.rSession.userId;

    if (!taskId || !teamIdMoveTo) {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {

        var result = (await taskDB.findByTaskId(taskId)).toObject();
        const teamId = result.teamId;

        //6.28
        if (result.tasklistId) {
            await tasklistDB.delTask(result.tasklistId,taskId)
        } else {
            await teamDB.delTaskById(result.teamId,taskId);
        }

        result.create_time = Date.now;
        result.teamId = teamIdMoveTo;
        result.tasklistId = tasklistId ||[];
        result.deadline = undefined;
        result.completed_time = undefined;
        result.header = undefined;
        result.state = false;

        for (var x in result.checkitemList) {
            x.create_time = Date.now;
            x.header = undefined;
            x.deadline = undefined;
            x.completed_time = undefined;
        }
        result = await taskDB.updateTask(taskId, result);

        //6.28
        if (tasklistId) {
            //如果是有清单的则在清单中添加
            await tasklistDB.addTask(tasklistId, result)
        } else {
            await teamDB.addTask(teamIdMoveTo, result)
        }

        const baseInfoObj = await userDB.baseInfoById(userId);
        const teamObj = await teamDB.findByTeamId(teamId);
        await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'MOVE_TASK', result._id, result.title, result);



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
        const userObj = await userDB.baseInfoById(userId);
        
        //6.28
        const taskObj = taskDB.findByTaskId(taskId);

        //6.28
        const result = await discussDB.createDiscuss(teamId, "", taskObj.title, content, userObj, fileList);

        taskDB.addDiscuss(taskId, result._id);

        const teamObj = await teamDB.findByTeamId(teamId)

        //6.28
        await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'REPLY_TASK', result._id, result.title, result);

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

        //6.28
        const discussObj = discussDB.findDiscussById(discussId);
        const baseInfoObj = userDB.baseInfoById(userId);
        const teamObj = teamDB.findByTeamId(teamId);

        const result = await discussDB.delDiscussById(discussId);
        await taskDB.delDiscuss(taskId, discussId);
        
        //6.28
        await timelineDB.createTimeline(teamId, teamObj.name, baseInfoObj, 'DELETE_TASK_REPLY', discussObj._id, discussObj.title, discussObj);

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


//6.27
const findDiscuss = async (req, res, next) => {
    const taskId = req.body.taskId;

    const userId = req.rSession.userId;

    if (!taskId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const taskObj = await taskDB.findByTaskId(taskId);
        const userObj = await userDB.findByUserId(userId);

        var discussList = [];
        var discussObj;


        var tmpDiscussList = taskObj.discussList
        var discussNum = tmpDiscussList.length;
        for (var i = 0; i < discussNum; i++) {

            discussObj = await discussDB.findDiscussById(tmpDiscussList[i]._id);
            discussList.push(discussObj);
        }


        // await timelineDB.createTimeline(teamId, teamObj.name, userObj, 'OPEN_CHECKITEM', checkitemId, checkitemObj.content, checkitemObj)


        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: discussList
        })
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
    ['POST', '/api/task/delTasklist', apiAuth, delTasklist],
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

    //6.27
    ['POST', '/api/task/findDiscuss', apiAuth, findDiscuss],
]
