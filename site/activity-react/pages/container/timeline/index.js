import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'


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
    }

    render() {
        switch (this.props.type) {
            case 'CREATE_TOPIC':
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
            case 'REPLY_TOPIC':
                return (
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
                break;
            default:
                return ''
        }
    }
}

export default class News extends React.Component{
    componentDidMount = async() => {
        await this.initTimelineData()
        this.initTeamList()
    }

    initTimelineData = async () => {
        const queryTeamId = this.props.location.query.teamId
        const queryUserId = this.props.location.query.userId
        const result = await api('/api/timeline/getTimeline', {
            method: 'POST',
            body: queryTeamId||queryUserId ? {
                teamId: queryTeamId,
                userId: queryUserId
            } : {}
        })
        this.setState({
            newsList: result.data
        }, () => {
            this.appendToShowList(this.state.newsList)
        })
        if(queryUserId){
            this.setState({
                showFilter: false
            })
        }
        if(result.data.length<20){
            this.setState({
                showmore: false
            })
        }
    }

    initTeamList = () => {
        this.setState({
            shownTeam: this.props.personInfo && this.props.personInfo.teamList || [],
        })
    }

    getMoreTimeLine = async () => {
        const queryTeamId = this.props.location.query.teamId
        const queryUserId = this.props.location.query.userId
        const result = await api('/api/timeline/getTimeline', {
            method: 'POST',
            body: queryTeamId||queryUserId ? {
                teamId: queryTeamId,
                userId: queryUserId,
                timeStamp: this.state.newsList[this.state.newsList.length-1].create_time
            } : {timeStamp: this.state.newsList[this.state.newsList.length-1].create_time}
        })
        this.setState({
            newsList: result.data
        }, () => {
            this.appendToShowList(this.state.newsList)
        })
        if(queryUserId){
            this.setState({
                showFilter: false
            })
        }
        if(result.data.length<10){
            this.setState({
                showmore: false
            })
        }
    }
    appendToShowList = (list) => {
        let showList = this.state.showList

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

        console.log(showList);
        this.setState({
            showList: showList
        })
    }

    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
    }

    state = {
        // type: create, reply
        newsList: [],

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
        showFilter: true,
        showTeamFilter: false,
        teamList: [],
        showmore: true,
    }


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

    // routerTo = (url) => {
    //     this.props.router.push(url)
    //     // await this.componentDidMount()
    //     // this.render()
    // }

    render() {
        const showList = this.state.showList
        return (
            <Page className="news-page">
                
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
                    this.state.showFilter&&<div className='news-filter' onClick={this.teamFilterHandle}>
                        筛选动态： {
                            this.props.location.query.teamId ? this.props.personInfo.teamList.map((item) => {
                                if(item.teamId == this.props.location.query.teamId)
                                    return item.teamName
                            }) : "根据团队"
                        }
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

                  {this.state.showmore&&<div className="load-more" onClick={this.getMoreTimeLine}>点击加载更多</div>}  
                </div>

                
            </Page>
        )
    }
}


