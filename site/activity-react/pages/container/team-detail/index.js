import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'

import MemberChosenList from '../../../components/member-chose-list'
import TodoItem from './todoItem'
import EditTodo from './editTodo'

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

export default class Team extends React.Component{
    state = {
        showCreateTopic: false,
        showCreateTodo: false,
        isCreator: false,

        createTopicName: '', //
        createTopicContent: '', //

        teamInfo: {}, //
        topicList: [], //
        memberList: [], //
        todoList: [
            {
                id: 1,
                content: '了解tower',
                hasDone: true,
                ddl: '2018.7.7',
                assignee: {
                    _id: 1,
                    username: '黄',
                },
                checkItem: [{
                    id: 1,
                    hasDone: true,
                    content: '子检查项'
                }, {
                    id: 2,
                    hasDone: false,
                    content: '子检查项2'
                }, {
                    id: 3,
                    hasDone: false,
                    content: '子检查项3'
                }]
            }, {
                id: 2,
                content: '了解tower',
                hasDone: true,
                assignee: null,
                checkItem: [],
            }, {
                id: 3,
                content: '了解tower',
                hasDone: false,
                assignee: null,
                checkItem: null,
            },
        ]
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
    }

    locationTo = (url) => {
        this.props.router.push(url)
    }
    //
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
    //
    topicNameInputHandle = (e) => {
        this.setState({
            createTopicName: e.target.value
        })
    }
    //
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

    handleTodoCheck = (id) => {
        console.log('handleTodoCheck', id)
        const todoList = this.state.todoList.slice()
        todoList.forEach((item) => {
            if(item.id === id) {
                item.hasDone = !item.hasDone
            }
        })
        this.setState({ todoList })
    }

    handleTodoCreate(todoInfo) {
        // 发请求,结果
        const result = {
                id: 4,
                content: '了解tower',
                hasDone: false,
                assignee: null,
                checkItem: null,
            }
        // 如果成功,将返回值push进todoList中
        const todoList = [...this.state.todoList, result]
        this.setState({todoList})
    }

    handleTodoModify(todoInfo) {
        // 发请求,结果
        const result = {
            id: 4,
            content: '了解tower',
            hasDone: false,
            assignee: null,
            checkItem: null,
        }
        // 如果成功,更新
        const todoList = [...this.state.todoList, result]
        this.setState({todoList})
    }

    closeDialog = () => {
        console.log('closeDialog')
        this.setState({showCreateTodo: false})
    }


    render() {
        let teamInfo = this.state.teamInfo
        const doneList = this.state.todoList.filter((item) => {
            return item.hasDone === true
        })
        const todoList = this.state.todoList.filter((item) => {
            return item.hasDone === false
        })

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
                <div className="todo-board"
                     // onClick={this.closeDialog}
                >
                    <div className="head">
                        <span className='head-title'>任务</span>
                        <div className="create-btn"
                             onClick={(e) => {
                                 this.setState({showCreateTodo: true})
                                 e.stopPropagation()
                             }}>添加任务</div>
                    </div>

                    <div className="todo-list">
                        {
                            todoList.map((item) => {
                                return (
                                    <TodoItem
                                        {...item}
                                        key={item.id}
                                        handleTodoCheck={this.handleTodoCheck.bind(this, item.id)} />
                                )
                            })
                        }
                    </div>
                    {
                        this.state.showCreateTodo &&
                        <EditTodo
                            handleCreate={this.handleTodoCreate.bind(this)}
                            memberList={this.state.memberList}
                            handleClose={(() => {this.setState({showCreateTodo: false})}).bind(this)}>
                        </EditTodo>
                    }
                    <div className="todo-list">
                        {
                            doneList.map((item) => {
                                return (
                                    <TodoItem
                                        {...item}
                                        key={item.id}
                                        handleTodoCheck={this.handleTodoCheck.bind(this, item.id)} />
                                )
                            })
                        }
                    </div>
                </div>
            </Page>
        )
    }
}


