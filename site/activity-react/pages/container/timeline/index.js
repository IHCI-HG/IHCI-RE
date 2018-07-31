import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate, createMarkup } from '../../../utils/util'
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

    toOriginHandle = () => {

        var pathname = ''
        var type = 'TOPIC'

        switch(this.props.type){
            case 'CREATE_TOPIC':
            case 'EDIT_TOPIC':
            {
                pathname = '/discuss/topic/' + this.props.content._id
                break
            }
            case 'REPLY_TOPIC':
            case 'EDIT_REPLY':
            {
                pathname = '/discuss/topic/' + this.props.content.topicId
                type = 'REPLY'
                break
            }
            case 'CREATE_TASK':
            case 'CREATE_CHECK_ITEM':
            case 'COPY_TASK':
            case 'MOVE_TASK':
            {
                type = 'TASK'
                pathname = '/todo/' + this.props.tarId
                break
            }
            case 'FOLDER':
            case 'FILE':
            {
                type = 'FILE'
                pathname = '/files/' + this.props.team
                break
            }
            default:
                

        }

        const location = {
            pathname: pathname,
            state:{
                type: type,
                id: this.props.tarId
            },
            query:this.props.folderName? {
                dir: this.props.path
            }
            :this.props.dir ?{
                 dir: this.props.dir,
            } :{}
        }
        this.props.router.push(location)
    }


    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
        'DELETE_TOPIC': '删除了讨论：',

        'DELETE_TOPIC_REPLY': '删除了讨论回复：',

        'CREATE_TASK': '创建了任务：',
        'DELETE_TASK': '删除了任务：',
        'FINISH_TASK': '完成了任务：',

        'REPLY_TASK': '回复了任务：',
        'DELETE_TASK_REPLY': '删除了任务回复：',

        'CREATE_CHECK_ITEM': '创建了检查项：',
        'DELETE_CHECK_ITEM': '删除了检查项',
        'FINISH_CHECITEM_ITEM': '完成了检查项',

        'COPY_TASK': '复制了任务：',
        'MOVE_TASK': '移动了任务：',
        'EDIT_TOPIC': '编辑了回复：',
        'EDIT_REPLY': '编辑了话题：',
        'CREATE_TASKLIST':'创建了清单：',
        'DELETE_TASKLIST':'删除了清单：',

        'CHANGE_TASK_HEADER':'更改了任务',
        'CHANGE_CHECKITEM_HEADER':'更改了检查项',
        'CHANGE_TASK_DDL':'更改了任务',
        'CHANGE_CHECKITEM_DDL':'更改了检查项',
        'REOPEN_TASK':'重新打开了任务：',
        'REOPEN_CHECKITEM':'重新打开了检查项：',
        'EDIT_TASK':'编辑了任务：',
        'EDIT_CHECK_ITEM':'编辑了检查项：',
    }
    componentDidMount = () =>{
        if(this.props.content.header){
            this.getUserName(this.props.content.header)
        }
        else(this.setState({headerName:"未指派"}))
    }
    getUserName = async(id) => {
        const result = await api('/api/getUserInfo', {
            method: 'POST',
            body: {
                userId: id,
            }
        })
        
        if(result.state.code === 0){
            this.setState({
                headerName: result.data.personInfo.name
            })
        }
    }
    state = {
        headerName:""
    }
    render() {
        switch(this.props.type){
            case 'CHANGE_TASK_DDL': 
                return(
                    <div className='news-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="news-con">
                            <div className="des-line">
                                <span className="name">{this.props.creator.name}</span>
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">&nbsp; {this.props.content.title}&nbsp; 的完成时间为&nbsp; </span>
                                <span className="content">{this.props.content.deadline}</span>
                            </div>

                        </div>
                    </div>
                )
            case 'CHANGE_CHECKITEM_DDL':
                return(
                    <div className='news-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="news-con">
                            <div className="des-line">
                                <span className="name">{this.props.creator.name}</span>
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">&nbsp; {this.props.content.content}&nbsp; 的完成时间为&nbsp; </span>
                                <span className="content">{this.props.content.deadline}</span>
                            </div>

                        </div>
                    </div>
                )
            case 'CHANGE_TASK_HEADER': 
                return(
                    <div className='news-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="news-con">
                            <div className="des-line">
                                <span className="name">{this.props.creator.name}</span>
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">&nbsp; {this.props.content.title} &nbsp;的指派人: &nbsp;</span>
                                <span className="content">{this.state.headerName}</span>
                            </div>
                        </div>
                    </div>
                )
            case 'CHANGE_CHECKITEM_HEADER':
                return(
                    <div className='news-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="news-con">
                            <div className="des-line">
                                <span className="name">{this.props.creator.name}</span>
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">&nbsp; {this.props.content.content} &nbsp;的指派人: &nbsp;</span>
                                <span className="content">{this.state.headerName}</span>
                            </div>
                        </div>
                    </div>
                )
            case 'CREATE_TASKLIST': case 'DELETE_TASKLIST':
                return(
                    <div className='news-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />
        
                        <div className="news-con">
                            <div className="des-line">
                                <span className="name">{this.props.creator.name}</span>
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.title}</span>
                            </div>
                            <div className="BraftEditor-container">
                                    <span className="content public-DraftEditor-content BraftEditor-content" dangerouslySetInnerHTML={{__html: this.props.content.content}}>{}</span>
                                </div>
                        </div>
                    </div>
                )
            default:
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
                            <div className="BraftEditor-container">
                                    <span className="content public-DraftEditor-content BraftEditor-content" dangerouslySetInnerHTML={{__html: this.props.content.content}}>{}</span>
                            </div>
                        </div>
                    </div>
                )
        }
    }
}

export default class Timeline extends React.Component{
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
                                                            return <TimelineItem key={'timeline-' + item._id} router={this.props.router}  {...item}/>
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
