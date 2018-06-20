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
                        <div className="time">{this.props.time}</div>
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
    componentDidMount = async() => {
        await this.initTodoInfo()
        this.initTeamList()
        this.initTopicListArr()
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
        const teamIdList = []
        teamList.map((item) => {
            teamIdList.push(item.teamId)
        })

        const listResult = await api('/api/team/infoList', {
            method: 'POST',
            body: {
                teamIdList: teamIdList
            }
        })
        const teamInfoList = listResult.data

        teamList.map((item, idx) => {
            teamList[idx] = {
                ...item,
                ...teamInfoList[idx],
                managed: (item.role == 'creator' || item.role == 'admin')
            }
        })

        this.setState({
            teamList: teamList
        },console.log(teamList))
    }

    initTodoInfo = async() => {
        const resp = await mock.httpMock('/todo/:id/get', { id: this.teamId })
        // console.log('resp',resp)
        if (resp.status === 200) {
            this.setState({ todo: resp.data.todo })
        }
    }

    initTopicListArr = async() => {
        // 请求topicListArr数据
        const resp = await mock.httpMock('/todo/:id/get', { id: this.teamId })
        console.log(resp)
        if (resp.status === 200) {
            this.setState({ topicListArr: resp.data.topicList })
        }
    }

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
        teamToMove: '',
        user: {
            headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
        },
        memberList: [
            {
                _id: 11,
                name: '萨乌丁',
                chosen: false,
            },
        ],
        todo: {},
        teamList:[],
    }

    createTopicHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })
        var time = new Date()
        const resp = await mock.httpMock('/todo/:id/post', {
                teamId: this.teamId,
                title: this.state.createTopicName,
                content: this.state.createTopicContent,
                informList: informList,
                time: time.toLocaleString(),
        })
        if (resp.status === 201) {
            const topicList = this.state.topicListArr
            topicList.push(resp.data.topic)
            this.setState({ topicListArr:topicList })
        }
        return resp
    }

    moveToTeamHandle = async () => {
        const resp = await mock.httpMock('/todo/:id/put', { teamId: this.state.teamToMove})
        if (resp.status ===200) {
           
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
        },console.log(this.state.teamToMove))
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
    handleTodoCheck = async(hasDone) => {
        const resp = await mock.httpMock('/todo/:id/put', { id: this.props.params.id, hasDone: !hasDone })
        const todo = this.state.todo
        if (resp.status ===200) {
            todo.hasDone = resp.data.todo.hasDone
        }
        this.setState({ todo })
    }

    handleTodoModify = async(todoInfo) => {
        console.log(todoInfo)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: this.props.params.id,
            name: todoInfo.name,
            ddl: todoInfo.date,
            desc: todoInfo.desc,
            assigneeId: todoInfo.assigneeId,
        })
        if (resp.status ===200) {
            const todo = this.state.todo
            todo.name = resp.data.todo.name
            todo.ddl = resp.data.todo.ddl
            todo.desc = resp.data.todo.desc
            todo.assignee = resp.data.todo.assignee
            this.setState({ todo })
        }
        return resp
    }

    handleAssigneeChange = async(e) => {
        console.log(e.target.value)
        const resp = await mock.httpMock('/todo/:id/put', {
            id: this.props.params.id,
            assigneeId: e.target.value,
        })
        if (resp.status ===200) {
            const todo = this.state.todo
            todo.assignee = resp.data.todo.assignee
            this.setState({ todo })
        }
    }

    handleDateChange = async(e) => {
        const resp = await mock.httpMock('/todo/:id/put', {
            id: this.props.params.id,
            ddl: e.target.value,
        })
        if (resp.status ===200) {
            const todo = this.state.todo
            todo.ddl = resp.data.todo.ddl
            this.setState({ todo })
        }
    }

    handleTodoDelete = async() => {
        const resp = await mock.httpMock('/common/delete', { id: this.props.params.id })
        if (resp.status ===200) {
            this.props.router.push(`/team/${this.state.todo.teamId}`)
        }
    }

    // check
    handleCheckCreate = async(todoInfo) => {
        const resp = await mock.httpMock('/check_item/post', {
            todoId: this.props.params.id,
            name: todoInfo.name,
            ddl: todoInfo.date,
            assigneeId: todoInfo.assigneeId,
        })
        if (resp.status === 201) {
            const todo = this.state.todo
            todo.list = [...todo.list, resp.data.checkItem]
            this.setState({ todo })
        }
        return resp
    }

    handleCheckModify = async(index, id, checkItemInfo) => {
        const resp = await mock.httpMock('/check_item/:id/put', {
            id: id,
            name: checkItemInfo.name,
            ddl: checkItemInfo.date,
            assigneeId: checkItemInfo.assigneeId,
        })
        const todo = this.state.todo
        if (resp.status ===200) {
            todo.list[index].name = resp.data.checkItem.name
            todo.list[index].ddl = resp.data.checkItem.ddl
            todo.list[index].assignee = resp.data.checkItem.assignee
        }
        this.setState({ todo })
        return resp
    }

    handleCheckAssigneeChange = async(index, id, e) => {
        const resp = await mock.httpMock('/check_item/:id/put', {
            id: id,
            assigneeId: e.target.value,
        })
        const todo = this.state.todo
        if (resp.status ===200) {
            todo.list[index].assignee = resp.data.checkItem.assignee
        }
        this.setState({ todo })
        return resp
    }

    handleCheckDateChange = async(index, id, e) => {
        const resp = await mock.httpMock('/check_item/:id/put', {
            id: id,
            ddl: e.target.value,
        })
        const todo = this.state.todo
        if (resp.status ===200) {
            todo.list[index].ddl = resp.data.checkItem.ddl
        }
        this.setState({ todo })
        return resp
    }

    handleCheckCheck = async(index, id, hasDone) => {
        const resp = await mock.httpMock('/check_item/:id/put', { id: id, hasDone: !hasDone })
        const todo = this.state.todo
        if (resp.status ===200) {
            todo.list[index].hasDone = resp.data.checkItem.hasDone
        }
        this.setState({ todo })
    }

    handleCheckDelete = async(index, id, hasDone) => {
        const resp = await mock.httpMock('/check_item/:id/put', { id: id })
        const todo = this.state.todo
        if (resp.status ===200) {
            const [checkItem, checkItemList] = getUpdateItem(todo.list, id)
            todo.list.splice(checkItemList, 1)
        }
        this.setState({ todo })
    }

    render() {
        // let taskInfo = this.state.taskInfo
        // let teamInfo = this.state.teamInfo
        let actionList = this.state.actionList || []
        let moveExpanded = this.state.moveExpanded
        let copyExpanded = this.state.copyExpanded
        const _props = this.props


        return (
            <Page title={"任务详情"} className="discuss-page">

                 <div className="discuss-con page-wrap">

                     <TodoItem
                         {...this.state.todo}
                         detail = 'detail'
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
                                <form  method="post" data-remote="">
                                    <p className="title">复制任务到当前任务清单</p>
                                    <p>
                                        <input type="number" placeholder="复制数量[1~50]" min="1" max="50" name="count" id="count"/>
                                    </p>
                                        <button type="submit" className="act" data-disable-with="正在复制...">复制</button>
                                        <div type="button" className="cancel" onClick={() => {this.setState({copyExpanded: false})}}>取消</div>
                                </form>
                            </div>}
                        </div>
                        <div className={"item "+((moveExpanded)?"expanded":"")} >
                            {!moveExpanded&&<a onClick={() => {this.setState({moveExpanded: true,copyExpanded: false})}}>移动</a>}
                            {moveExpanded&&<div className="confirm">
                                <form>
                                    <p className="title">移动任务到小组</p>
                                    <div className="simple-select select-choose-projects require-select" >
                                        <select onChange={this.selectedHandle} value={this.state.teamToMove} className="select-list">
                                            <option className="default">点击选择小组</option>
                                            {this.state.teamList.map((item) => {
                                                return (
                                                    <option className="select-item" key={'team name'+ item._id} value={item.teamId}>
                                                        {item.name}
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
                                    <TopicItem key={"topic-item-" + item.id} locationTo={this.locationTo} {...item} />
                                )
                            })
                        }
                    </div>
                    
                    {/* <div className="div-line"></div> */}
                    
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


