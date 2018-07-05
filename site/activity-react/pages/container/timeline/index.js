import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

const newTimeLineItemNum = 20
const moreTimeLineItemNum = 10


class TeamChoseItem extends React.PureComponent{
    render() {
        return(
            <div className="admin-team-item" onClick={() => {location.href = '/timeline?teamId=' + this.props.teamId }}>
                <img className="team-img" src={this.props.teamImg}></img>
                <div className="team-name">{this.props.teamName}</div>
            </div>
        )
    }
}


class TimelineItem extends React.PureComponent{
    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
        'DELETE_TOPIC': '删除了讨论',

        'DELETE_TOPIC_REPLY': '删除了讨论回复',

        'CREATE_TASK': '创建了任务',
        'DELETE_TASK': '删除了任务',
        'FINISH_TASK': '完成了任务',

        'REPLY_TASK': '回复了任务',
        'DELETE_TASK_REPLY': '删除了任务回复',

        'CREATE_CHECK_ITEM': '创建了检查项',
        'DELETE_CHECK_ITEM': '删除了检查项',
        'FINISH_CHECITEM_ITEM': '完成了检查项',

        'COPY_TASK': '复制了任务',
        'MOVE_TASK': '移动了任务',
        'EDIT_TOPIC': '编辑了讨论：',
        'EDIT_REPLY': '编辑了回复：',
    }

    render() {
        return(
            <div className='news-item-wrap'>
                <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                <img src={this.props.creator.headImg} alt="" className="head-img" />

                <div className="news-con">
                    <div className="des-line">
                        <span className="name">{this.props.creator.name}</span>
                        <span className="type">{this.typeMap[this.props.type]}</span>
                        <span className="topic">{this.props.content.title}</span>
                    </div>

                    <div className="content">{this.props.content.content}</div>
                </div>
            </div>
        )
            // case 'REPLY_TOPIC':
            //     return (
            //         <div className='news-item-wrap'>
            //             <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
            //             <img src={this.props.creator.headImg} alt="" className="head-img" />

            //             <div className="news-con">
            //                 <div className="des-line">
            //                     <span className="name">{this.props.creator.name}</span>
            //                     <span className="type">{this.typeMap[this.props.type]}</span>
            //                     <span className="topic">{this.props.content.title}</span>
            //                 </div>

            //                 <div className="content">{this.props.content.content}</div>
            //             </div>
            //         </div>
            //     )
            //     break;
            // default:
            //     return ''
        // }
    }
}

export default class News extends React.Component{
    componentDidMount = async() => {
        await this.loadTimelineData()
        this.initTeamList()
    }

    loadTimelineData = async () => {
        const queryTeamId = this.props.location.query.teamId
        const queryPerson = this.props.location.query.userId
        const result = await api('/api/timeline/getTimeline', {
            method: 'POST',
            body: {
                teamId: queryTeamId ? queryTeamId :'',
                userId: queryPerson ? queryPerson : '',
            }
        })
        this.setState({
            newsList: result.data,
            memberJumped: !!queryPerson ? !!queryPerson : false,
        }, () => {
            console.log(this.state.newsList)
             this.appendToShowList(this.state.newsList)
        })
        // if(result.data.length == 0){
        //     this.setState({
        //         noResult: true,
        //     })
        // }
        // if(result.data.length<newTimeLineItemNum){
        //     this.setState({
        //         noMoreResult: true
        //     })
        // }
    }

    initTeamList = () => {
        this.setState({
            shownTeam: this.props.personInfo && this.props.personInfo.teamList || [],
        })
    }
    
    getMoreTimelineData = async () => {
        const queryTeamId = this.props.location.query.teamId
        const queryPerson = this.props.location.query.userId
        const lastStamp = this.state.lastStamp

        const result = await api('/api/timeline/getTimeline', {
            method: 'POST',
            body: {
                teamId: queryTeamId ? queryTeamId :'',
                userId: queryPerson ? queryPerson : '',
                timeStamp: lastStamp? lastStamp: '',
            }
        })

        this.setState({
            newsList: result.data
        }, () => {
            this.appendToShowList(this.state.newsList)
        })
        if(result.data.length<moreTimeLineItemNum){
            this.setState({
                noMoreResult: true,
                memberJumped: !!queryPerson ? !!queryPerson : false,
            })
        }
    }

