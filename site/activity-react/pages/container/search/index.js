import PropTypes from 'prop-types'
import * as React from 'react';
import './style.scss'


import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

// function jumpHandle(text, teamId, type){
//     console.log((text, teamId, type))
    
// }

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
        'RELEASE_TASK': '任务',
    }

    render() {
        switch (this.props.type) {
            case 'CREATE_TOPIC':
                return(
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="result-con">
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.content.title}</span>
                            </div>
                            <div className="content">
                                <span className="name">{this.props.creator.name}</span>-
                                <span className="content">{this.props.content.content}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            case 'REPLY_TOPIC':
                return (
                    <div className='search-result-item-wrap'>
                        <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
                        <img src={this.props.creator.headImg} alt="" className="head-img" />

                        <div className="result-con">
                            <div className="des-line">
                                <span className="type">{this.typeMap[this.props.type]}</span>
                                <span className="topic">{this.props.content.title}</span>
                            </div>

                            <div className="content">
                                <span className="name">{this.props.creator.name}</span>-
                                <span className="content">{this.props.content.content}</span>
                            </div>
                        </div>
                    </div>
                )
                break;
            // case 'UPLOAD_FILE':
            //     return (
            //         <div className='search-result-item-wrap'>
            //             <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
            //             <img src={this.props.creator.headImg} alt="" className="file-catagory-img" />

            //             <div className="result-con">
            //                 <div className="des-line">
            //                     <span className="type">{this.typeMap[this.props.type]}</span>
            //                     <span className="topic">{this.props.content.title}</span>
            //                 </div>

            //                 <div className="content">
            //                     <span className="name">{this.props.creator.name}</span>-
            //                     <span className="content">{this.props.content.content}</span>
            //                 </div>
            //             </div>
            //         </div>
            //     )
            //     break;
            // case 'RELEASE_TASK':
            //     return(
            //         <div className='search-result-item-wrap'>
            //             <div className="time">{formatDate(this.props.create_time, 'hh:mm')}</div>
            //             <img src={this.props.creator.headImg} alt="" className="head-img" />

            //             <div className="result-con">
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
            default:
                return ''
        }
    }
}

export default class SearchResult extends React.Component{
    componentDidMount = async() => {
        const queryText = this.props.location.query.text
        if (queryText){
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
        const queryText = this.props.location.query.text
        const queryTeamId = this.props.location.query.teamId
        const queryType = this.props.location.query.type
        const result = await api('/api/search', {
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

    initTeamList = () => {
        this.setState({
            shownTeam: this.props.personInfo && this.props.personInfo.teamList || [],
        })
    }

    appendToShowList = (list) => {
        let showList = this.state.showList
        // console.log(list)
        if(list.length > 0){
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
                showList: showList
            })
        }
        else{
            this.setState({
                noResult: true,
            })
        }
        
    }

    filterHandle = (params) =>{
        const queryText = this.props.location.query.text
        const queryTeamId = this.props.location.query.teamId
        const queryType = this.props.location.query.type

        const teamId = params.teamId
        const type = params.type
        // console.log(type == '')
        // console.log(!(typeof(type) == 'undefined'))
        const path = '/search?text=' + queryText
        path += (!(typeof(teamId) == 'undefined')) ? (teamId == '' ? '': ('&teamId=' + teamId)) : (queryTeamId ? ('&teamId=' + queryTeamId) :'')
        path += (!(typeof(type) == 'undefined')) ? (type == '' ? '': ('&type=' + type)) : (queryType ? ('&type=' + queryType) :'')
        // console.log(params)
        // console.log(path)
        location.href = path
    }

    typeMap = {
        'CREATE_TOPIC': '讨论',
        'REPLY_TOPIC': '回复',
        'UPLOAD_FILE': '文件',
        'RELEASE_TASK': '任务',
    }

    state = {
        // type: create, reply
        resultList: [],

        // showList的数据结构长这样
        // showList: {
        //     timeKeyList: ['20170101', '20170102'],
        //     '20170101': {
        //         'teamKeyList': ['teamId1','teamId2']                
        //         'teamId1' : {
        //             teamName: '这是团队名称111',
        //             resultList: []
        //         },
        //         'teamId2' : {
        //             teamName: '这是团队名称222',
        //             resultList: []
        //         },
        //     },
        // }
        showList: {
            keyList : [],
        },

        showTeamFilter: false,
        showTypeFilter: false,
        teamList: [],
        searchParams: {}
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
            <Page title='搜索 - IHCI'  className="result-page">
                
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
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'CREATE_TOPIC'})}>
                            <div className='type-name'>{this.typeMap.CREATE_TOPIC}</div>
                        </div>
                        <div className="admin-type-item" onClick={this.filterHandle.bind(this, {type:'REPLY_TOPIC'})}>
                            <div className='type-name'>{this.typeMap.REPLY_TOPIC}</div>
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
                                                            return <SearchResultItem key={'search-' + item._id} {...item}/>
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
                    {!this.state.noResult && !this.state.noQuery &&<div className="load-more" onClick={() => {}}>点击加载更多</div>}
                </div>

            </Page>
        )
    }
}
