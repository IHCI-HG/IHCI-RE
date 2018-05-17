import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeBefore, sortByCreateTime } from '../../../utils/util'
import Page from '../../../components/page'

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

        const teamInfo = {}
        teamInfo._id = result.data._id 
        teamInfo.name = result.data.name
        teamInfo.teamImg = result.data.teamImg
        teamInfo.desc = result.data.teamDes


        const memberList = []
        const memberIDList = []
        result.data.memberList.map((item) => {
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
            teamInfo: teamInfo,
            memberNum: result.data.memberList.length,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
    }



    state = {
        showCreateTopic: true,

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
                content: 'ssssssssssssssss',
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
                content: 'ssssssssssssssssddddddd',
                time: 1515384000000,
            }
        ],

        memberList: [
            {
                _id: 11,
                name: '萨乌丁',
                chosen: false,
            },
        ],

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

    render() {
        let teamInfo = this.state.teamInfo

        return (
            <Page title={"团队名称xx - IHCI"} className="discuss-page">

                <div className="discuss-con page-wrap">
                    <div className="team-info">
                        <div className="left">
                            <div className="head">{teamInfo.name}</div>
                            <pre><div className="team-des">{teamInfo.desc}</div>  </pre>
                        </div>
                        <div className="right">
                            <div className="admin">
                                <div className="admin-con member-num">{this.state.memberNum}</div>
                                <span>成员</span>
                            </div>
 
                            <div className="admin">
                                <div className="admin-con iconfont icon-setup_fill"  onClick={this.toAdminHandle}></div>
                                <span>设置</span>
                            </div>
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
                                    <TopicItem locationTo={this.locationTo} {...item} />
                                )
                            })
                        }
                    </div>

                </div>

            </Page>
        )
    }
}


