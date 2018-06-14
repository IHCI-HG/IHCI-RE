import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeBefore, sortByCreateTime, timeParse } from '../../../utils/util'
import Page from '../../../components/page'
import TodoItem from './todoItem'

import MemberChosenList from '../../../components/member-chose-list'

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
                <div className="imgInfo">
                    <img src={this.props.creator.headImg} alt="" className="head-img" />
                </div>
                <div className="info">
                    <div className="send">
                        <div className="name">{this.props.creator.name}</div>
                        <div className="time">{timeBefore(this.props.create_time)}</div>
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
        this.teamId = this.props.params.id
        this.initTeamInfo()
    }

    locationTo = (url) => {
        this.props.router.push(url)
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
        result.data.memberList.map((item) => {
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
            memberNum: result.data.memberList.length,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
    }



    state = {
        showCreateTopic: false,
        isCreator: false,
        showButton:true,
        moveExpanded:false,
        copyExpanded:false,
        createTopicName: '',
        createTopicContent: '',
        memberNum: 0,

        teamInfo: {
            _id: 1,
            name: 'IHCI平台搭建项目组',
            teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
            desc: '完成IHCI平台搭建',
            managed: true,
        },
        actionList:[
            {
                creator: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                }, 
                icon:"icon-success_fill",
                success:true,
                time: 1515384000000,
                action:"完成了",
                task:"任务一"
            },
            {
                creator: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                },
                icon:"icon-addition_fill",
                success:false,
                time: 1515384000000,
                action:"添加了",
                task:"任务二"
            },
            {
                creator: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                },
                icon:"icon-enterinto_fill",
                success:false,
                time: 1515384000000,
                action:"重新打开了",
                task:"任务二"
            },
        ],
        topicList: [
            {
                topicId: 1,
                creator: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                },
                name: '这是一条讨论的name1',
                content: '嘻嘻嘻嘻嘻',
                time: 1515384000000,
            },{
                topicId: 2,
                creator: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                },
                name: '这是一条讨论的name2',
                // title:'hahah',
                content: '哈哈哈哈哈',
                time: 1515384000000,
            }
        ],
        user:{
            headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
        },
        memberList: [
            {
                _id: 11,
                name: '萨乌丁',
                chosen: false,
            },
        ],
        todo: {
            id: 1,
            desc: '分析tower系统功能',
            name: '使用tower',
            hasDone: true,
            ddl: '2010-1-1',
            assignee:{
                id: 1,
                username: '黄',
                avator: '',
            },
            checkItemList:[
                {
                    id: 1,
                    hasDone:false,
                    content: '试用tower',
                    assignee: {
                        id: 1,
                        username: '黄',
                        avator: '',
                    }
                }
            ]
        }
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

    loadmore = () => {

    }
    handleTodoCheck = (id) => {
        console.log('handleTodoCheck', id)
        this.state.todo.hasDone = !this.state.todo.hasDone
        this.setState({ todo: this.state.todo })
    }

    handleTodoModify(id, todoInfo) {
        console.log('index', id, todoInfo)
        // 发请求,获取结果
        // 如果成功,更新
    }

    handleAssigneeChange = (e) => {
        console.log('handleAssigneeChange', e.target.value);
        // 直接调用接口改变指派用户
    }

    handleDateChange = (e) => {
        console.log('handleDateChange', e.target.value);
    }

    render() {
        let taskInfo = this.state.taskInfo
        let teamInfo = this.state.teamInfo
        let actionList = this.state.actionList
        let moveExpanded = this.state.moveExpanded
        let copyExpanded = this.state.copyExpanded
        return (
            <Page title={"任务详情"} className="discuss-page">

                 <div className="discuss-con page-wrap">

                     <TodoItem
                         {...this.state.todo}
                         memberList={this.state.memberList}
                         handleAssigneeChange={this.handleAssigneeChange}
                         handleDateChange={this.handleDateChange}
                         handleTodoModify={this.handleTodoModify.bind(this,this.state.todo.id )}
                         handleTodoCheck={this.handleTodoCheck.bind(this, this.state.todo.id)} />
                    <div className="detail-actions">
                        <div className={"item "+((moveExpanded)?"expanded":"")}>
                            {!moveExpanded&&<a onClick={() => {this.setState({moveExpanded: true,copyExpanded: false})}}>移动</a>}
                            {moveExpanded&&<div className="confirm">
                                <form method="post" data-remote="">
                                    <p className="title">移动任务到项目</p>
                                    <p>
                                        <div className="simple-select select-choose-projects require-select">
                                            <input type="text" className="select-result" autocomplete="off" placeholder="点击选择项目"/>
                                            <span className="link-expand" title="所有选项">
                                                <i className="iconfont icon-unfold"></i>
                                            </span>
                                            <span className="link-clear" title="清除选择">
                                                <i className="iconfont icon-close"></i>
                                            </span>

                                        </div>
                                    </p>
                                    <p>
                                        <button type="submit" className="act" data-disable-with="正在移动...">移动</button>
                                        <div type="button" className="cancel" onClick={() => {this.setState({moveExpanded: false})}}>取消</div>
                                    </p>
                                    </form>
                            </div>}
                        </div>
                        <div className={"item "+((copyExpanded)?"expanded":"")}>
                            {!copyExpanded&&<a onClick={() => {this.setState({copyExpanded: true,moveExpanded: false})}}>复制</a>}
                            {copyExpanded&&<div className="confirm">
                                <form  method="post" data-remote="">
                                    <p className="title">复制任务到当前任务清单</p>
                                    <p>
                                        <input type="number" placeholder="复制数量[1~50]" min="1" max="50" name="count" id="count"/>
                                    </p>
                                    <p>
                                        <button type="submit" className="act" data-disable-with="正在复制...">复制</button>
                                        <div type="button" className="cancel" onClick={() => {this.setState({copyExpanded: false})}}>取消</div>
                                    </p>
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
                                    <div className={"action "+((item.success)?" success":"")}>{timeBefore(item.time)} {item.creator.name} {item.action}{item.task} </div>
                                </div>
                            )
                        })
                    }
                    </div>
                    
                    <div className="topic-list">
                        {
                            this.state.topicList.map((item) => {
                                return (
                                    <TopicItem locationTo={this.locationTo} {...item} />
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
                                    {/* <input type="text" className="topic-name" onChange={this.topicNameInputHandle} value={this.state.createTopicName} placeholder="话题" /> */}
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
                        {/* <div className="create-btn" onClick={() => {this.setState({showCreateTopic: true})}}>发起讨论</div> */}
                    </div>
                    

                    

                </div>

            </Page>
        )
    }
}


