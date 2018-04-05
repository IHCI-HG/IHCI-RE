import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';

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

export default class Team extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA);
        this.teamListInit()
    }

    // starHandle = async (id) => {
    //     const result = await api('/api/base/sys-time', {
    //         method: 'GET',
    //         body: {}
    //     })
    // }

    state = {
        showTeamFilter: false,

        teamInfo: {
            id: 1,
            name: 'xx团队1',
            teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
            desc: '这是第一个团队',
            managed: true,
            marked: true,
        },

        teamList: [
            {
                id: 1,
                name: 'xx团队1',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: true,
                marked: true,
            },
            {
                id: 2,
                name: 'xx团队2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                teamImg: 'https://developers.google.com/machine-learning/crash-course/images/landing-icon-sliders.svg?hl=zh-cn',
                desc: '这是第一个团队',
                managed: true,
                marked: false,
            },
            {
                id: 3,
                name: 'xx团队3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: true,
                marked: false,
            },
            {
                id: 4,
                name: 'xx团队4',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: false,
                marked: false,
            },
            {
                id: 5,
                name: 'xx团队5',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: false,
                marked: true,
            },
        ],

        shownTeam: [],

        topicList: [
            {
                topicId: 1,
                creater: {
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
                creater: {
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

    }

    teamListInit = () => {
        const teamList = []
        this.state.teamList.map((item) => { 
            item.active = this.props.params.id == item.id
            teamList.push(item)
        })
        this.setState({
            teamList: teamList,
            shownTeam: teamList,
        })
    }

    teamFilterHandle = () => {
        this.setState({
            showTeamFilter: !this.state.showTeamFilter
        })
    }

    searchInputHandle = (e) => {
        this.setState({
            searchInput: e.target.value
        })

        const showTeamList = []
        var partten = new RegExp(e.target.value)
        this.state.teamList.map((item) => {
            if(partten.test(item.name)) {
                showTeamList.push(item)
            }
        })
        this.setState({
            shownTeam: showTeamList
        })
    }

    render() {
        let teamInfo = this.state.teamInfo

        return (
            <div className="discuss-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >讨论</span>
                    >
                    <span onClick={this.teamFilterHandle}>{teamInfo.name} {this.state.showTeamFilter ? '↑' : '↓'} </span>
                </div>

                {
                    this.state.showTeamFilter && <div className="team-list">
                        <input type="text" className="search" onChange={this.searchInputHandle} />
                        <div className="head">星标团队</div>
                        {
                            this.state.teamList.map((item) => {
                                if (item.marked) {
                                    return (
                                        <TeamChoseItem key={'mark-team-' + item.id} {...item} />
                                    )
                                }
                            })
                        }
                        <div className="head">所有团队</div>
                        {
                            this.state.teamList.map((item) => {
                                return (
                                    <TeamChoseItem key={'team-' + item.id} {...item} />
                                )
                            })
                        }
                    </div>
                }

                <div className="discuss-con">
                    <div className="head">{teamInfo.name}</div>
                    <div className="team-des">{teamInfo.desc}</div>  

                    <div className="div-line"></div>

                    <div className="head">
                        <span className='head-title'>讨论</span> 
                        
                        <div className="create-btn">发起讨论</div>
                    </div>

                    <div className="create-area">
                        <input type="text" className="topic-name" placeholder="话题"/>
                        <textarea  className="topic-content" placeholder="说点什么"></textarea>
                        <div className="btn-con">
                            <div className="create-btn">发起讨论</div>
                            <div className="cancle">取消</div>
                        </div>
      
                    </div>

                    <div className="topic-list">
                        <div className="topic-item">
                            <img src={this.state.topicList[0].creater.headImg} alt="" className="head-img"/>
                            <div className="name">阿鲁巴大将军</div>
                            <div className="main">
                                <div className="topic-title">这是讨论标题</div>
                                <div className="topic-content">这是讨论内容 这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容</div>
                            </div>
                            <div className="time">昨天</div>
                        </div>
                        <div className="topic-item">
                            <img src={this.state.topicList[0].creater.headImg} alt="" className="head-img"/>
                            <div className="name">阿鲁巴大将军</div>
                            <div className="main">
                                <div className="topic-title">这是讨论标题</div>
                                <div className="topic-content">这是讨论内容 这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容</div>
                            </div>
                            <div className="time">昨天</div>
                        </div>
                        <div className="topic-item">
                            <img src={this.state.topicList[0].creater.headImg} alt="" className="head-img"/>
                            <div className="name">阿鲁巴大将军</div>
                            <div className="main">
                                <div className="topic-title">这是讨论标题</div>
                                <div className="topic-content">这是讨论内容 这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容</div>
                            </div>
                            <div className="time">昨天</div>
                        </div>
                        <div className="topic-item">
                            <img src={this.state.topicList[0].creater.headImg} alt="" className="head-img"/>
                            <div className="name">阿鲁巴大将军</div>
                            <div className="main">
                                <div className="topic-title">这是讨论标题</div>
                                <div className="topic-content">这是讨论内容 这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容这是讨论内容</div>
                            </div>
                            <div className="time">昨天</div>
                        </div>
                    </div>



                </div>

            </div>
        )
    }
}


