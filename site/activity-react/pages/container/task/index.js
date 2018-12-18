import React from 'react'
import './style.scss'
import api from '../../../utils/api';
import TodoList from '../todo/todolist/todoList'
import EditTodoList from '../todo/todolist/editTodoList'
import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';

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
        onDragStart: false,
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


        result.data.teamObj.memberList.map((item) => {  // 判断是否是创建者 ？
            memberIDList.push(item.userId)
        })
        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })
        // console.log('result.data.topicList', result.data.topicList)
        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.teamObj.memberList[idx],
                chosen: false,
            })
        })
        this.setState({
            memberList: memberList
        })
    }

    initTodoListArr = async () => {
        const resp = await api('/api/team/taskList', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })
        
        let todoListArr = this.state.todoListArr
        //未分类列表
        let unclassifiedList = []
        let unclassified = {}
        let todoList = []
        if (resp.data.taskObj.taskList == undefined) {
            resp.data.taskObj.taskList = []
        }
         //普通任务项都加到未分类列表中
        resp.data.taskObj.taskList.map((item) => {
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
         //未分类对象的列表是未分类列表
        unclassified.list = unclassifiedList
        if (resp.data.taskObj.tasklistList == undefined) {
            resp.data.taskObj.tasklistList = []
        }
        //清单对象加入到todoList数组中
        resp.data.taskObj.tasklistList.map((item) => {
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
                        id: result.data.taskList.id,
                        name: result.data.taskList.name,
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
    //任务项的创建/添加
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
                    listId: result.data.taskObj.listId,
                    id: result.data.taskObj.id,
                    name: result.data.taskObj.title,
                    desc: result.data.taskObj.content,
                    assignee: {
                        id: result.data.taskObj.header,
                    },
                    ddl: result.data.taskObj.deadline,
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
            else{
                window.toast(result.state.msg)
            }
            return result
        }
        
    }
    //checkbox
    handleTodoCheck = async (lIndex, lId, id, hasDone) => {
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
        if (resp.state.code === 0) {
            // 更新 todolist
            const todoListArr = this.state.todoListArr
            const doneList = this.state.doneList
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            todoItem.hasDone = resp.data.taskObj.state
            todoItem.listId = resp.data.taskObj.listId
            todoItem.completeTime = resp.data.taskObj.completed_time
            // ...更新完成时间赋值
            todolist.list[itemIndex] = todoItem
            if(!doneList.find((item)=>{return todoItem.id === item.id})){
                doneList.push(todoItem)
            }
            this.setState({ doneList })
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
                todoItem.name = resp.data.taskObj.title
                todoItem.ddl = resp.data.taskObj.deadline
                todoItem.assignee.id = resp.data.taskObj.header
                todolist.list[itemIndex] = todoItem
                this.setState({ todoListArr })
            }
            //todoItem有使用
            return resp
        }
    }

    handleAssigneeChange = async (lIndex, lId, id, e) => {
        let editTask = {}
        editTask.assigneeId = e.target.value
        if(editTask.assigneeId === "null"){
            editTask.assigneeId = undefined
        }
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
            let todoListArr = this.state.todoListArr
            const todolist = todoListArr[lIndex]
            const [todoItem, itemIndex] = getUpdateItem(todolist.list, id)
            // fix bug: 这里进行过短路优化
            todoItem.assignee = {}
            todoItem.assignee.id = resp.data.taskObj.header
            todolist.list[itemIndex] = todoItem
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
            todoItem.ddl = resp.data.taskObj.deadline
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
            this.setState({ todoListArr })
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
                todoListArr[index].name = resp.data.editTasklist.name
                this.setState({ todoListArr })
            }
            return resp
        }
    }
    dragStart(id, lId, e){
        this.dragged = e.currentTarget
        this.setState({
            listIdFrom: lId,
            dragTodoId: id,
            onDragStart: true
        })
    }
    dragEnd = async(lIndex,id,e) => {
        const todoListArr = this.state.todoListArr
        var data=[]
        var from ;
        var to;
        this.setState({
            onDragStart: false
        })
        if(this.dragged.dataset.type =='item'){
            from = Number(this.dragged.dataset.id)
            to = Number(this.over.dataset.id)
            data = todoListArr[lIndex].list
            const resp = await api('/api/task/changeIndex', {
                method: "POST",
                body: {
                    taskId: id,
                    index: to,
                    teamId: this.teamId,
                }
            })
            if(resp.state.code === 0){
                this.initTodoListArr()
            }
        }else if(this.dragged.dataset.type == 'list'){
            from = Number(this.dragged.dataset.listid)
            to = Number(this.over.dataset.listid)
            data = todoListArr
            if(to === 0 || !to) return
            const resp = await api('/api/task/changeListIndex', {
                method: "POST",
                body: {
                    listId: id,
                    index: to-1,
                    teamId: this.teamId,
                }
            })
            if(resp.state.code === 0){
                this.initTodoListArr()
            }
        }
        
    }

    dragOver(e){
        e.preventDefault()
        this.over = e.target
    }

    drop = async(listIdTo, e) => {
        this.setState({
            onDragStart: false
        })
        if(this.dragged.dataset.listindex !== e.target.dataset.listindex){
            const todoListArr = this.state.todoListArr
            var from = todoListArr[this.dragged.dataset.listindex].list
            var targetItem = from.splice(this.dragged.dataset.id,1)[0]
            var to = todoListArr[e.target.dataset.listindex].list
            to.splice(e.target.dataset.id,0,targetItem)
            this.setState({ todoListArr })
            const resp = await api('/api/task/changeList',{
                method: "POST",
                body: {
                    taskId: this.state.dragTodoId,
                    listIdTo: listIdTo,
                    listIdFrom: this.state.listIdFrom,
                }
            })
            if(resp.state.code === 0){
                this.initTodoListArr()
            }
        }
    }


    render(){
        const unclassified = this.state.todoListArr[0]
        return(
        <div>
        <div className="head">
            <span className='head-title'>任务</span>
            {(this.props.role!=='visitor')&&<div className="create-btn">
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
            </div>}
        </div>
        


        {unclassified &&
            <TodoList
                listType="unclassified"
                showCreateTodo={this.state.showCreateTodo}
                createInput="任务名"
                handlecloseEditTodo={this.handlecloseEditTodo.bind(this)}
                {...unclassified}
                id=""
                role={this.props.role}
                highLight={this.state.onDragStart&&(this.state.listIdFrom!=="")}
                dragTodoId={this.state.dragTodoId}
                dragStarted={this.state.onDragStart}
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
                dragOver={this.dragOver.bind(this)}
                dragStart={this.dragStart.bind(this)}
                dragEnd={this.dragEnd.bind(this,0)}
                drop={this.drop.bind(this)}
                index={0}
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
                    role={this.props.role}
                    highLight={this.state.onDragStart&&(this.state.listIdFrom!==todoList.id)}
                    dragTodoId={this.state.dragTodoId}
                    dragStarted={this.state.onDragStart}
                    memberList={this.state.memberList}
                    handleTodoCreate={this.handleTodoCreate.bind(this, index, todoList.id)}
                    handleTodoCheck={this.handleTodoCheck.bind(this, index, todoList.id)}
                    handleTodoModify={this.handleTodoModify.bind(this, index, todoList.id)}
                    handleAssigneeChange={this.handleAssigneeChange.bind(this, index, todoList.id)}
                    handleDateChange={this.handleDateChange.bind(this, index, todoList.id)}
                    handleTodoDelete={this.handleTodoDelete.bind(this, index, todoList.id)}
                    handleTodoListDelete={this.handleTodoListDelete.bind(this, index, todoList.id)}
                    handleTodoListModify={this.handleTodoListModify.bind(this, index, todoList.id)}
                    index={index}
                    dragOver={this.dragOver.bind(this)}
                    dragStart={this.dragStart.bind(this)}
                    dragEnd={this.dragEnd.bind(this,index)}
                    drop={this.drop.bind(this)}
                ></TodoList>
            )
        })
        }
        
        <div className="completed" onClick={()=>{location.href = '/completed/' + this.teamId}}>已完成任务</div>
    </div>
        )}
}
export default Task