    appendToShowList = (list) => {
        let showList = this.state.showList
        var listLength = list.length
        if(listLength > 0){
            list.map((item) => {
                var timeKey = timeParse(item.create_time)
                if(!showList[timeKey]) {
                    showList.keyList.push(timeKey)
                    showList[timeKey] = {}
                    showList[timeKey].teamKeyList = []
                }
                if(!showList[timeKey][item.teamId]) {
                    showList[timeKey].teamKeyList.push(item.teamId)
                    showList[timeKey][item.teamId] = {}
                    showList[timeKey][item.teamId].teamName = item.teamName
                    showList[timeKey][item.teamId].newsList = []
                }
                showList[timeKey][item.teamId].newsList.push(item)
            })
            this.setState({
                showList: showList,
                lastStamp: list[listLength - 1].create_time
            })
        }
        else if (showList.keyList.length == 0){
            this.setState({
                noResult: true,
            })
        } else {
            this.setState({
                noMoreResult: true,
            })
        }
    }

    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
        'DELETE_TOPIC': '删除了讨论',

        'DELETE_TOPIC_REPLY': '删除了讨论回复',

        'CREATE_TASK': '创建了任务',
        'DELETE_TASK': '删除了任务',
        'FINISH_TASK': '完成了任务',

        'REPLY_TASK': '回复了任务',
        'DELETE_TASK_REPLY': '删除了任务回复',

        'CREATE_CHECK_ITEM': '创建了检查项',
        'DELETE_CHECK_ITEM': '删除了检查项',
        'FINISH_CHECITEM_ITEM': '完成了检查项',

        'COPY_TASK': '复制了任务',
        'MOVE_TASK': '移动了任务',
        'EDIT_TOPIC': '编辑了回复：',
        'EDIT_REPLY': '编辑了话题：',
    }

    state = {
        // type: create, reply
        newsList: [],
        loadMoreCount:1,
        // showList的数据结构长这样
        // showList: {
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
        teamList: [],
        noResult: false,
        noMoreResult: false,
        memberJumped: false,
    }

    loadMoreHandle = () => {
        this.setState({
            loadMoreCount:this.state.loadMoreCount+1
        },this.loadTimelineData)}

    teamFilterHandle = () => {
        this.setState({
            teamList: this.props.personInfo.teamList,
            showTeamFilter: !this.state.showTeamFilter
        })
    }

    searchInputHandle = (e) => {
        this.setState({
            searchInput: e.target.value
        })

        const teamList = []
        var partten = new RegExp(e.target.value)
        if(e.target.value) {
            this.props.personInfo.teamList.map((item) => {
                if(partten.test(item.teamName)) {
                    teamList.push(item)
                } 
            })
            this.setState({
                teamList: teamList
            })
        } else {
            this.setState({
                teamList: this.props.personInfo.teamList
            })
        }
    }

    render() {
        const showList = this.state.showList
        return (
            <Page title='动态 - IHCI' className="news-page">
                
                {
                    this.state.showTeamFilter && <div className="team-list" onMouseLeave={this.teamFilterHandle}>
                        <input type="text" className="search" onChange={this.searchInputHandle} />
                        <div className="admin-team-item" onClick={() => {location.href = '/timeline'}}>
                            <div className="team-name"> 全部团队</div>
                        </div>
                        <div className="head">星标团队</div>
                        {
                            this.state.teamList.map((item) => {
                                if (item.marked) {
                                    return (
                                        <TeamChoseItem key={'mark-team-' + item.teamId} routerTo={this.routerTo} {...item} />
                                    )
                                }
                            })
                        }
                        <div className="head">所有团队</div>
                        {
                            this.state.teamList.map((item) => {
                                return (
                                    <TeamChoseItem key={'team-' + item.teamId} routerTo={this.routerTo} {...item} />
                                )
                            })
                        }
                    </div>
                }
                

                <div className="news-list page-wrap">
                    {
                        !this.state.memberJumped && <div className='title-bar'>
                            <div className='filter-title'>
                                筛选动态:
                                <span className='team-filter'  onClick={this.teamFilterHandle}>
                                {
                                    this.props.location.query.teamId ? this.props.personInfo.teamList.map((item) => {
                                        if(item.teamId == this.props.location.query.teamId)
                                            return item.teamName
                                    }) : "根据团队"
                                }
                                </span>
                            </div>

                        </div>
                    }

                    
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
                                                            return <TimelineItem key={'timeline-' + item._id} {...item}/>
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

                    {this.state.noResult && <div className='null-info'>无动态</div>}
                    <div className='load-more-bar'>
                        {!this.state.noResult && !this.state.noQuery && !this.state.noMoreResult && <div className="load-more" onClick={this.getMoreTimelineData}>
                            点击加载更多
                        </div>}
                        {this.state.noMoreResult && <div className="no-more-result-alert">没有更多动态！</div>}
                    </div>
                </div>

                
            </Page>
        )
    }
}


