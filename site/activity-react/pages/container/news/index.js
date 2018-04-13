import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse } from '../../../utils/util'

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

    state = {
        // type: create, reply
        newsList: [
            {
                newsId: 8978,
                topic: '讨论名称',
                topicId: '111',
                time: 1520481600000,
                type: 'reply',
                content: '这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容这是回复内容',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                name: '阿鲁巴大将军',
                
                team: 'xx队伍2',
                teamId: '222',
            },
            {
                newsId: 2231,
                topic: '讨论名称',
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
                topic: '讨论名称',
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
                topic: '讨论名称',
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
        
        showList: {
            keyList : [],
        },

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
    }

    render() {
        const showList = this.state.showList
        return (
            <div className="news-page">
                {
                    showList.keyList.map((timeKey) => {
                        return (
                            <div key={'time-group-' + timeKey}>
                                {/* 时间球 */}
                                <div className="title">{timeKey}</div>
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
                                                                <img src={item.headImg} alt="" className="head-img"/>
                                                                <span className="name">{item.name}</span>
                                                                <span className="type">{item.type}</span>
                                                                <span className="topic">{item.topic}</span>
                                                                <div className="content">{item.content}</div>
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
        )
    }
}


