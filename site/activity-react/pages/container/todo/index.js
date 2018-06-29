import * as React from 'react';
import './style.scss'
import mock from '../../../mock';
import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'
import TodoItem from './todoItem'
import NewCheck from './editTodo'

import MemberChosenList from '../../../components/member-chose-list'

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

class TopicItem extends React.PureComponent{
    render() {
        return(
            <div className="topic-item"  onClick={() => {this.props.locationTo('/discuss/topic/' + this.props._id)}}>
                <div className="imgInfo">
                    <img src={this.props.creator.headImg} alt="" className="head-img" />
                </div>
                <div className="info">
                    <div className="send">
                        <div className="name">{this.props.creator.name}</div>
                        <div className="time">{timeBefore(this.props.time)}</div>
                    </div>
                    <div className="main">
                        <div className="topic-title">{this.props.title}</div>
                        <div className="topic-content">{this.props.content}</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default class Task extends React.Component{
    state = {
        showCreateTopic: false,
        isCreator: false,
        showButton: true,
        moveExpanded: false,
        showActionList: false,
        copyExpanded: false,
        createTopicName: '',
        createTopicContent: '',
        memberNum: 0,
        showCreateCheck: false,
        actionList:[],
        topicListArr: [],
        copyNumber:0,
        teamToMove: '请选择小组',
        user: {
            headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
        },
        memberList: [],
        todo: {},
        copyTeamList:[],
        moveTeamList:[],
    }

    componentDidMount = async() => {
        await this.initTodoInfo()
        this.initMemberList()
        this.initTopicListArr()
        this.initTeamList()
    }

    locationTo = (url) => {
        this.props.router.push(url)
    }

    initTeamList = async () => {
        const result = await api('/api/getMyInfo', {
            method: 'GET',
            body: {}
        })
        const teamList = result.data.teamList
        teamList.map((item, index)=>{
            if(item.teamId === this.state.todo.teamId){
                teamList.splice(index, 1)
            }
        })
        this.setState({
            moveTeamList: teamList,
        })
        const result1 = await api('/api/getMyInfo', {
            method: 'GET',
            body: {}
        })
        this.setState({
            copyTeamList: result1.data.teamList,
        })
    }

    initMemberList = async () => {
        let memberList =[]
        let memberIDList =[]

        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.state.todo.teamId
            }
        })

        if(!result.data) {
            window.toast('团队内容加载出错')
        }

        const curUserId = this.props.personInfo._id

        let isCreator = false
        result.data.memberList.map((item) => {  // 判断是否是创建者 ？
            if(item.userId == curUserId) {
                isCreator = true
            }
            memberIDList.push(item.userId)
        })
        console.log('memberIDList', memberIDList)
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
        console.log('memberList', memberList)
        this.setState({
            isCreator: isCreator,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
    }

    initTodoInfo = async() => {
        const resp = await api('/api/task/taskInfo', {
            method: 'GET',
            body: {
                taskId: this.props.params.id,
            }
        })
        // 后端数据接口适配
        console.log('checkitemList', resp.data)
        const todo = {}
        todo.id = resp.data._id
        todo.hasDone = resp.data.state
        todo.desc = resp.data.content
        todo.ddl = resp.data.deadline
        todo.name = resp.data.title
        todo.list = []
        todo.teamId = resp.data.teamId
        todo.assignee = {}
        todo.assignee.id = resp.data.header
        console.log('todo', todo.hasDone)
        // 没有username,根据memberList获取
        resp.data.checkitemList.forEach(function (item) {
            const listItem = {}
            listItem.id = item._id
            listItem.name = item.content
            listItem.hasDone = item.state || false
            listItem.ddl = item.deadline
            listItem.assignee = {}
            listItem.assignee.id = item.headerId
            todo.list.push(listItem)
        })

        if (resp.state.code === 0) {
            this.setState({ todo })
        }
    }

    initTopicListArr = async() => {
        const resp = await api('/api/task/findDiscuss', {
            method:"POST",
            body:{ taskId: this.props.params.id }
        })
        console.log(resp)
        if(!resp.data.discussList){
            resp.data.discussList = []
        }
        if (resp.state.code === 0) {
            this.setState({ topicListArr: resp.data.discussList })
        }
    }

    createTopicHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })
        const resp = await api('/api/task/createDiscuss', {
            method:"POST",
            body:{
                teamId: this.state.todo.teamId,
                taskId: this.props.params.id,
                title: this.state.createTopicName,
                content: this.state.createTopicContent,
                informList: informList,
            }
        })
        console.log(resp)
        if (resp.state.code === 0) {
            const topicList = this.state.topicListArr
            let topic = {}
            topic.id = resp.data._id
            topic.creator = resp.data.creator
            topic.time = resp.data.create_time
            topic.content = resp.data.content
            topicList.push(topic)
            this.setState({
                topicListArr:topicList,
                createTopicName:"",
                createTopicContent:"",
             })
        }
        return resp
    }

    loadMoreHandle = () => {
        this.setState({
            loadMoreCount:this.state.loadMoreCount+1
        },async () => {
            let showTopicList = this.state.topicListArr
            let moreList = []
            const resp = await mock.httpMock('/todo/:id/get', {
                id: this.teamId,
                loadMoreCount: this.state.loadMoreCount
            })
            if (resp.status === 200) {
                moreList = resp.data.topicList
            }
            moreList.map((item)=>{
                showTopicList.push(item)
            })
            this.setState({
                topicListArr:showTopicList
            })
        })
    }

    moveToTeamHandle = async () => {
        if(this.state.teamToMove=="请选择小组"){
            alert(this.state.teamToMove)
        }
        else{
            const resp = await api('/api/task/taskMove', {
                method:"POST",
                body:{ 
                    taskId:this.props.params.id,
                    teamIdMoveTo: this.state.teamToMove
                }
            })
            console.log(resp)
            if (resp.state.code === 0) {
            alert('移动成功')
            }
        }
    }

    copyHandle = async () => {
        const todo = this.state.todo
        if(this.state.copyNumber==0){
            alert("请输入数量[1~50]")
        }
        else{
            // for(i=0;i<this.state.copyNumber;i++){

            // }
            const resp = await mock.httpMock('/todo/post', {
                sourceId: todo.id,
                name: todo.name,
                desc: todo.desc,
            })
            if (resp.status ===200) {
            alert('复制成功')
            }
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

    selectedHandle = (e) => {
        this.setState({
            teamToMove: e.target.value
        })
    }

    numberInputHandle = (e) => {
        this.setState({
            copyNumber: e.target.value
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
        location.href = '/team-admin/' + this.state.todo.teamId
    }

    // todo
    handleTodoCheck = async(hasDone) => {
        const taskId = this.props.params.id;
        const editTask = {};
        editTask.hasDone = !hasDone
        console.log('taskId', taskId)
        console.log('editTask', editTask)
        console.log('teamId', this.state.todo.teamId)
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                teamId: this.state.todo.teamId,
                taskId,
                editTask
            }
        })
        console.log(resp)
        if (resp.state.code === 0) {
            const todo = this.state.todo
            todo.hasDone = resp.data.state
            this.setState({ todo })
        }
        return resp
    }

    handleTodoModify = async(todoInfo) => {
        const taskId = this.props.params.id;
        const editTask = {};
        editTask.name = todoInfo.name
        editTask.content = todoInfo.desc
        editTask.ddl = todoInfo.date
        editTask.desc = todoInfo.desc
        editTask.assigneeId = todoInfo.assigneeId
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                taskId,
                editTask
            }
        })
        console.log('handleTodoModify resp', resp)
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rAssignee = {}
            rAssignee.id = resp.data.header
            todo.name = resp.data.title
            todo.ddl = resp.data.deadline
            todo.desc = resp.data.content
            todo.assignee = rAssignee
            console.log('handleTodoModify', todo)
            this.setState({ todo })
        }
        return resp
    }

    handleAssigneeChange = async(e) => {
        const taskId = this.props.params.id;
        const editTask = {};
        editTask.assigneeId = e.target.value
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                taskId,
                editTask
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rAssignee = {}
            rAssignee.id = resp.data.header
            todo.assignee = rAssignee
            this.setState({ todo })
        }
        return resp
    }

    handleDateChange = async(e) => {
        const taskId = this.props.params.id;
        const editTask = {};
        editTask.ddl = e.target.value
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                taskId,
                editTask
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            todo.ddl = resp.data.deadline
            this.setState({ todo })
        }
        return resp
    }

    handleTodoDelete = async() => {
        const resp = await mock.httpMock('/common/delete', { id: this.props.params.id })
        if (resp.status ===200) {
            this.props.router.push(`/team/${this.state.todo.teamId}`)
        }
    }

    // check create 需要返回
    handleCheckCreate = async(todoInfo) => {
        const resp = await api('/api/task/addCheckitem', {
            method: 'POST',
            body: {
                todoId: this.props.params.id,
                name: todoInfo.name,
                ddl: todoInfo.date,
                assigneeId: todoInfo.assigneeId,
            }
        })

        console.log('assigneeId', todoInfo.assigneeId)
        console.log('resp', resp)

        if (resp.state.code === 0) {
            const todo = this.state.todo
            const checkItem = {}
            checkItem.id = resp.data.id
            checkItem.name = resp.data.content
            checkItem.assignee = {}
            checkItem.assignee.id = resp.data.header
            checkItem.ddl = resp.data.deadline
            checkItem.hasDone = false
            todo.list = [...todo.list, checkItem]
            this.setState({ todo })
        }
        return resp
    }

    handleCheckModify = async(index, id, checkItemInfo) => {
        const todoId = this.props.params.id
        const checkitemId = id
        const editCheckitem = {}
        editCheckitem.name = checkItemInfo.name
        editCheckitem.ddl = checkItemInfo.date
        editCheckitem.assigneeId = checkItemInfo.assigneeId

        const resp = await api('/api/task/editCheckitem', {
            method: 'POST',
            body: {
                todoId,
                checkitemId,
                editCheckitem
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rAssignee = {}
            rAssignee.id = resp.data.header
            todo.list[index].name = resp.data.content
            todo.list[index].ddl = resp.data.deadline
            todo.list[index].assignee = rAssignee
            this.setState({ todo })
        }
        return resp
    }

    handleCheckAssigneeChange = async(index, id, e) => {
        const todoId = this.props.params.id
        const checkitemId = id
        const editCheckitem = {}
        editCheckitem.assigneeId = e.target.value
        const resp = await api('/api/task/editCheckitem', {
            method: 'POST',
            body: {
                todoId,
                checkitemId,
                editCheckitem
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rAssignee = {}
            rAssignee.id = resp.data.header
            todo.list[index].assignee = rAssignee
            this.setState({ todo })
        }
        return resp
    }

    handleCheckDateChange = async(index, id, e) => {
        const todoId = this.props.params.id
        const checkitemId = id
        const editCheckitem = {}
        editCheckitem.ddl = e.target.value
        const resp = await api('/api/task/editCheckitem', {
            method: 'POST',
            body: {
                todoId,
                checkitemId,
                editCheckitem
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rDDL = resp.data.deadline
            todo.list[index].ddl = rDDL
            this.setState({ todo })
        }
        return resp
    }

    handleCheckCheck = async(index, id, hasDone) => {
        const todoId = this.props.params.id
        const checkitemId = id
        const editCheckitem = {}
        editCheckitem.hasDone = !hasDone
        console.log('editCheckitem', editCheckitem)
        const resp = await api('/api/task/editCheckitem', {
            method: 'POST',
            body: {
                todoId,
                checkitemId,
                editCheckitem
            }
        })
        console.log('resp', resp);
        if (resp.state.code === 0) {
            const todo = this.state.todo
            const rHasDone = resp.data.state
            todo.list[index].hasDone = rHasDone
            todo.list = todo.list.slice()
            this.setState({ todo })
        }
        return resp
    }

    handleCheckDelete = async(index, id) => {
        const todoId = this.props.params.id
        const checkitemId = id
        const resp = await api('/api/task/dropCheckitem', {
            method: 'POST',
            body: {
                todoId,
                checkitemId,
            }
        })

        if (resp.state.code === 0) {
            const todo = this.state.todo
            const [checkItem, checkItemIndex] = getUpdateItem(todo.list, id)
            todo.list.splice(checkItemIndex, 1)
            todo.list = todo.list.slice()
            this.setState({ todo })
        }
        return resp
    }

    render() {
        let actionList = this.state.actionList || []
        let moveExpanded = this.state.moveExpanded
        let copyExpanded = this.state.copyExpanded


        return (
            <Page title={"任务详情"} className="discuss-page">

                 <div className="discuss-con page-wrap">

                     <TodoItem
                         {...this.state.todo}
                         detail='detail'
                         memberList={this.state.memberList}
                         handleAssigneeChange={this.handleAssigneeChange}
                         handleDateChange={this.handleDateChange}
                         handleTodoModify={this.handleTodoModify}
                         handleTodoCheck={this.handleTodoCheck}
                         handleTodoDelete={this.handleTodoDelete}/>
                     <div className="checkitem-list">
                         {
                             this.state.todo.list &&
                                 this.state.todo.list.map((cItem, index) => {
                                 return (
                                     <TodoItem
                                         key={cItem.id}
                                         type="check"
                                         {...cItem}
                                         memberList={this.state.memberList}
                                         handleAssigneeChange={this.handleCheckAssigneeChange.bind(this, index, cItem.id)}
                                         handleDateChange={this.handleCheckDateChange.bind(this, index, cItem.id)}
                                         handleTodoModify={this.handleCheckModify.bind(this, index, cItem.id)}
                                         handleTodoCheck={this.handleCheckCheck.bind(this, index, cItem.id)}
                                         handleTodoDelete={this.handleCheckDelete.bind(this, index, cItem.id)}
                                     />
                                 )
                             })
                         }
                     </div>
                     {this.state.showCreateCheck?
                         <NewCheck
                             memberList={this.state.memberList}
                             confirmLabel="保存"
                             handleConfirm={this.handleCheckCreate}
                             handleClose={() => {
                                 this.setState({ showCreateCheck: false})
                             }}
                         />:
                         <div className="new-check"
                             onClick={(e) => {
                                 this.setState({showCreateCheck: true})
                                 e.stopPropagation()}}>
                             <i className="icon iconfont">&#xe6e0;</i>
                             添加检查项
                         </div>
                     }

                    <div className="detail-actions">
                        <div className={"item "+((copyExpanded)?"expanded":"")}>
                            {!copyExpanded&&<a  onClick={() => {this.setState({copyExpanded: true,moveExpanded: false})}}>复制</a>}
                            {copyExpanded&&<div className="confirm">
                                <form>
                                    <p className="title">复制任务到小组</p>
                                    <div className="simple-select select-choose-projects require-select" >
                                        <select onChange={this.selectedHandle} value={this.state.teamToMove} className="select-list">
                                            <option className="default" value="请选择小组">点击选择小组</option>
                                            {this.state.copyTeamList.map((item) => {
                                                return (
                                                    <option className="select-item" key={'team name'+ item.teamId} value={item.teamId}>
                                                        {item.teamName}
                                                    </option>
                                                )
                                            })
                                            }
                                        </select>
                                    </div>
                                        <button className="act" onClick={this.copyHandle}>复制</button>
                                        <div type="button" className="cancel" onClick={() => {this.setState({copyExpanded: false})}}>取消</div>
                                </form>
                            </div>}
                        </div>
                        <div className={"item "+((moveExpanded)?"expanded":"")} >
                            {!moveExpanded&&<a onClick={() => {this.setState({moveExpanded: true,copyExpanded: false})}}>移动</a>}
                            {moveExpanded&&<div className="confirm">
                                    <p className="title">移动任务到小组</p>
                                    <div className="simple-select select-choose-projects require-select" >
                                        <select onChange={this.selectedHandle} value={this.state.teamToMove} className="select-list">
                                            <option className="default" value="请选择小组">点击选择小组</option>
                                            {this.state.moveTeamList.map((item) => {
                                                return (
                                                    <option className="select-item" key={'team name'+ item.teamId} value={item.teamId}>
                                                        {item.teamName}
                                                    </option>
                                                )
                                            })
                                            }
                                        </select>
                                    </div>
                                    <button className="act" onClick={() => {this.moveToTeamHandle; this.setState({moveExpanded: false})}}>移动</button>
                                    <div type="button" className="cancel" onClick={() => {this.setState({moveExpanded: false})}}>取消</div>

                            </div>}
                        </div>
                    </div>
                    <div className="action-list">
                    {
                        actionList.map((item) => {
                            return(
                                <div className="action-item">
                                    <i className={"iconfont "+item.icon+((item.success)?" success":"")}></i>
                                    <div className={"action "+((item.success)?" success":"")}>{item.time} {item.creator.name} {item.action}{item.task} </div>
                                </div>
                            )
                        })
                    }
                    </div>
                    <div className="topic-list">
                        {
                            this.state.topicListArr.map((item) => {
                                return (
                                    <TopicItem key={"topic-item-" + item.id} locationTo={this.locationTo} {...item} />
                                )
                            })
                        }
                    </div>


                    <div className="load-more" onClick={this.loadMoreHandle}>点击加载更多</div>

                    <div className="create-topic">
                        <div className="imgInfo">
                            <img src={this.state.user.headImg} alt="" className="head-img" />
                        </div>
                        <div className="info">
                    {
                        this.state.showButton && <input type="text" onClick={() => {this.setState({showCreateTopic: true,showButton:false})}} className="topic-name" placeholder="点击发表评论" /> }
                            {
                                this.state.showCreateTopic && <div className="create-area">
                                    <input type="text" className="topic-name" onChange={this.topicNameInputHandle} value={this.state.createTopicName} placeholder="话题" />
                                    <textarea className="topic-content" onChange={this.topicContentInputHandle} value={this.state.createTopicContent} placeholder="说点什么"></textarea>
                                    <div className="infrom">请选择要通知的人：</div>
                                    <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/>

                                    <div className="btn-con">
                                        <div className="create-btn" onClick={this.createTopicHandle}>发起讨论</div>
                                        <div className="cancle" onClick={() => {this.setState({showCreateTopic: false,showButton:true})}}>取消</div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </Page>
        )
    }
}


