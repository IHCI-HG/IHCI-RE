import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import { timeBefore, sortByCreateTime, createMarkup } from '../../../utils/util'
import Page from '../../../components/page'
import MemberChosenList from '../../../components/member-chose-list'
import Editor from '../../../components/editor'
import EditTodoList from '../todo/todolist/editTodoList'
import TodoList from '../todo/todolist/todoList'
import fileUploader from '../../../utils/file-uploader';

class TeamChoseItem extends React.PureComponent{
    render() {
        return(
            <div className="admin-team-item">
                <div className="team-img"></div>
                <div className="team-name">{this.props.name}</div>
                {this.props.active && <span className="check">√</span>}
            </div>
        )
    }
}
class TopicItem extends React.PureComponent{
    render() {
        return(
            <div className="topic-item" key={"topic-item-" + this.props._id} onClick={() => {this.props.locationTo('/discuss/topic/' + this.props._id)}}>
                <img src={this.props.creator.headImg} alt="" className="head-img" />
                <div className="name">{this.props.creator.name}</div>
                <div className="main">
                    <div className="topic-title">{this.props.title}</div>
                    <p className="text-max-line-1" dangerouslySetInnerHTML={createMarkup(this.props.content)}></p>
                </div>
                {this.props.fileList.length>0 &&
                    <i className="icon iconfont time">&#xe6dd;</i>
                }
                <div className="time">{timeBefore(this.props.create_time)}</div>
            </div>
        )
    }
}


function getUpdateItem(arr, id) {
    let item = null
    let index = null
    arr.forEach((innerItem, innerIndex) => {
        if (innerItem.id === id) {
            item = innerItem
            index = innerIndex
        }
    })
    return [item, index]
}

export default class Team extends React.Component{
    state = {
        showCreateTopic: false,
        showCreateTodo: false,
        showCreateTodoList: false,
        showMenu: false,
        isCreator: false,

        topicName: '',
        topicContent: '',
        topicAttachments: [],

        teamInfo: {},
        topicList: [],
        memberList: [],
        todoListArr: [],
    }

    componentDidMount = async() => {
        this.teamId = this.props.params.id
        this.initTeamInfo()
        this.initTodoListArr()
    }

