import * as React from 'react';
import './style.scss'
import mock from '../../../mock';
import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'
import TodoItem from './todoItem'
import NewCheck from './editTodo'
import Editor from '../../../components/editor'
import fileUploader from '../../../utils/file-uploader'

import { timeBefore, sortByCreateTime, createMarkup } from '../../../utils/util'
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

class TopicItem extends React.Component{
    state = {
        showEdit: false,
        showCreateTopic: false,
        showButton: true,
        discussAttachments:this.props.fileList,
        disAttachmentsArr:[],
        disOssKeyArr:[]
    }
    
    deleteTopicHandle = () => {
        this.props.deleteTopicHandle(this.props.id)
    }

    updateTopicHandle = () => {
        this.props.updateTopicHandle(this.props.id,this.state.discussAttachments,this.state.disAttachmentsArr,this.state.disOssKeyArr)
    }
    sendContent = () => {
        this.props.sendContent(this.props.content)
    }

    discussFileUploadHandle = async (e) => {
        var ossKey = this.props.teamId + '/' + Date.now() + '/' + e.target.files[0].name
        const disAttachmentsArr = this.state.disAttachmentsArr
        const disOssKeyArr = this.state.disOssKeyArr
        disAttachmentsArr.push(e.target.files[0])
        disOssKeyArr.push(ossKey)
        this.setState({
            disAttachmentsArr,
            disOssKeyArr
        })
        const resp = await fileUploader(e.target.files[0], ossKey)
        let discussAttachments = this.state.discussAttachments;
        discussAttachments = [...discussAttachments, resp]
        this.setState({
            discussAttachments,
        })
    }

    deleteDiscussFile = async (e, index) => {
        console.log("del")
        let discussAttachments = this.state.discussAttachments
        discussAttachments.splice(index,1);
        this.setState({
            discussAttachments,
        })
    }

    downloadHandle = (ossKey) => {
        console.log(ossKey)
        window.open(window.location.origin + '/static/' + ossKey)
    }

