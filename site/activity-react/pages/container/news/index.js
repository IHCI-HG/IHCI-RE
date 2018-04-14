import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'

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

        showFilter: false,


    }

    filterHandle = () => {
        this.setState({
            showFilter: !this.state.showFilter
        })
    }

    render() {
        const showList = this.state.showList
        return (
            <div className="news-page">
                

                <div className="news-list">
                <div className='news-filter' onClick={this.filterHandle}>筛选动态： 根据团队筛选 {this.state.showFilter ? '↑' : '↓'}</div>
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
                </div>
            </div>
        )
    }
}


