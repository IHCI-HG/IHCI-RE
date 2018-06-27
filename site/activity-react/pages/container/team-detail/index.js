import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'
import MemberChosenList from '../../../components/member-chose-list'
import EditTodoList from '../todo/todolist/editTodoList'
import TodoList from '../todo/todolist/todoList'
import mock from '../../../mock/index';

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
                    <div className="topic-content">{this.props.content}</div>
                </div>
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
        createTopicName: '',
        createTopicContent: '',

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
                id: item.headerId
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
                    id: mapTodoItem.headerId
                }
                todoListItem.list.push(todoItem)
            })
            todoList.push(todoListItem)
        })
        todoListArr = [unclassified,...todoList]
        console.log(todoListArr)
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
                name: this.state.createTopicName,
                content: this.state.createTopicContent,
                informList: informList,
            }
        })

        if(result.state.code == 0) {
            const topicList = this.state.topicList
            const time = new Date().getTime()
            topicList.unshift({
                _id: result.data._id,
                creator: this.props.personInfo,
                title: this.state.createTopicName,
                content: this.state.createTopicContent,
                time: time,
            })
            this.setState({
                topicList: topicList,
                showCreateTopic: false,
                createTopicName: '',
                createTopicContent: '',
            })
        } else {
            window.toast(result.state.msg)
        }
    }

    topicNameInputHandle = (e) => {
        this.setState({
            createTopicName: e.target.value
        })
    }

    topicContentInputHandle = (e) => {
        this.setState({
            createTopicContent: e.target.value
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
        console.log(result)
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
            console.log("1",todoListArr)
            this.setState({ todoListArr })
        }
        return result
    }
// 没改完！！！！！！！！！！！！！！！！！！！！！！！
    handleTodoModify = async(lIndex, lId, id, todoInfo) => {
        let editTask = {}
        editTask.name = todoInfo.name
        editTask.ddl = todoInfo.date
        editTask.assigneeId = todoInfo.assigneeId
        console.log(todoInfo)
        const resp = await api('/api/task/edit',{
            method:'POST',
            body:{
                listId: lId,
                taskId: todoInfo.id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        console.log(resp)
        if (resp.state.code ===0) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.name = resp.data.todo.name
            todoItem.ddl = resp.data.todo.ddl
            todoItem.assignee = resp.data.todo.assignee
            todolist.list[itemIndex] = todoItem
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
        }
        return resp
    }

    handleTodoCheck = async(lIndex, lId, id, hasDone) => {
        const resp = await mock.httpMock('/todo/:id/put', { id: id, hasDone: !hasDone })
        if (resp.status ===200) {
            // 更新 todolist
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.hasDone = resp.data.todo.hasDone
            // ...更新完成时间赋值
            todolist.list[itemIndex] = todoItem
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
        }
    }

    handleAssigneeChange = async(lIndex, lId, id, e) => {
        console.log(lIndex, lId, id, e.target.value)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: id,
            assigneeId: e.target.value,
        })
        if (resp.status ===200) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.assignee = resp.data.todo.assignee
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }

    handleDateChange = async(lIndex, lId, id, e) => {
        console.log(lIndex, lId, id, e.target.value)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: id,
            ddl: e.target.value,
        })
        if (resp.status ===200) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.ddl = resp.data.todo.ddl
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }

    handleTodoDelete = async(lIndex, lId, id) => {
        console.log(lIndex, lId, id)
        const resp = await mock.httpMock('/common/delete')
        if (resp.status ===200) {
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
        const result = await api('/api/task/createTaskList', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                name: info.name,
            }
        })
        console.log(info)
        console.log(result)
        if (result.state.code === 0) {
            let createTodo = {
                id:result.data.id,
                name:result.data.name,
                list:[],
            }
            const todoListArr = this.state.todoListArr
            todoListArr = [...todoListArr, createTodo]
            this.setState({
                showCreateTodoList: false,
                todoListArr
            })
        }
    }

    handleTodoListModify = async(index, id, info) => {
        const todoListArr = this.state.todoListArr
        const resp = await mock.httpMock('/todolist/put', {
            id,
            name: info.name
        })
        if (resp.status === 200) {
            todoListArr[index].name = resp.data.todoList.name
            this.setState({ todoListArr: todoListArr.slice() })
        }
        return resp
    }

    handleTodoListDelete = async(index, id) => {
        const todoListArr = this.state.todoListArr
        const resp = await mock.httpMock('/common/delete', {id})
        // todoListArr.splice(index, 1) // 删除使用index导致错误
        const [todolist, todolistIndex] = getUpdateItem(todoListArr, id)
        todoListArr.splice(todolistIndex, 1)
        if (resp.status ===200) {
            this.setState({ todoListArr: todoListArr.slice() })
        }
        console.log(todoListArr)
        return resp
    }

    render() {
        let teamInfo = this.state.teamInfo
        const unclassified = this.state.todoListArr[0]

        console.log("unclassified",unclassified)
        // console.log(this.state.memberList)
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
                            <input type="text" className="topic-name" onChange={this.topicNameInputHandle} value={this.state.createTopicName} placeholder="话题" />
                            <textarea className="topic-content" onChange={this.topicContentInputHandle} value={this.state.createTopicContent} placeholder="说点什么"></textarea>

                            <div className="infrom">请选择要通知的人：</div>
                            <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/>

                            <div className="btn-con">
                                <div className="create-btn" onClick={this.createTopicHandle}>发起讨论</div>
                                <div className="cancle" onClick={() => {this.setState({showCreateTopic: false})}}>取消</div>
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