    initTodoListArr = async() => {
        // 请求todoListArr数据
        const resp = await api('/api/team/taskList', {
            method:'GET',
            body:{
                teamId: this.teamId
            }})
        console.log('resp', resp)
        let todoListArr = this.state.todoListArr
        let unclassifiedList = []
        let unclassified = {}
        let todoList = []
        if(resp.data.taskList==undefined){
            resp.data.taskList=[]
        }
        resp.data.taskList.map((item)=>{
            let todoItem = {}
            todoItem.id = item.id
            todoItem.name = item.title
            todoItem.hasDone = item.state
            todoItem.ddl = item.deadline
            todoItem.assignee = {
                id: item.header.headerId
            }
            unclassifiedList.push(todoItem)
        })
        unclassified.list = unclassifiedList
        if(resp.data.tasklistList==undefined){
            resp.data.tasklistList=[]
        }
        resp.data.tasklistList.map((item)=>{
            let todoListItem = {}
            todoListItem.id = item._id
            todoListItem.name = item.name
            todoListItem.list = []
            item.taskList.map((mapTodoItem)=>{
                let todoItem = {}
                todoItem.id = mapTodoItem.taskId
                todoItem.name = mapTodoItem.title
                todoItem.completeTime = mapTodoItem.completed_time
                todoItem.hasDone = mapTodoItem.state
                todoItem.ddl = mapTodoItem.deadline
                todoItem.assignee = {
                    id: mapTodoItem.header.headerId
                }
                todoListItem.list.push(todoItem)
            })
            todoList.push(todoListItem)
        })
        todoListArr = [unclassified,...todoList]
        if (resp.state.code === 0) {
            this.setState({ todoListArr })
        }
    }

    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })

        if(!result.data) {
            window.toast('团队内容加载出错')
        }

        const teamInfo = {}
        teamInfo._id = result.data._id
        teamInfo.name = result.data.name
        teamInfo.teamImg = result.data.teamImg
        teamInfo.desc = result.data.teamDes


        const memberList = []
        const memberIDList = []

        const curUserId = this.props.personInfo._id

        let isCreator = false
        result.data.memberList.map((item) => {  // 判断是否是创建者 ？
            if(item.userId == curUserId) {
                isCreator = true
            }
            memberIDList.push(item.userId)
        })
        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })
        console.log('result.data.topicList', result.data.topicList)
        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.memberList[idx],
                chosen: false,
            })
        })
        this.setState({
            isCreator: isCreator,
            teamInfo: teamInfo,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
    }

    locationTo = (url) => {
        this.props.router.push(url)
    }

    handleTopicContentChange = (content) => {
        this.setState({
            topicContent: content
        })
        console.log(this.state.topicContent)
    }

    createTopicHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })

        const result = await api('/api/topic/createTopic', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                name: this.state.topicName,
                content: this.state.topicContent,
                fileList: this.state.topicAttachments,
                informList: informList,
            }
        })
        console.log('createTopicHandle', result.data)

        if(result.state.code == 0) {
            const topicList = this.state.topicList
            const time = new Date().getTime()
            topicList.unshift({
                _id: result.data._id,
                creator: this.props.personInfo,
                title: this.state.topicName,
                content: this.state.topicContent,
                fileList: this.state.topicAttachments,
                time: time,
            })
            this.setState({
                topicList: topicList,
                showCreateTopic: false,
                topicName: '',
                topicContent: '',
            })
        } else {
            window.toast(result.state.msg)
        }
    }


    deleteFile = async (e, index) => {
        let topicAttachments = this.state.topicAttachments
        topicAttachments.splice(index,1);
        this.setState({
            topicAttachments,
        })
    }

    topicNameInputHandle = (e) => {
        this.setState({
            topicName: e.target.value
        })
    }

    topicContentInputHandle = (e) => {
        this.setState({
            topicContent: e.target.value
        })
    }

    topicFileUploadHandle = async (e) => {
        const resp = await fileUploader('teamId', '', e.target.files[0])
        let topicAttachments = this.state.topicAttachments
        topicAttachments = [...topicAttachments, resp]
        this.setState({
            topicAttachments,
        })
    }

    memberChoseHandle = (tarId) => {
        const memberList = this.state.memberList
        memberList.map((item) => {
            if(item._id == tarId) {
                item.chosen = !item.chosen
            }
        })
        this.setState({memberList})
    }

    toAdminHandle = () => {
        location.href = '/team-admin/' + this.teamId
    }

    // todo
    handlecloseEditTodo =() => {
        this.setState({ showCreateTodo: false })
    }

    handleTodoCreate = async(lIndex, id, todoInfo) => {
        const result = await api('/api/task/create', {
            method: 'POST',
            body:{
                teamId: this.teamId,
                listId: id,
                name: todoInfo.name,
                ddl: todoInfo.date,
                assigneeId: todoInfo.assigneeId,
            }
        })
        // 返回用户名的显示依赖assigneeId
        if (result.state.code === 0) {
            let todo = {
                listId: result.data.listId,
                id: result.data.id,
                name: result.data.title,
                desc: result.data.content,
                assignee: {
                    id: result.data.header,
                },
                ddl: result.data.deadline,
                checkItemDoneNum: 0,
                // checkItemNum: 0,
                hasDone: false,
            }
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            if (!todolist.list) {
                todolist.list = []
            }
            todolist.list = [...todolist.list, todo]
            this.setState({ todoListArr })
        }
        return result
    }

    handleTodoModify = async(lIndex, lId, id, todoInfo) => {
        let editTask = {}
        console.log(todoInfo)
        editTask.name = todoInfo.name
        editTask.ddl = todoInfo.date
        editTask.assigneeId = todoInfo.assigneeId
        const resp = await api('/api/task/edit',{
            method:'POST',
            body:{
                listId: lId,
                taskId: todoInfo.id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        if (resp.state.code ===0) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.name = resp.data.title
            todoItem.ddl = resp.data.deadline
            todoItem.assignee.id = resp.data.header
            todolist.list[itemIndex] = todoItem
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
        }
        return resp
    }

    handleTodoCheck = async(lIndex, lId, id, hasDone) => {
        let editTask = {}
        editTask.hasDone = !hasDone
        const resp = await api('/api/task/edit',{
            method:'POST',
            body:{
                listId: lId,
                taskId: id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        console.log('handleTodoCheck', resp)
        if (resp.state.code === 0) {
            // 更新 todolist
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.hasDone = resp.data.state
            todoItem.completeTime = resp.data.completed_time
            // ...更新完成时间赋值
            todolist.list[itemIndex] = todoItem
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
        }
    }

    handleAssigneeChange = async(lIndex, lId, id, e) => {
        let editTask = {}
        editTask.assigneeId = e.target.value
        const resp = await api('/api/task/edit',{
            method:'POST',
            body:{
                listId: lId,
                taskId: id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        console.log(resp)
        if (resp.state.code === 0) {
            let todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            // fix bug: 这里进行过短路优化
            todoItem.assignee = {}
            todoItem.assignee.id = resp.data.header
            todolist.list[itemIndex] = todoItem
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }

    handleDateChange = async(lIndex, lId, id, e) => {
        let editTask = {}
        editTask.ddl = e.target.value
        const resp = await api('/api/task/edit',{
            method:'POST',
            body:{
                listId: lId,
                taskId: id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        console.log(resp)
        if (resp.state.code === 0) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.ddl = resp.data.deadline
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }

    handleTodoDelete = async(lIndex, lId, id) => {
        console.log(lIndex, lId, id)
        const resp = await api('/api/task/delTask',{
            method:"POST",
            body:{
                taskId: id,
                teamId: this.teamId,
                listId: lId,
            }
        })
        console.log(resp)
        if (resp.state.code ===0) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todolist.list.splice(itemIndex,1)
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }

    // todoList
    handleTodoListCreate = async(info) => {
        const listExist = false
        this.state.todoListArr.map((item)=>{
            if(item.name===info.name){
                alert("清单已存在")
                listExist = true
            }
        })
        if(!listExist){
            const result = await api('/api/task/createTaskList', {
                method: 'POST',
                body: {
                    teamId: this.teamId,
                    name: info.name,
                }
            })
            if (result.state.code === 0) {
                let createTodo = {
                    id:result.data.id,
                    name:result.data.name,
                    list:[],
                }
                let todoListArr = this.state.todoListArr
                todoListArr = [...todoListArr, createTodo]
                this.setState({
                    showCreateTodoList: false,
                    todoListArr
                })
            }
        }
    }

    handleTodoListModify = async(index, id, info) => {
        const todoListArr = this.state.todoListArr
        const resp = await api('/api/task/updateTasklist', {
            method:"POST",
            body:{
                listId: id,
                name: info.name,
                teamId: this.teamId,
            }
        })
        if (resp.state.code === 0) {
            todoListArr[index].name = resp.data.name
            this.setState({ todoListArr: todoListArr.slice() })
        }
        return resp
    }

    handleTodoListDelete = async(index, id) => {
        const todoListArr = this.state.todoListArr
        const resp = await api('/api/task/delTasklist',{
            method:"POST",
            body: {
                listId: id
            }
        })
        const [todolist, todolistIndex] = getUpdateItem(todoListArr, id)
        todoListArr.splice(todolistIndex, 1)
        if (resp.state.code === 0) {
            this.setState({ todoListArr: todoListArr.slice() })
        }
        console.log(todoListArr)
        return resp
    }

    render() {
        let teamInfo = this.state.teamInfo
        const unclassified = this.state.todoListArr[0]

        return (
            <Page title={"团队名称xx - IHCI"}
                className="discuss-page">

                <div className="discuss-con page-wrap">
                    <div className="team-info">
                        <div className="left">
                            <div className="head">{teamInfo.name}</div>
                            <pre><div className="team-des">{teamInfo.desc}</div>  </pre>
                        </div>
                        <div className="right">
                            <div className="admin">
                                <div className="admin-con member-num">{this.state.memberList.length}</div>
                                <span>成员</span>
                            </div>
                            {
                                this.state.isCreator && <div className="admin">
                                    <div className="admin-con iconfont icon-setup_fill"  onClick={this.toAdminHandle}></div>
                                <span>设置</span>
                            </div>
                            }

                        </div>
                    </div>


                    <div className="div-line"></div>

                    <div className="head">
                        <span className='head-title'>讨论</span>
                        <div className="create-btn" onClick={() => {this.setState({showCreateTopic: true})}}>发起讨论</div>
                    </div>

                    {
                        this.state.showCreateTopic && <div className="create-area">
                            <input type="text"
                                   className="topic-name"
                                   onChange={this.topicNameInputHandle}
                                   value={this.state.topicName} placeholder="话题" />
                            <Editor handleContentChange={this.handleTopicContentChange.bind(this)}
                                    handleFileUpload={this.topicFileUploadHandle.bind(this)}
                                    deleteFile={this.deleteFile.bind(this)}
                                    attachments={this.state.topicAttachments}></Editor>

                            <div className="infrom">请选择要通知的人：</div>
                            <MemberChosenList choseHandle={this.memberChoseHandle}
                                              memberList={this.state.memberList}/>

                            <div className="btn-con">
                                <div className="create-btn"
                                     onClick={this.createTopicHandle}>发起讨论</div>
                                <div className="cancle"
                                     onClick={() => {this.setState({showCreateTopic: false})}}>取消</div>
                            </div>
                        </div>
                    }
                    <div className="topic-list">
                        {
                            this.state.topicList.map((item) => {
                                return (
                                    <TopicItem locationTo={this.locationTo}
                                               key={item._id}
                                               {...item}/>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="todo-board">
                    <div className="head">
                        <span className='head-title'>任务</span>
                        <div className="create-btn">
                                <span onClick={(e) => {
                                    this.setState({showCreateTodo: true})
                                    e.stopPropagation()
                                }}>添加任务</span>
                            <i className="icon iconfont"
                               onClick={(e) => {
                                   this.setState({showMenu: !this.state.showMenu})
                                   e.stopPropagation()
                               }}
                            >&#xe783;</i>
                            {   this.state.showMenu &&
                            <ul className="menu">
                                <li onClick={(e) => {
                                    this.setState({showCreateTodo: true, showMenu: false})
                                    e.stopPropagation()
                                }}>添加任务
                                </li>
                                <li onClick={(e) => {
                                    console.log('添加任务')
                                    this.setState({showCreateTodoList: true, showMenu: false})
                                    e.stopPropagation()
                                }}>添加清单
                                </li>
                            </ul>
                            }
                        </div>
                    </div>


                    {   unclassified &&
                    <TodoList
                        listType="unclassified"
                        showCreateTodo = {this.state.showCreateTodo}
                        handlecloseEditTodo={this.handlecloseEditTodo.bind(this)}
                        {...unclassified}
                        memberList={this.state.memberList}
                        handleTodoCreate={this.handleTodoCreate.bind(this, 0, null)}
                        handleTodoCheck={this.handleTodoCheck.bind(this, 0, null)}
                        handleTodoModify={this.handleTodoModify.bind(this, 0, null)}
                        handleAssigneeChange={this.handleAssigneeChange.bind(this, 0, null)}
                        handleDateChange={this.handleDateChange.bind(this, 0, null)}
                        handleTodoDelete={this.handleTodoDelete.bind(this, 0, null)}
                        handleTodoListDelete={this.handleTodoListDelete.bind(this, null, unclassified.id )}
                        handleTodoListModify={this.handleTodoListModify.bind(this, null, unclassified.id)}
                    ></TodoList>
                    }

                    {
                        this.state.showCreateTodoList &&
                        <EditTodoList
                            confirmLabel="保存，开始添加任务"
                            handleConfirm={this.handleTodoListCreate.bind(this)}
                            handleClose={(() => {this.setState({showCreateTodoList: false})}).bind(this)}>
                        </EditTodoList>
                    }

                    {   this.state.todoListArr.map((todoList, index) => {
                        if (index === 0) {
                            return
                        }
                        return (
                            <TodoList
                                key={todoList.id}
                                {...todoList}
                                memberList={this.state.memberList}
                                handleTodoCreate={this.handleTodoCreate.bind(this, index, todoList.id)}
                                handleTodoCheck={this.handleTodoCheck.bind(this, index, todoList.id)}
                                handleTodoModify={this.handleTodoModify.bind(this, index, todoList.id)}
                                handleAssigneeChange={this.handleAssigneeChange.bind(this, index, todoList.id)}
                                handleDateChange={this.handleDateChange.bind(this, index, todoList.id)}
                                handleTodoDelete={this.handleTodoDelete.bind(this, index, todoList.id)}
                                handleTodoListDelete={this.handleTodoListDelete.bind(this, index, todoList.id )}
                                handleTodoListModify={this.handleTodoListModify.bind(this, index, todoList.id)}
                            ></TodoList>
                        )
                    })
                    }
                </div>
            </Page>
        )
    }
}


