import React from 'react'
import api from '../../../utils/api';
import TodoList from '../todo/todolist/todoList'
import EditTodoList from '../todo/todolist/editTodoList'

class TeamChoseItem extends React.PureComponent {
    render() {
        return (
            <div className="admin-team-item">
                <div className="team-img"></div>
                <div className="team-name">{this.props.name}</div>
                {this.props.active && <span className="check">√</span>}
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

class Task extends React.Component{
    state={
        showCreateTodo: false,
        showCreateTodoList: false,
        showMenu: false,
        todoListArr: [],
        memberList: [],
        doneList: [],
    } 
    componentDidMount = async () => {
        this.teamId = this.props.teamId
        this.initTodoListArr()
        this.initTeamInfo()
    }
    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })
        if (!result.data) {
            window.toast('团队内容加载出错')
        }

        const memberList = []
        const memberIDList = []

        const curUserId = this.props.curUserId

        let isCreator = ''

        result.data.memberList.map((item) => {  // 判断是否是创建者 ？
            if (item.userId == curUserId) {
                isCreator = item.role
            }
            memberIDList.push(item.userId)
        })
        console.log(isCreator)
        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })
        // console.log('result.data.topicList', result.data.topicList)
        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.memberList[idx],
                chosen: false,
            })
        })
        this.setState({
            memberList: memberList
        })
    }
    initTodoListArr = async () => {
        // 请求todoListArr数据
        const resp = await api('/api/team/taskList', {
            method: 'GET',
            body: {
                teamId: this.teamId
            }
        })
        // console.log('resp', resp)
        let todoListArr = this.state.todoListArr
        let unclassifiedList = []
        let unclassified = {}
        let todoList = []
        if (resp.data.taskList == undefined) {
            resp.data.taskList = []
        }
        resp.data.taskList.map((item) => {
            if(item.state === false){
                let todoItem = {}
                todoItem.id = item.id
                todoItem.name = item.title
                todoItem.hasDone = item.state
                todoItem.ddl = item.deadline
                todoItem.completeTime = item.completed_time
                todoItem.assignee = {
                    id: item.header.headerId
                }
                unclassifiedList.push(todoItem)
            }
        })
        unclassified.list = unclassifiedList
        if (resp.data.tasklistList == undefined) {
            resp.data.tasklistList = []
        }
        resp.data.tasklistList.map((item) => {
            let todoListItem = {}
            todoListItem.id = item._id
            todoListItem.name = item.name
            todoListItem.list = []
            item.taskList.map((mapTodoItem) => {
                if(mapTodoItem.state === false){
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
                }
            })
            todoList.push(todoListItem)
        })
        todoListArr = [unclassified, ...todoList]
        if (resp.state.code === 0) {
            this.setState({ todoListArr })
        }
    }

    handlecloseEditTodo = () => {
        this.setState({ showCreateTodo: false })
    }
      // todoList
      handleTodoListCreate = async (info) => {
        if(!info.name.trim()){
            alert("清单名不能为空")
        }
        else{
            var listExist = false
            this.state.todoListArr.map((item) => {
                if (item.name === info.name) {
                    alert("清单已存在")
                    listExist = true
                }
            })
            if (!listExist) {
                const result = await api('/api/task/createTaskList', {
                    method: 'POST',
                    body: {
                        teamId: this.teamId,
                        name: info.name,
                    }
                })
                if (result.state.code === 0) {
                    let createTodo = {
                        id: result.data.id,
                        name: result.data.name,
                        list: [],
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
    }
    handleTodoCreate = async (lIndex, id, todoInfo) => {
        if(!todoInfo.name.trim()){
            alert("任务名不能为空")
        }
        else{
            const result = await api('/api/task/create', {
                method: 'POST',
                body: {
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
        
    }
    handleTodoCheck = async (lIndex, lId, id, hasDone) => {
        // this.state.todoListArr.map((item,index)=>{
        //     if(id===item.id){
                    
        //     }
        // })
        let editTask = {}
        editTask.hasDone = !hasDone
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                listId: lId,
                taskId: id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
        console.log(resp)
        if (resp.state.code === 0) {
            // 更新 todolist
            const todoListArr = this.state.todoListArr
            const doneList = this.state.doneList
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.hasDone = resp.data.state
            todoItem.listId = resp.data.listId
            todoItem.completeTime = resp.data.completed_time
            // ...更新完成时间赋值
            todolist.list[itemIndex] = todoItem
            if(!doneList.find((item)=>{return todoItem.id === item.id})){
                doneList.push(todoItem)
            }
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr,doneList })
        }
    }
    handleTodoModify = async (lIndex, lId, id, todoInfo) => {
        let editTask = {}
        if(!todoInfo.name.trim()){
            alert("任务名不能为空")
        }
        else{
            editTask.name = todoInfo.name
            editTask.ddl = todoInfo.date
            editTask.assigneeId = todoInfo.assigneeId
            const resp = await api('/api/task/edit', {
                method: 'POST',
                body: {
                    listId: lId,
                    taskId: todoInfo.id,
                    teamId: this.teamId,
                    editTask: editTask,
                }
            })
            if (resp.state.code === 0) {
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
    }
    handleAssigneeChange = async (lIndex, lId, id, e) => {
        let editTask = {}
        editTask.assigneeId = e.target.value
        if(editTask.assigneeId === "null"){
            editTask.assigneeId = undefined
        }
        console.log(editTask.assigneeId)
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
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
    handleDateChange = async (lIndex, lId, id, e) => {
        let editTask = {}
        editTask.ddl = e.target.value
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                listId: lId,
                taskId: id,
                teamId: this.teamId,
                editTask: editTask,
            }
        })
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
    handleTodoDelete = async (lIndex, lId, id) => {
        const resp = await api('/api/task/delTask', {
            method: "POST",
            body: {
                taskId: id,
                teamId: this.teamId,
                listId: lId,
            }
        })
        if (resp.state.code === 0) {
            const todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todolist.list.splice(itemIndex, 1)
            todolist.list = todolist.list.slice()
            this.setState({ todoListArr })
            return resp
        }
    }
    handleTodoListDelete = async (index, id) => {
        const todoListArr = this.state.todoListArr
        const resp = await api('/api/task/delTasklist', {
            method: "POST",
            body: {
                listId: id
            }
        })
        const [todolist, todolistIndex] = getUpdateItem(todoListArr, id)
        todoListArr.splice(todolistIndex, 1)
        if (resp.state.code === 0) {
            this.setState({ todoListArr: todoListArr.slice() })
        }
        return resp
    }
    handleTodoListModify = async (index, id, info) => {
        if(!info.name.trim()){
            alert("清单名不能为空")
        }
        else{
            const todoListArr = this.state.todoListArr
            const resp = await api('/api/task/updateTasklist', {
                method: "POST",
                body: {
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
    }


    render(){
        const unclassified = this.state.todoListArr[0]
        return(
        <div>
        <div className="head">
            <span className='head-title'>任务</span>
            <div className="create-btn">
                <span onClick={(e) => {
                    this.setState({ showCreateTodo: true })
                    e.stopPropagation()
                }}>添加任务</span>
                <i className="icon iconfont"
                    onClick={(e) => {
                        this.setState({ showMenu: !this.state.showMenu })
                        e.stopPropagation()
                    }}
                >&#xe783;</i>
                {this.state.showMenu &&
                    <ul className="menu">
                        <li onClick={(e) => {
                            this.setState({ showCreateTodo: true, showMenu: false })
                            e.stopPropagation()
                        }}>添加任务
                </li>
                        <li onClick={(e) => {
                            this.setState({ showCreateTodoList: true, showMenu: false })
                            e.stopPropagation()
                        }}>添加清单
                </li>
                    </ul>
                }
            </div>
        </div>
        


        {unclassified &&
            <TodoList
                listType="unclassified"
                showCreateTodo={this.state.showCreateTodo}
                createInput="任务名"
                handlecloseEditTodo={this.handlecloseEditTodo.bind(this)}
                {...unclassified}
                id=""
                doneList={this.state.doneList}
                memberList={this.state.memberList}
                handleTodoCreate={this.handleTodoCreate.bind(this, 0, null)}
                handleTodoCheck={this.handleTodoCheck.bind(this, 0, null)}
                handleTodoModify={this.handleTodoModify.bind(this, 0, null)}
                handleAssigneeChange={this.handleAssigneeChange.bind(this, 0, null)}
                handleDateChange={this.handleDateChange.bind(this, 0, null)}
                handleTodoDelete={this.handleTodoDelete.bind(this, 0, null)}
                handleTodoListDelete={this.handleTodoListDelete.bind(this, null, unclassified.id)}
                handleTodoListModify={this.handleTodoListModify.bind(this, null, unclassified.id)}
            ></TodoList>
        }

        {
            this.state.showCreateTodoList &&
            <EditTodoList
                confirmLabel="保存，开始添加任务"
                handleConfirm={this.handleTodoListCreate.bind(this)}
                handleClose={(() => { this.setState({ showCreateTodoList: false }) }).bind(this)}>
            </EditTodoList>
        }

        {this.state.todoListArr.map((todoList, index) => {
            if (index === 0) {
                return
            }
            return (
                <TodoList
                    key={todoList.id}
                    {...todoList}
                    doneList={this.state.doneList}
                    createInput="任务名"
                    memberList={this.state.memberList}
                    handleTodoCreate={this.handleTodoCreate.bind(this, index, todoList.id)}
                    handleTodoCheck={this.handleTodoCheck.bind(this, index, todoList.id)}
                    handleTodoModify={this.handleTodoModify.bind(this, index, todoList.id)}
                    handleAssigneeChange={this.handleAssigneeChange.bind(this, index, todoList.id)}
                    handleDateChange={this.handleDateChange.bind(this, index, todoList.id)}
                    handleTodoDelete={this.handleTodoDelete.bind(this, index, todoList.id)}
                    handleTodoListDelete={this.handleTodoListDelete.bind(this, index, todoList.id)}
                    handleTodoListModify={this.handleTodoListModify.bind(this, index, todoList.id)}
                ></TodoList>
            )
        })
        }
        <div className="completed" onClick={()=>{location.href = '/completed/' + this.teamId}}>已完成任务</div>
    </div>
        )}
}
export default Task