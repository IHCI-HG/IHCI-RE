import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

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

class AdminTeamItem extends React.PureComponent{
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

export default class News extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA);

        this.appendToShowList(this.state.newsList)
    }
    starHandle = async (id) => {
        const result = await api('/api/base/sys-time', {
            method: 'GET',
            body: {}
        })
    }

    appendToShowList = (list) => {
        let showList = this.state.showList

        list.map((item) => {
            var timeKey = timeParse(item.time)
            if(!showList[timeKey]) {
                showList.keyList.push(timeKey)
                showList[timeKey] = {}
                showList[timeKey].teamKeyList = []
            }

            if(!showList[timeKey][item.teamId]) {
                showList[timeKey].teamKeyList.push(item.teamId)
                showList[timeKey][item.teamId] = {}
                showList[timeKey][item.teamId].teamName = item.team
                showList[timeKey][item.teamId].newsList = []
            }
            showList[timeKey][item.teamId].newsList.push(item)
        })

        console.log(showList);
        this.setState({
            showList: showList
        })
    }

    typeMap = {
        'create': '创建了讨论：',
        'reply': '回复了讨论：',
    }

    state = {
        // type: create, reply
        newsList: [
            {
                newsId: 8978,
                topic: '讨论1号',
                topicId: '111',
                time: 1520481600000,
                type: 'create',
                content: '这是回复内容这是回复内容这是回复内容这是回复内容这是这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容回复内容这是回复内容这是回复内容',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                name: '阿鲁巴大将军',
                
                team: 'xx队伍2',
                teamId: '222',
            },
            {
                newsId: 2231,
                topic: '讨论1号',
                topicId: '111',
                time: 1520480600200,
                type: 'reply',
                content: '这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                name: '阿鲁巴大将军',
                
                team: 'xx队伍1',
                teamId: '111',
            },
            {
                newsId: 21331,
                topic: '讨论2号',
                topicId: '111',
                time: 1520480600000,
                type: 'reply',
                content: '这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                name: '阿鲁巴大将军',
                
                team: 'xx队伍1',
                teamId: '111',
            },
            {
                newsId: 8773,
                topic: '讨论2号',
                topicId: '111',
                time: 1510471600000,
                type: 'reply',
                content: '这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                name: '阿鲁巴大将军',
                
                team: 'xx队伍1',
                teamId: '111',
            },
        ],
        // showList的数据结构长这样
        // spampleShowList: {
        //     timeKeyList: ['20170101', '20170102'],
        //     '20170101': {
        //         'teamKeyList': ['teamId1','teamId2']                
        //         'teamId1' : {
        //             teamName: '这是团队名称111',
        //             newsList: []
        //         },
        //         'teamId2' : {
        //             teamName: '这是团队名称222',
        //             newsList: []
        //         },
        //     },
        // }
        showList: {
            keyList : [],
        },

        showTeamFilter: false,
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
        const showList = this.state.showList
        return (
            <Page className="news-page">
                
                {
                    this.state.showTeamFilter && <div className="team-list" onMouseLeave={this.teamFilterHandle}>
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
                

                <div className="news-list page-wrap">
                    <div className='news-filter' onClick={this.teamFilterHandle}>筛选动态： 根据团队筛选</div>
                    {
                        showList.keyList.map((timeKey) => {
                            return (
                                <div className="news-day" key={'time-group-' + timeKey}>
                                    {/* 时间球 */}
                                    <div className="time-ball">{timeKey[4] + timeKey[5] + '/' + timeKey[6] + timeKey[7]}</div>
                                    {
                                        showList[timeKey].teamKeyList.map((teamKey) => {
                                            return (
                                                <div key={'group-line-' + timeKey + teamKey}> 
                                                    {/* 分组线 */}
                                                    <div className="group-line">{showList[timeKey][teamKey].teamName}</div>
                                                    {
                                                        showList[timeKey][teamKey].newsList.map((item) => {
                                                            return (
                                                                <div key={'news-' + item.newsId} className='news-item-wrap'>
                                                                    {/* 动态正文 */}
                                                                    <div className="time">{formatDate(item.time, 'hh:mm')}</div>
                                                                    <img src={item.headImg} alt="" className="head-img"/>
                                                                    
                                                                    <div className="news-con">
                                                                        <div className="des-line"> 
                                                                            <span className="name">{item.name}</span>
                                                                            <span className="type">{this.typeMap[item.type]}</span>
                                                                            <span className="topic">{item.topic}</span>
                                                                        </div>

                                                                        <div className="content">{item.content}</div>
                                                                    </div>

                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    } 

                    <div className="load-more" onCli>点击加载更多</div>
                </div>

                
            </Page>
        )
    }
}


