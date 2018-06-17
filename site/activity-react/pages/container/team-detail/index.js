import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'
import MemberChosenList from '../../../components/member-chose-list'
import TodoItem from '../todo/todoItem'
import NewTodo from '../todo/editTodo'
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


//工具函数
function updateList(arr, index=null, id) {
    const newList = arr.slice()
    let item = null
    // let index =null
    if(index) {
        item = arr[index]
    } else {
        newList.forEach((innerItem, innerIndex) => {
            if (innerItem.id === id) {
                item = innerItem
                index = innerIndex
            }
        })
    }
    return [newList, item, index]
}

// function updateList(arr, id,index=null) {
//     const newList = arr.slice()
//     let item = null
//     // let index =null
//     if(index) {
//         item = arr[index]
//     } else {
//         newList.forEach((innerItem, innerIndex) => {
//             if (innerItem.id === id) {
//                 item = innerItem
//                 index = innerIndex
//             }
//         })
//     }
//     return [newList, item, index]
// }


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
    }
    initTeamInfo = async () => {

        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })
        console.log('result:', result);

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

        console.log('memberResult:', memberResult);

        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.memberList[idx],
                chosen: false,
            })
        })
        console.log(memberList)
        this.setState({
            isCreator: isCreator,
            teamInfo: teamInfo,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
        // 请求todoListArr数据
        const resp = await mock.httpMock('/team/:id/todolist/get', { id: this.teamId })
        if (resp.status === 200) {
            this.setState({ todoListArr: resp.data.todoList })
        }
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
    handleTodoCheck = async(id) => {
        const [todoList,todoItem] = updateList(this.state.todoList, id)
        const resp = await mock.httpMock('/todo/:id/put', { id: id, hasDone: !todoItem.hasDone })
        if (resp.status ===200) {
            todoItem.hasDone = !todoItem.hasDone
            this.setState({ todoList })
        }
    }

    handleTodoCreate = async(index, id,todoInfo) => {
        const resp = await mock.httpMock('/todo/post', {
            // teamId: this.teamId,
            listId: id,
            name: todoInfo.name,
            ddl: todoInfo.date,
            assigneeId: todoInfo.assigneeId,
        })
        if (resp.status === 201) {
            this.state.todoListArr[index].list = [...this.state.todoListArr[index].list, resp.data.todo]
            this.setState({todoListArr: this.state.todoListArr.slice()})
        }
        return resp
    }

    handleTodoModify = async(id, todoInfo) => {
        const [todoList,todoItem] = updateList(this.state.todoList, id)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: id,
            name: todoInfo.name,
            ddl: todoInfo.date,
            assigneeId: todoInfo.assigneeId,
        })
        if (resp.status ===200) {
            todoItem.name = resp.data.todo.name
            todoItem.ddl = resp.data.todo.ddl
            todoItem.assignee = resp.data.todo.assignee
            this.setState({todoList})
        }
    }

    handleAssigneeChange = async(id,e) => {
        const [todoList,todoItem] = updateList(this.state.todoList, id)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: id,
            assigneeId: e.target.value,
        })
        if (resp.status ===200) {
            todoItem.assignee = resp.data.todo.assignee
            this.setState({todoList})
            return resp
        }
    }

    handleDateChange = async(id,e) => {
        const [todoList,todoItem] = updateList(this.state.todoList, id)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: id,
            ddl: e.target.value,
        })
        if (resp.status ===200) {
            todoItem.ddl = resp.data.todo.ddl
            this.setState({todoList})
            return resp
        }
    }

    handleTodoDelete = async(id) => {
        const [todoList,todoItem,index] = updateList(this.state.todoList, id)
        const resp = await mock.httpMock('/common/delete')
        if (resp.status ===200) {
            todoList.splice(index,1)
            this.setState({todoList})
            return resp
        }
    }

    // todoList
    handleTodoListCreate = async(info) => {
        const resp = await mock.httpMock('/todolist/post', {
            teamId: this.teamId,
            name: info.name
        })
        if (resp.status === 201) {
            const todoListArr = [...this.state.todoListArr, resp.data.todoList]
            this.setState({showCreateTodoList: false, todoListArr})
        }
        return resp
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
            // 重新生成todoListArr,如果后续抽取todoListArr进行短路优化会用上
            // 目前只针对todoList和todoItem做性能优化
        }
        return resp
    }

    handleTodoListDelete = async(index, id) => {
        const todoListArr = this.state.todoListArr
        const resp = await mock.httpMock('/common/delete', {id})
        todoListArr.splice(index, 1)
        if (resp.status ===200) {
            this.setState({ todoListArr: todoListArr.slice() })
        }
        return resp
    }

    render() {
        let teamInfo = this.state.teamInfo
        const unclassified = this.state.todoListArr[0]

        console.log(this.state.memberList)
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

                        {/*<div className="todo-list">*/}
                            {/*{*/}
                                {/*todoList.map((item) => {*/}
                                    {/*return (*/}
                                        {/*<TodoItem*/}
                                            {/*{...item}*/}
                                            {/*key={item.id}*/}
                                            {/*memberList={this.state.memberList}*/}
                                            {/*handleAssigneeChange={this.handleAssigneeChange.bind(this,item.id)}*/}
                                            {/*handleDateChange={this.handleDateChange.bind(this,item.id)}*/}
                                            {/*handleTodoModify={this.handleTodoModify.bind(this,item.id )}*/}
                                            {/*handleTodoDelete={this.handleTodoDelete.bind(this,item.id )}*/}
                                            {/*handleTodoCheck={this.handleTodoCheck.bind(this,item.id)} />*/}
                                    {/*)*/}
                                {/*})*/}
                            {/*}*/}
                        {/*</div>*/}
                        {/*{*/}
                            {/*this.state.showCreateTodo &&*/}
                            {/*<NewTodo*/}
                                {/*memberList={this.state.memberList}*/}
                                {/*confirmLabel="添加任务"*/}
                                {/*handleConfirm={this.handleTodoCreate.bind(this)}*/}
                                {/*handleClose={(() => {this.setState({showCreateTodo: false})}).bind(this)}>*/}
                            {/*</NewTodo>*/}
                        {/*}*/}
                        {/*{*/}
                            {/*this.state.showCreateTodoList &&*/}
                            {/*<EditTodoList*/}
                                {/*confirmLabel="保存，开始添加任务"*/}
                                {/*handleConfirm={this.handleTodoListCreate.bind(this)}*/}
                                {/*handleClose={(() => {this.setState({showCreateTodoList: false})}).bind(this)}>*/}
                            {/*</EditTodoList>*/}
                        {/*}*/}
                        {/*<div className="todo-list">*/}
                            {/*{*/}
                                {/*doneList.map((item) => {*/}
                                    {/*return (*/}
                                        {/*<TodoItem*/}
                                            {/*{...item}*/}
                                            {/*key={item.id}*/}
                                            {/*memberList={this.state.memberList}*/}
                                            {/*handleTodoCheck={this.handleTodoCheck.bind(this, item.id)} />*/}
                                    {/*)*/}
                                {/*})*/}
                            {/*}*/}
                        {/*</div>*/}
                        {   unclassified &&
                                <TodoList
                                    key={unclassified.id}
                                    {...unclassified}
                                    listType="unclassified"
                                    showCreateTodo = {this.state.showCreateTodo}
                                    memberList={this.state.memberList}
                                    handleTodoCreate={this.handleTodoCreate.bind(this)}
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
                                        handleTodoListDelete={this.handleTodoListDelete.bind(this, index, todoList.id )}
                                        handleTodoListModify={this.handleTodoListModify.bind(this, index, todoList.id)}
                                    ></TodoList>
                                )
                            })
                        }
                    </div>
                </div>
            </Page>
        )
    }
}


