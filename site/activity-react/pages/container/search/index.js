import PropTypes from 'prop-types'
import * as React from 'react';
import './style.scss'


import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

const newSearchItemNum = 20
const moreSearchItemNum = 10


class TeamChoseItem extends React.PureComponent{
    doJump = () => {
        this.props.filterHandle({teamId:this.props.teamId})
    }

    render() {
        return(
            <div className="admin-team-item" onClick={this.doJump}>
                <img className="team-img" src={this.props.teamImg}></img>
                <div className="team-name">{this.props.teamName}</div>
            </div>
        )
    }
}


class SearchResultItem extends React.PureComponent{

    typeMap = {
        'CREATE_TOPIC': '讨论：',
        'REPLY_TOPIC': '回复：',
        'UPLOAD_FILE': '文件：',
        'EDIT_REPLY': '编辑回复：',
        'EDIT_TOPIC': '编辑讨论：',

        'FINISH_TASK': '完成了任务：',
        'CREATE_TASK': '创建了任务：',
        
        'DELETE_TOPIC_REPLY': '删除了讨论回复：',

        'CREATE_TASK': '创建了任务：',
        'DELETE_TASK': '删除了任务：',

        'REPLY_TASK': '回复了任务：',
        'DELETE_TASK_REPLY': '删除了任务回复：',

        'CREATE_CHECK_ITEM': '创建了检查项：',
        'DELETE_CHECK_ITEM': '删除了检查项：',
        'FINISH_CHECITEM_ITEM': '完成了检查项：',

        'COPY_TASK': '复制了任务：',
        'MOVE_TASK': '移动了任务：',
        'FILE': '文件：',
        'FOLDER': '文件夹：',
    }

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

    render() {
        console.log(this)
        switch (this.props.type) {
            case 'CREATE_TOPIC':
            case 'REPLY_TOPIC':
            case 'EDIT_REPLY':
            case 'EDIT_TOPIC':
                return(
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="result-con" onClick={this.toOriginHandle}>
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.content.title}</span>
                            </div>
                            <div className="content">
                                <span className="name">{this.props.creator.name}</span>-
                                <span className="content" dangerouslySetInnerHTML={{__html: this.props.content.content}}>{}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            case 'CREATE_TASK':
            case 'CREATE_CHECK_ITEM':
            case 'COPY_TASK':
            case 'MOVE_TASK':
                return(
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="result-con" onClick={this.toOriginHandle}>
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.content.title}</span>
                            </div>
                            <div className="content">
                                <span className="name">{this.props.creator.name}</span>-
                                <span className="content" dangerouslySetInnerHTML={{__html: this.props.content.content}}>{}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            case 'FILE':
                return (
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <div className="icon iconfont icon-document head-img" />

                        <div className="result-con" onClick={this.toOriginHandle}>
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.fileName}</span>
                            </div>
                            <div className="content">
                                <span className="name">所在目录</span>-
                                <span className="content" >{this.props.dir}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            case 'FOLDER':
                return (
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <div className="icon iconfont icon-tasklist head-img" />

                        <div className="result-con" onClick={this.toOriginHandle}>
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.folderName}</span>
                            </div>
                            <div className="content">
                                <span className="name">所在目录</span>-
                                <span className="content" >{this.props.dir}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            default:
                return ''
        }
    }
}

export default class SearchResult extends React.Component{
    componentDidMount = async() => {
        var queryText = this.props.location.query.text

        if (queryText){
            // console.log(queryText.length)
            // console.log(queryText.length >42)
            
            if (queryText.length > 42)
                this.props.location.query.text = queryText.substring(0,42)

            this.setState({
                title: '搜索 - ' + this.props.location.query.text + ' - IHCI'
            })
            await this.initSearchResultData()
        }
        else {
            this.setState({
                noQuery: true
            })
        }
        this.initTeamList()
    }

    initSearchResultData = async () => {
        var queryText = this.props.location.query.text
        var queryTeamId = this.props.location.query.teamId
        var queryType = this.props.location.query.type
        var result = await api('/api/search', {
            method: 'POST',
            body: {
                keyWord: queryText ? queryText : '',
                teamId: queryTeamId ? queryTeamId :'',
                type: queryType ? queryType : '',
            }
        })
        this.setState({
            resultList: result.data
        }, () => {
            this.appendToShowList(this.state.resultList)
        })
    }

    getMoreSearchResultData = async () => {
        var queryText = this.props.location.query.text
        var queryTeamId = this.props.location.query.teamId
        var queryType = this.props.location.query.type
        var lastStamp = this.state.lastStamp
        var result = await api('/api/search', {
            method: 'POST',
            body: {
                keyWord: queryText ? queryText : '',
                teamId: queryTeamId ? queryTeamId :'',
                type: queryType ? queryType : '',
                timeStamp: lastStamp? lastStamp: '',
            }
        })
        this.setState({
            resultList: result.data
        }, () => {
            this.appendToShowList(this.state.resultList)
        })
    }