    render() {
        return(
            <div className="topic-item" onMouseOver={() => this.setState({showEdit:true})} onMouseLeave={() => this.setState({showEdit:false})}>
                <div className="imgInfo">
                    <img src={this.props.creator.headImg} alt="" className="head-img" />
                </div>
                <div className="info">
                    <div className="send">
                        <div className="name">{this.props.creator.name}</div>
                        <div className="time">{timeBefore(this.props.time)}</div>
                        {this.props.fileList.length > 0 &&
                            <i className="icon iconfont time">&#xe6dd;</i>
                        }
                        {
                            this.state.showEdit&&<div className="topic-actions-wrap">
                                <div className="topic-actions">
                                    <i className="icon iconfont" onClick={this.deleteTopicHandle}>&#xe70b;</i>
                                    <i className="icon iconfont" onClick={() => {this.props.updateTopicInputHandle(this.props.content);this.setState({showCreateTopic: true,showButton:false})}}> &#xe6ec;</i>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="main">
                        {/* <div className="topic-title">{this.props.title}</div> */}
                        {/* {this.state.showButton&&<div className="topic-content">{this.props.content}</div>} */}
                        {this.state.showButton&&<div>
                            <p dangerouslySetInnerHTML={createMarkup(this.props.content)}></p>
                            <div className="file-list">
                            {
                                this.props.imgList.map((item) => {
                                    return (
                                        <div className="file-pic-item" key={Math.random()} onClick={this.downloadHandle.bind(this, item.name)}>
                                            <img className="file-pic" src={window.location.origin + '/static/' + item.name}></img>
                                            <div className="file-name">{item.name.split("/")[2]}</div>
                                        </div>
                                    )
                                })
                            }
                                {
                                     this.props.fileList.map((item) => {
                                        if(!(item.name.endsWith(".jpg")||item.name.endsWith(".jpeg")||item.name.endsWith(".png")||item.name.endsWith(".bmp")||item.name.endsWith(".gif"))){
                                            return ( <div className="file-item" key={Math.random()} onClick={this.downloadHandle.bind(this, item.name)}>{item.name.split("/")[2]}</div> )
                                        }
                                    })
                                }
                            </div>
                        </div>}
                        {this.state.showCreateTopic&&<div className="create-area">
                            <Editor handleContentChange={this.props.updateTopicInputHandle.bind(this)}//props.discussContentHandle
                                handleFileUpload={this.discussFileUploadHandle.bind(this)}
                                content={this.props.updateTopicContent}
                                deleteFile={this.deleteDiscussFile.bind(this)}
                                attachments={this.state.discussAttachments}>
                            </Editor>
                            {/* <div className="infrom">请选择要通知的人：</div>
                            <MemberChosenList choseHandle={this.props.memberChoseHandle} memberList={this.props.memberList}/> */}
                            <div className="btn-con">
                                <div className="create-btn" onClick={()=>{this.updateTopicHandle();this.setState({showCreateTopic: false,showButton:true})}}>发起讨论</div>
                                <div className="cancle" onClick={() => {this.setState({showCreateTopic: false,showButton:true})}}>取消</div>
                            </div>
                        </div>}
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
        createTopicContent: '',
        updateTopicContent:'',
        memberNum: 0,
        showCreateCheck: false,
        actionList:[],
        topicListArr: [],
        copyNumber:0,
        teamToMove: '请选择小组',
        teamToCopy: '请选择小组',
        user: {
            headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
        },
        memberList: [],
        todo: {},
        copyTeamList:[],
        moveTeamList:[],
        loadMoreCount:1,
        // replyCount:0
        teamName:"",
        discussAttachments:[],
        attachmentsArr:[],
        ossKeyArr:[],
        todoAttachmentsArr:[],
        todoOssKeyArr:[],
    }

    componentDidMount = async() => {
        await this.initTodoInfo()
        this.initMemberList()
        this.loadTopicListArr()
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
        const user={}
        user.headImg = result.data.personInfo.headImg
        user.name = result.data.personInfo.name
        this.setState({
            user:user
        })
        const teamList = result.data.teamList
        console.log(result)
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
        else{
            const teamName = result.data.name
            this.setState({teamName})
        }

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
        todo.imgList = []
        resp.data.fileList.map((fileItem,index)=>{
            if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                todo.imgList.push(fileItem)
            }
        })
        todo.id = resp.data._id
        todo.hasDone = resp.data.state
        todo.desc = resp.data.content
        todo.ddl = resp.data.deadline
        todo.name = resp.data.title
        todo.fileList = resp.data.fileList
        todo.list = []
        todo.listId = resp.data.listId
        todo.teamId = resp.data.teamId
        todo.assignee = {}
        todo.assignee.id = resp.data.header
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
        console.log('todo',todo)
        if (resp.state.code === 0) {
            this.setState({ todo })
        }
    }

    loadTopicListArr = async() => {
        const resp = await api('/api/task/findDiscuss', {
            method:"POST",
            body:{ 
                taskId: this.props.params.id,
                currentPage: this.state.loadMoreCount
            }
        })
        if (resp.state.code === 0) {
            console.log(resp)
            const topicListArr = this.state.topicListArr 
            resp.data.map((item)=>{
                const topic = {}
                topic.imgList = []
                item.fileList.map((fileItem,index)=>{
                    if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                        topic.imgList.push(fileItem)
                    }
                })
                topic.id = item._id
                topic.creator = item.creator
                topic.time = item.create_time
                topic.content = item.content
                topic.fileList = item.fileList
                topic.teamId = item.teamId
                topicListArr.push(topic)
            })
            this.setState({ topicListArr })
        }
    }

    createTopicHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })
        if(this.state.attachmentsArr!==[]){
            this.state.attachmentsArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.state.todo.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: this.state.ossKeyArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        const resp = await api('/api/task/createDiscuss', {
            method:"POST",
            body:{
                teamId: this.state.todo.teamId,
                taskId: this.props.params.id,
                content: this.state.createTopicContent,
                informList: informList,
                fileList:this.state.discussAttachments
            }
        })
        if (resp.state.code === 0) {
            const topicList = this.state.topicListArr
            let topic = {}
            topic.imgList = []
            resp.data.fileList.map((fileItem,index)=>{
                if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                    topic.imgList.push(fileItem)
                }
            })
            topic.id = resp.data._id
            topic.creator = resp.data.creator
            topic.time = resp.data.create_time
            topic.content = resp.data.content
            topic.fileList = resp.data.fileList
            topic.teamId = resp.data.teamId
            topicList.unshift(topic)
            this.setState({
                topicListArr:topicList,
                createTopicName:"",
                createTopicContent:"",
                discussAttachments:[],
             })
        }
        return resp
    }

    updateTopicHandle= async (id,fileList,attArr,ossArr) =>{
        console.log(this.state.updateTopicContent)
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })
        if(attArr!==[]){
            attArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.state.todo.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: ossArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        const resp = await api('/api/task/editDiscuss', {
            method:"POST",
            body:{
                teamId: this.state.todo.teamId,
                taskId: this.props.params.id,
                content: this.state.updateTopicContent,
                informList: informList,
                discussId:id,
                fileList: fileList,
            }
        })
        console.log(id)
        console.log(resp)
        if (resp.state.code ===0) {
            const topicListArr = this.state.topicListArr
            topicListArr.map((item,index)=>{
                if(item.id===id){
                    item.imgList = []
                    resp.data.fileList.map((fileItem,index)=>{
                        if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                            item.imgList.push(fileItem)
                        }
                    })
                    item.content = resp.data.content
                    item.time = resp.data.create_time
                    item.fileList = resp.data.fileList
                }
            })
            this.setState({ topicListArr })
            return resp
        }
    }

    deleteTopicHandle = async (id) =>{
        const resp = await api('/api/task/delDiscuss',{
            method:"POST",
            body:{
                discussId: id,
                teamId: this.state.todo.teamId,
                taskId: this.props.params.id,
            }
        })
        if (resp.state.code ===0) {
            const topicListArr = this.state.topicListArr
            topicListArr.map((item,index)=>{
                if(item.id===id){
                    topicListArr.splice(index,1)
                }
            })
            this.setState({ topicListArr })
            return resp
        }
    }

    loadMoreHandle = () => {
        this.setState({
            loadMoreCount:this.state.loadMoreCount+1
        },this.loadTopicListArr)}

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
            console.log("move",resp)
            if (resp.state.code === 0) {
            alert('移动成功')
            }
        }
    }

    copyHandle = async () => {
        if(this.state.copyNumber<=0||this.state.copyNumber>50){
            alert("请输入数量[1~50]")
        }
        else{
            const resp = await api('/api/task/taskCopy', {
                method:"POST",
                body:{
                    taskId:this.props.params.id,
                    teamId: this.state.todo.teamId,
                    copyCount:this.state.copyNumber
                }
            })
            console.log("copy",resp)
            if (resp.state.code === 0) {
            alert('复制成功')
            }
        }
    }

    discussContentHandle = (content) => {
        this.setState({
            createTopicContent: content
        })
    }

    discussFileUploadHandle = async (e) => {
        var ossKey = this.state.todo.teamId + '/' + Date.now() + '/' + e.target.files[0].name
        const attachmentsArr = this.state.attachmentsArr
        const ossKeyArr = this.state.ossKeyArr
        attachmentsArr.push(e.target.files[0])
        ossKeyArr.push(ossKey)
        this.setState({
            attachmentsArr,
            ossKeyArr
        })
        const resp = await fileUploader(e.target.files[0], ossKey)
        let discussAttachments = this.state.discussAttachments;
        discussAttachments = [...discussAttachments, resp]
        this.setState({
            discussAttachments,
        })
        console.log(this.state.discussAttachments)
    }

    deleteDiscussFile = async (e, index) => {
        let discussAttachments = this.state.discussAttachments
        discussAttachments.splice(index,1);
        this.setState({
            discussAttachments,
        })
    }

    updateTopicInputHandle = (content) => {
        this.setState({
            updateTopicContent: content
        })
    }

    sendContent = (e) => {
        this.setState({
            updateTopicContent: e
        })
    }

    moveSelectedHandle = (e) => {
        this.setState({
            teamToMove: e.target.value
        })
    }

    copySelectedHandle = (e) => {
        this.setState({
            teamToCopy: e.target.value
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
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                teamId: this.state.todo.teamId,
                taskId,
                editTask
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            todo.hasDone = resp.data.state
            this.setState({ todo })
        }
        return resp
    }

    handleTodoModify = async(todoInfo) => {
        console.log(todoInfo)
        if(todoInfo.attachmentsArr!==[]){
            todoInfo.attachmentsArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.state.todo.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: todoInfo.ossKeyArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        const taskId = this.props.params.id;
        const editTask = {};
        editTask.name = todoInfo.name
        editTask.ddl = todoInfo.date
        editTask.desc = todoInfo.desc
        editTask.fileList = todoInfo.fileList
        editTask.assigneeId = todoInfo.assigneeId
        const resp = await api('/api/task/edit', {
            method: 'POST',
            body: {
                teamId:this.state.todo.teamId,
                taskId,
                editTask
            }
        })
        if (resp.state.code === 0) {
            const todo = this.state.todo
            todo.imgList = []
            resp.data.fileList.map((fileItem,index)=>{
                if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                    todo.imgList.push(fileItem)
                }
            })
            const rAssignee = {}
            rAssignee.id = resp.data.header
            todo.name = resp.data.title
            todo.ddl = resp.data.deadline
            todo.desc = resp.data.content
            todo.assignee = rAssignee
            todo.fileList = resp.data.fileList
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

    handleTodoDelete = async(index,id) => {
        const resp = await api('/api/task/delTask', {
            method: 'POST',
            body: {
                taskId: this.props.params.id,
                teamId:this.state.todo.teamId,
                listId:this.state.todo.listId
            }
        })
        if (resp.state.code === 0) {
            this.locationTo('/team/' + this.state.todo.teamId)
        }
        return resp
    }

    // check create 需要返回
    handleCheckCreate = async(todoInfo) => {
        if(!todoInfo.name){
            alert("请输入检查项名")
        }
        else{
            const resp = await api('/api/task/addCheckitem', {
                method: 'POST',
                body: {
                    todoId: this.props.params.id,
                    name: todoInfo.name,
                    ddl: todoInfo.date,
                    assigneeId: todoInfo.assigneeId,
                    teamId:this.state.todo.teamId,
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
                editCheckitem,
                teamId:this.state.todo.teamId,
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
                editCheckitem,
                teamId:this.state.todo.teamId,
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
                editCheckitem,
                teamId:this.state.todo.teamId,
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
                editCheckitem,
                teamId: this.state.todo.teamId,
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
                teamId:this.state.todo.teamId,
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

    setEdit = () => {
        this.refs['todoItem'].setMode('edit')
    } 

    render() {
        let actionList = this.state.actionList || []
        let moveExpanded = this.state.moveExpanded
        let copyExpanded = this.state.copyExpanded
        return (
            <Page title={"任务详情"} className="discuss-page">
                 <div className="return" onClick={()=>{this.locationTo('/team/'+this.state.todo.teamId)}}>
                        <div className="teamName">{this.state.teamName}</div>
                </div>
                 <div className="discuss-con page-wrap">
                     <TodoItem
                         {...this.state.todo}
                         detail='detail'
                         ref='todoItem'
                         memberList={this.state.memberList}
                         handleAssigneeChange={this.handleAssigneeChange}
                         handleDateChange={this.handleDateChange}
                         handleTodoModify={this.handleTodoModify}
                         handleTodoCheck={this.handleTodoCheck}
                         handleTodoDelete={this.handleTodoDelete}
                         teamId={this.state.todo.teamId}/>

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
                             createInput="检查项名"
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
                    {(this.state.todo.desc===""||this.state.todo.desc==="<p></p>")&&
                    <div className="new-check"
                        onClick={() => {
                            this.setEdit()
                    }}>
                        <i className="icon iconfont">&#xe6e0;</i>
                        添加任务描述
                    </div>
                    }

                    <div className="detail-actions">
                        <div className={"item "+((copyExpanded)?"expanded":"")}>
                            {!copyExpanded&&<a  onClick={() => {this.setState({copyExpanded: true,moveExpanded: false})}}>复制</a>}
                            {copyExpanded&&<div className="confirm">
                                    <p className="title">复制任务到小组</p>
                                    <input type="number" placeholder="复制数量[1~50]" min="1" max="50" name="count" id="count" onChange={this.numberInputHandle} />
                                    {/* <div className="simple-select select-choose-projects require-select" >
                                        <select onChange={this.copySelectedHandle} value={this.state.teamToCopy} className="select-list">
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
                                    </div> */}
                                        <button className="act" onClick={this.copyHandle}>复制</button>
                                        <div type="button" className="cancel" onClick={() => {this.setState({copyExpanded: false})}}>取消</div>
                            </div>}
                        </div>
                        <div className={"item "+((moveExpanded)?"expanded":"")} >
                            {!moveExpanded&&<a onClick={() => {this.setState({moveExpanded: true,copyExpanded: false})}}>移动</a>}
                            {moveExpanded&&<div className="confirm">
                                <form>
                                    <p className="title">移动任务到小组</p>
                                    <div className="simple-select select-choose-projects require-select" >
                                        <select onChange={this.moveSelectedHandle} value={this.state.teamToMove} className="select-list">
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
                                    <button className="act" onClick={this.moveToTeamHandle}>移动</button>
                                    <div type="button" className="cancel" onClick={() => {this.setState({moveExpanded: false})}}>取消</div>
                                </form>
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
                                    <TopicItem 
                                    key={"topic-item-" + item.id} 
                                    locationTo={this.locationTo} 
                                    {...item} 
                                    deleteTopicHandle={this.deleteTopicHandle}
                                    memberList={this.state.memberList}
                                    memberChoseHandle={this.memberChoseHandle}
                                    updateTopicInputHandle={this.updateTopicInputHandle}
                                    updateTopicContent={this.state.updateTopicContent}
                                    updateTopicHandle={this.updateTopicHandle}
                                    sendContent={this.sendContent}/>
                                )
                            })
                        }
                    </div>
                    {
                        (this.state.topicListArr.length>=20*this.state.loadMoreCount)&&<div className="load-more" onClick={this.loadMoreHandle}>点击加载更多</div>
                    }
                    <div className="create-topic">
                        <div className="imgInfo">
                            <img src={this.state.user.headImg} alt="" className="head-img" />
                        </div>
                        <div className="info">
                    {
                        this.state.showButton && <input type="text" onClick={() => {this.setState({showCreateTopic: true,showButton:false})}} className="topic-name" placeholder="点击发表评论" /> }
                            {
                                this.state.showCreateTopic && <div className="create-area">
                                    <Editor handleContentChange={this.discussContentHandle.bind(this)}
                                                handleFileUpload={this.discussFileUploadHandle.bind(this)}
                                                content={this.state.createTopicContent}
                                                deleteFile={this.deleteDiscussFile.bind(this)}
                                                attachments={this.state.discussAttachments}>
                                    </Editor>
                                    {/* <div className="infrom">请选择要通知的人：</div>
                                    <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/> */}
                                    <div className="btn-con">
                                        <div className="create-btn" onClick={()=>{this.createTopicHandle();this.setState({showCreateTopic: false,showButton:true})}}>发表评论</div>
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


