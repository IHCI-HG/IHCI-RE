import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';
import { timeBefore } from '../../../utils/util'

import MemberChosenList from '../../../components/member-chose-list'

class TopicDiscussItem extends React.Component {
    componentDidMount = () => {
        this.setState({
            content: this.props.content
        })
    }

    state = {
        content: '',
        editState: false,
    }

    editInputHandle = (e) => {
        this.setState({
            content: e.target.value
        })
    }

    render() {
        const {
            _id,
            creator,
            content,
            create_time,

            delHandle,
            saveEditHandle,
            allowEdit,

        } = this.props

        return (
            <div id={this.props.id}>
                {
                    this.state.editState ? <div className="topic-subject-edit">
                        <textarea className='discuss-content' value={this.state.content} onChange={this.editInputHandle}></textarea>

                        <div className="button-warp">
                            <div className="save-btn" onClick={() => { saveEditHandle(_id, this.state.content); this.setState({ editState: false }) }}>保存</div>
                            <div className="cancel-btn" onClick={() => { this.setState({ editState: false }) }}>取消</div>
                        </div>
                    </div>
                        :
                        <div className="topic-subject-con discuss-con">
                            <div className="flex">
                                <img className="head-img" src={creator.headImg}></img>
                                <div className="topic-main">
                                    <div className="head-wrap">
                                        <div className="left">
                                            <span className="name">{creator.name}</span>
                                            <span className="time">{timeBefore(create_time)}</span>
                                        </div>
                                        {
                                            allowEdit && <div className="right">
                                                <span className="edit" onClick={() => { this.setState({ editState: true }) }}>编辑</span>
                                                {/* <span className="edit">删除</span> */}
                                            </div>
                                        }
                                    </div>
                                    <div className="content"><pre>{content}</pre></div>
                                </div>
                            </div>
                        </div>
                }
            </div>
        )
    }
}

export default class Topic extends React.Component{

    state = {
        topicObj: {
            editStatus: false,
            topicId: 1,
            creator: {},
            title: '',
            content: '',
            create_time: '',
        },

        topicNameInput: '',
        topicContentInput: '',

        discussList: [],
        memberList: [],

        createDiscussChosen: false,
        createDiscussContent: '',
    }

    componentDidMount = async() => {
        this.topicId = this.props.params.id
        this.initPageInfo()
        if (this.props.location.state.type == 'REPLY' && this.props.location.state.id)
        {
            setTimeout(() => {
                const itemKey = "topic-discuss-item-" + this.props.location.state.id
                this.scrollToAnchor(itemKey)
            }, 500);
        }
    }

    initPageInfo = async () => {
        const result = await api('/api/topic/get', {
            method: 'GET',
            body: {
                topicId: this.topicId
            }
        })

        const topicObj = result.data
        this.teamId = result.data.team

        const memberResult = await api('/api/team/memberList', {
            method: 'GET',
            body: {
                teamId: topicObj.team
            }
        })
        const memberList = []
        memberResult.data.map((item) => [
            memberList.push({
                ...item,
                chosen: false,
            })
        ])
        

        this.setState({
            topicObj: {
                ...topicObj,
                editStatus: false,
            },
            topicNameInput: topicObj.title,
            topicContentInput: topicObj.content,

            discussList: result.data.discussList,
            memberList: memberList
        })
    }




    topicNameInput = (e) => {
        this.setState({
            topicNameInput: e.target.value
        })
    }
    topicContentHandle = (e) => {
        this.setState({
            topicContentInput: e.target.value
        })
    }