    initTeamList = () => {
        this.setState({
            shownTeam: this.props.personInfo && this.props.personInfo.teamList || [],
        })
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
                    showList[timeKey][item.teamId].resultList = []
                }
                showList[timeKey][item.teamId].resultList.push(item)
            })
            this.setState({
                showList: showList,
                lastStamp: list[listLength - 1].create_time
            })
        }
        else{ 
        if (showList.keyList.length == 0){
                this.setState({
                    noResult: true,
                })
            } else {
                this.setState({
                    noMoreResult: true,
                })
            }
        }

    }

    filterHandle = (params) =>{
        var queryText = this.props.location.query.text
        var queryTeamId = this.props.location.query.teamId
        var queryType = this.props.location.query.type
        var teamId = params.teamId
        var type = params.type
        var path = '/search?text=' + queryText

        path += (!(typeof(teamId) == 'undefined')) ? (teamId == '' ? '': ('&teamId=' + teamId)) : (queryTeamId ? ('&teamId=' + queryTeamId) :'')
        path += (!(typeof(type) == 'undefined')) ? (type == '' ? '': ('&type=' + type)) : (queryType ? ('&type=' + queryType) :'')
        location.href = path
    
    }

    typeMap = {
        'CREATE_TOPIC': '讨论',
        'REPLY_TOPIC': '回复',
        'UPLOAD_FILE': '文件',
        'RELEASE_TASK': '任务',
        'TOPIC': '讨论',
        'REPLY': '回复',
        'TASK': '任务',
        'FILE': '文件',
    }

    state = {
        title: '搜索 - IHCI',
        resultList: [],
        showList: {
            keyList : [],
        },

        showTeamFilter: false,
        showTypeFilter: false,
        teamList: [],
        searchParams: {},
        lastStamp : '',
        noResult: false,
        noMoreResult: false,
    }


    teamFilterHandle = () => {
        this.setState({
            teamList: this.props.personInfo.teamList,
            showTeamFilter: !this.state.showTeamFilter
        })
    }

    typeFilterHandle = () => {
        this.setState({
            showTypeFilter: !this.state.showTypeFilter
        })
    }


    searchInputHandle = (e) => {
        this.setState({
            searchInput: e.target.value
        })

        var teamList = []
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
        var showList = this.state.showList
        return (
            <Page title={this.state.title}  className="result-page">
                
                {
                    this.state.showTeamFilter && <div className="team-list" onMouseLeave={this.teamFilterHandle}>
                        <input type="text" className="search" onChange={this.searchInputHandle} />
                        <div className="admin-team-item" onClick={this.filterHandle.bind(this, {teamId:''})}>
                            <div className="team-name"> 全部团队</div>
                        </div>
                        <div className="head">星标团队</div>
                        {
                            this.state.teamList.map((item) => {
                                if (item.marked) {
                                    return (
                                        <TeamChoseItem key={'mark-team-' + item.teamId} filterHandle={this.filterHandle} text={this.props.location.query.text} teamId={item.teamId} {...item} />
                                    )
                                }
                            })
                        }
                        <div className="head">所有团队</div>
                        {
                            this.state.teamList.map((item) => {
                                return (
                                    <TeamChoseItem key={'team-' + item.teamId} filterHandle={this.filterHandle} text={this.props.location.query.text} teamId={item.teamId} {...item} />
                                )
                            })
                        }
                    </div>
                }
                {
                    this.state.showTypeFilter && <div className="type-list" onMouseLeave={this.typeFilterHandle}>
                        {/* <input type="text" className="search" onChange={this.searchInputHandle} /> */}
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:''})}>
                            <div className="type-name"> 全部类型</div>
                        </div>
                        <div className="head">类型</div>
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'TOPIC'})}>
                            <div className='type-name'>{this.typeMap.CREATE_TOPIC}</div>
                        </div>
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'REPLY'})}>
                            <div className='type-name'>{this.typeMap.REPLY_TOPIC}</div>
                        </div>
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'TASK'})}>
                            <div className='type-name'>{this.typeMap.TASK}</div>
                        </div>
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'FILE'})}>
                            <div className='type-name'>{this.typeMap.FILE}</div>
                        </div>
                    </div>
                }
                

                <div className="result-list page-wrap">
                    <div className='title-bar'>
                        {this.state.noQuery && <div className='request-search-text'>请输入搜索关键词！</div>}
                        {!this.state.noQuery && <div className='left'>
                            <div className='search-title'>
                                搜索：{this.props.location.query.text}
                            </div>
                        </div>}
                        {!this.state.noQuery && <div className='right'>
                            <div className='filter-title'>
                                筛选结果:
                            </div>
                            <div className='team-filter' onClick={this.teamFilterHandle}>
                                {
                                    this.props.location.query.teamId ? this.props.personInfo.teamList.map((item) => {
                                        if(item.teamId == this.props.location.query.teamId)
                                            return item.teamName
                                    }) : "根据团队"
                                }
                            </div>
                            <div className='type-filter' onClick={this.typeFilterHandle}>
                                {
                                    this.props.location.query.type ? this.typeMap[this.props.location.query.type]
                                    : "根据类型"
                                }
                            </div>
                        </div>}
                    </div>
                    {
                        showList.keyList.map((timeKey) => {
                            return (
                                <div className="result-day" key={'time-group-' + timeKey}>
                                    {/* 时间球 */}
                                    <div className="time-ball">{timeKey[4] + timeKey[5] + '/' + timeKey[6] + timeKey[7]}</div>
                                    {
                                        showList[timeKey].teamKeyList.map((teamKey) => {
                                            return (
                                                <div key={'group-line-' + timeKey + teamKey}> 
                                                    {/* 分组线 */}
                                                    <div className="group-line">{showList[timeKey][teamKey].teamName}</div>
                                                    {
                                                        showList[timeKey][teamKey].resultList.map((item) => {
                                                            return <SearchResultItem key={'search-' + item._id} router={this.props.router} {...item}/>
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
                    {this.state.noResult && <div className='null-info'>无结果</div>}
                    <div className='load-more-bar'>
                        {!this.state.noResult && !this.state.noQuery && !this.state.noMoreResult && <div className="load-more" onClick={this.getMoreSearchResultData}>
                            点击加载更多
                        </div>}
                        {this.state.noMoreResult && <div className="no-more-result-alert">没有更多结果！</div>}
                    </div>

                   
                </div>

            </Page>
        )
    }
}