    topicChangeSaveHandle = async () => {
        const result = await api('/api/topic/editTopic', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                editTopic: {
                    title: this.state.topicNameInput,
                    content: this.state.topicContentInput,
                },
                informList: []
            }
        })
        this.setState({
            topicObj: {
                ...this.state.topicObj,
                name: this.state.topicNameInput,
                content: this.state.topicContentInput,
                editStatus: false,
            }
        })
    }

    saveDiscussEditHandle = async (_id, content) => {
        const result = await api('/api/topic/editDiscuss', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                discussId: _id,
                content: content,
                informList: []
            }
        })

        if(result && result.state.code == 0) {
            const discussList = this.state.discussList
            discussList.map((item, idx) => {
                if(item._id == _id) {
                    discussList[idx].content = content
                }
            })
            this.setState({
                discussList: discussList
            })
        }
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

    createDiscussInputHandle = (e) => {
        this.setState({
            createDiscussContent: e.target.value
        })
    }

    createDiscussHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })

        const result = await api('/api/topic/createDiscuss', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                content: this.state.createDiscussContent,
                informList: informList
            }
        })

        if(result && result.state.code == 0) {
            const discussList = this.state.discussList
            discussList.push(result.data)
            this.setState({
                discussList: discussList,
                createDiscussContent: '',
                createDiscussChosen: false,
            })
        } else {
            window.toast(result.state.msg)
        }
    }


    scrollToAnchor = (anchorName) => {
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName);
            if(anchorElement) { anchorElement.scrollIntoView(); }
        }
    }

    render() {
        return (
            <Page className="topic-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >团队列表</span>
                    <span className="iconfont icon-enter"></span>
                    <span className='pre-tag' onClick={() => {this.props.router.push('/discuss/' + this.teamId)}}>{"团队主页"}</span>
                    <span className="iconfont icon-enter"></span>
                    <span>讨论</span>
                </div>

                <div className="topic-con">
                    {
                        this.state.topicObj.editStatus ? <div className="topic-subject-edit">
                                <input type="text" onChange={this.topicNameInput} value={this.state.topicNameInput} className="topic-title"/>
                                <textarea className='topic-content' onChange={this.topicContentHandle}  value={this.state.topicContentInput}></textarea>

                                <div className="button-warp">
                                    <div className="save-btn" onClick={this.topicChangeSaveHandle}>保存</div>
                                    <div className="cancel-btn" onClick={() => {this.setState({topicObj: {...this.state.topicObj, editStatus: false}})}}>取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con">
                                <div className="topic-title">{this.state.topicObj.title}</div>
                                <div className="flex">
                                    <img className="head-img" src={this.state.topicObj.creator.headImg}></img>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">{this.state.topicObj.creator.name}</span>
                                                <span className="time">{timeBefore(this.state.topicObj.create_time)}</span>
                                            </div>
                                            {
                                                this.state.topicObj.creator._id == this.props.personInfo._id &&
                                                 <div className="right">
                                                    <span className="edit" onClick={() => { this.setState({ topicObj: { ...this.state.topicObj, editStatus: true } }) }}>编辑</span>
                                                     {/* <span className="edit">删除</span> */}
                                                </div>
                                            }

                                        </div>
                                        <div className="content"><pre>{this.state.topicObj.content}</pre></div>
                                    </div>
                                </div>
                            </div>
                    }

                    <div className="div-line"></div>

                    <div className="topic-list">
                    {
                        this.state.discussList.map((item) => {
                            return (
                                <TopicDiscussItem id={"topic-discuss-item-" + item._id} key={"topic-discuss-item-" + item._id} allowEdit={this.props.personInfo._id == item.creator._id} {...item} saveEditHandle = {this.saveDiscussEditHandle}/>
                            )
                        })
                    }

                    <div className="topic-subject-con discuss-con">
                        <div className="flex">
                            <img className="head-img" src={this.props.personInfo && this.props.personInfo.headImg}></img>
                            <div className="topic-main">
                                {
                                    this.state.createDiscussChosen ?
                                        <div className='topic-subject-edit no-pading'>
                                            <textarea autoFocus className='discuss-content' value={this.state.createDiscussContent} onChange={this.createDiscussInputHandle}></textarea>
                                            <div className="infrom">请选择要通知的人：</div>
                                            <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/>
                                            <div className="button-warp" >
                                                <div className="save-btn" onClick={this.createDiscussHandle}>发表</div>
                                                <div className="cancel-btn" onClick={() => { this.setState({ createDiscussContent: '',createDiscussChosen: false }) }}>取消</div>
                                            </div>
                                        </div>
                                        : 
                                        <div className='topic-subject-edit no-pading'>
                                            <input placeholder={"点击发表评论"} type="text" onClick={() => {this.setState({createDiscussChosen: true})}} className="topic-title"/>
                                        </div>
                                }   
                            </div>
                        </div>
                    </div>

                    </div>


                </div>

            </Page>
        )
    }
}


