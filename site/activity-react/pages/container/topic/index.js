import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';
import { timeBefore, createMarkup } from '../../../utils/util'
import Editor from '../../../components/editor'
import fileUploader from '../../../utils/file-uploader'
import MemberChosenList from '../../../components/member-chose-list'
import TopicDiscussItem from '../../../components/topic-discuss-item'

export default class Topic extends React.Component{

    state = {
        topicObj: {
            editStatus: false,
            topicId: 1,
            creator: {},
            title: '',
            content: '',
            create_time: '',
            todoDesc: '',
        },
        teamInfo:{},
        discussObj: {
            editStatus: false,
            topicId: 1,
            creator: {},
            title: '',
            content: '',
            create_time: '',
            todoDesc: '',
        },
        topicNameInput: '',
        topicContentInput: '',
        topicAttachments: [],

        discussNameInput: '',
        discussContentInput: '',
        discussAttachments: [],

        discussList: [],
        memberList: [],

        createDiscussChosen: false,
        createDiscussContent: '',

        enableHighlight: false,
        topicAttachmentsArr:[],
        topicOssKeyArr:[],
        discussAttachmentsArr:[],
        discussOssKeyArr:[],
    }

    componentDidMount = async() => {
        console.log('mounted!!')
        console.log(this)
        this.topicId = this.props.params.id
        this.initPageInfo()
        try{
            if (this.props.location.state.type == 'REPLY' && this.props.location.state.id)
            {
                setTimeout(() => {
                    const itemKey = "topic-discuss-item-" + this.props.location.state.id
                    this.scrollToAnchor(itemKey)
                }, 500);
            }
        }catch(error)
        {}
    }

    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })
        if (result.data) {
            this.setState({
                teamInfo: result.data
            })
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

        console.log(result)

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
        const result2 = await api('/api/topic/getDiscuss', {
            method: 'GET',
            body: {
                topicId: this.topicId
            }
        })
        const discussList = result2.data
        discussList.map((item)=>{
            item.imgList = []
            item.fileList.map((fileItem,index)=>{
                if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                    item.imgList.push(fileItem)
                }
            })
        })
        this.setState({
            topicObj: {
                ...topicObj,
                editStatus: false,
            },
            topicNameInput: topicObj.title,
            topicContentInput: topicObj.content,
            topicAttachments: topicObj.fileList,
            discussList: discussList,
            memberList: memberList
        })
        this.initTeamInfo()
    }

    topicContentHandle = (content) => {
        console.log(content)
        this.setState({
            topicContentInput: content
        })
    }
    discussContentHandle = (content) => {
        this.setState({
            createDiscussContent: content
        })
    }

    topicFileUploadHandle = async (e) => {
        var ossKey = this.teamId + '/' + Date.now() + '/' + e.target.files[0].name
        const topicAttachmentsArr = this.state.topicAttachmentsArr
        const topicOssKeyArr = this.state.topicOssKeyArr
        topicAttachmentsArr.push(e.target.files[0])
        topicOssKeyArr.push(ossKey)
        this.setState({
            topicAttachmentsArr,
            topicOssKeyArr
        })
        const resp = await fileUploader(e.target.files[0], ossKey)
        let topicAttachments = this.state.topicAttachments;
        topicAttachments = [...topicAttachments, resp]
        this.setState({
            topicAttachments,
        })
    }
    discussFileUploadHandle = async (e) => {
        var ossKey = this.teamId + '/' + Date.now() + '/' + e.target.files[0].name
        const discussAttachmentsArr = this.state.discussAttachmentsArr
        const discussOssKeyArr = this.state.discussOssKeyArr
        discussAttachmentsArr.push(e.target.files[0])
        discussOssKeyArr.push(ossKey)
        this.setState({
            discussAttachmentsArr,
            discussOssKeyArr
        })
        const resp = await fileUploader(e.target.files[0], ossKey)
        let discussAttachments = this.state.discussAttachments;
        discussAttachments = [...discussAttachments, resp]
        this.setState({
            discussAttachments,
        })
    }
    deleteFile = async (e, index) => {
        let topicAttachments = this.state.topicAttachments
        topicAttachments.splice(index,1);
        this.setState({
            topicAttachments,
        })
    }
    deleteDiscussFile = async (e, index) => {
        let discussAttachments = this.state.discussAttachments
        discussAttachments.splice(index,1);
        this.setState({
            discussAttachments,
        })
    }

    topicNameInput = (e) => {
        this.setState({
            topicNameInput: e.target.value
        })
    }

    topicChangeSaveHandle = async () => {
        let editTopic = {
            title: this.state.topicNameInput,
                content: this.state.topicContentInput,
                fileList: this.state.topicAttachments,
        }
        if(this.state.topicAttachmentsArr!==[])
        {
            this.state.topicAttachmentsArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: this.state.topicOssKeyArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        const result = await api('/api/topic/editTopic', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                editTopic,
                informList: [],
                fileList:this.state.topicAttachments
            }
        })

        if (result) {
            this.setState({
                topicObj: {
                    ...this.state.topicObj,
                    name: this.state.topicNameInput,
                    content: this.state.topicContentInput,
                    fileList: this.state.topicAttachments,
                    editStatus: false,
                }
            })
        }
    }

    saveDiscussEditHandle = async (_id, content,fileList,attArr,ossArr) => {
        if(attArr!==[])
        {
            attArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: ossArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        const result = await api('/api/topic/editDiscuss', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                discussId: _id,
                content: content,
                informList: [],
                fileList:fileList
            }
        })
        console.log(result)
        if(result.state.code == 0) {
            const imgList=[]
            fileList.map((fileItem,index)=>{
                if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                    imgList.push(fileItem)
                }
            })
            const discussList = this.state.discussList
            discussList.map((item, idx) => {
                if(item._id == _id) {
                    discussList[idx].content = content
                    discussList[idx].fileList = fileList
                    discussList[idx].imgList = imgList
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
        console.log('here:',this.state.createDiscussContent)
    }

    createDiscussHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })
        if(this.state.discussAttachmentsArr!==[])
        {
            this.state.discussAttachmentsArr.map(async(item,index)=>{
                const result1 = await api('/api/file/createFile', {
                    method: 'POST',
                    body: {
                        fileInfo: {
                            teamId: this.teamId,
                            size: item.size,
                            dir: '/',
                            fileName: item.name,
                            ossKey: this.state.discussOssKeyArr[index],
                        }
                    }
                })
                if (result1.state.code === 0) {
                    window.toast("上传文件成功")
                } else {
                    window.toast(result1.state.msg)
                }
            })
        }
        
        const result = await api('/api/topic/createDiscuss', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                topicId: this.topicId,
                content: this.state.createDiscussContent,
                fileList:this.state.discussAttachments
                // informList: informList
            }
        })
        console.log(result)
        if(result && result.state.code == 0) {
            const discussList = this.state.discussList
            result.data.imgList=[]
            result.data.fileList.map((fileItem,index)=>{
                if(fileItem.name.endsWith(".jpg")||fileItem.name.endsWith(".jpeg")||fileItem.name.endsWith(".png")||fileItem.name.endsWith(".bmp")||fileItem.name.endsWith(".gif")){
                    result.data.imgList.push(fileItem)
                }
            })
            discussList.push(result.data)
            this.setState({
                discussList: discussList,
                createDiscussContent: '',
                createDiscussChosen: false,
                discussAttachments:[],
            })
            
        } else {
            window.toast(result.state.msg)
        }
    }


    scrollToAnchor = (anchorName) => {
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName);
            setTimeout(() => {
                this.setState({
                    enableHighlight: true,
                })
            }, 500);
            
            if(anchorElement) { anchorElement.scrollIntoView({behavior: 'smooth'}); }
        }
    }

    undoHighlight = () =>{
        console.log("blur!!")
        this.setState({
            enableHighlight: false,
        })
    }

    downloadHandle = (ossKey) => {
        window.open(window.location.origin + '/static/' + ossKey)
    }

    render() {
        return (
            <Page className="topic-page">
                {/* <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >团队列表</span>
                    <span className="iconfont icon-enter"></span>
                    <span className='pre-tag' onClick={() => {this.props.router.push('/team/' + this.teamId)}}>{"团队主页"}</span>
                    <span className="iconfont icon-enter"></span>
                    <span>讨论</span>
                </div> */}
                <div className="return" onClick={()=>{location.href = '/team/'+this.teamId}}>
                        <div className="teamName">{this.state.teamInfo.name}</div>
                </div>
                <div className="topic-con">
                    {
                        this.state.topicObj.editStatus ? <div className="topic-subject-edit">
                                <input type="text" onChange={this.topicNameInput} value={this.state.topicNameInput} className="topic-title"/>
                                {/*<textarea className='topic-content' onChange={this.topicContentHandle}  value={this.state.topicContentInput}></textarea>*/}
                                <Editor handleContentChange={this.topicContentHandle.bind(this)}
                                        handleFileUpload={this.topicFileUploadHandle.bind(this)}
                                        content={this.state.topicContentInput}
                                        deleteFile={this.deleteFile.bind(this)}
                                        attachments={this.state.topicAttachments}></Editor>
                                <div className="infrom">请选择要通知的人：</div>
                                <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/>
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
                                                
                                            <div className="right">
                                                <span className="edit" onClick={() => { this.setState({ topicObj: { ...this.state.topicObj, editStatus: true } }) }}>编辑</span>
                                                    {/* <span className="edit">删除</span> */}
                                            </div>
                                        </div>
                                        <div className="BraftEditor-container">
                                            <p className="public-DraftEditor-content BraftEditor-content" dangerouslySetInnerHTML={createMarkup(this.state.topicObj.content)}></p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                    }
                    { this.state.topicObj.editStatus== false &&
                        <div className="file-list">
                            {
                                this.state.topicObj.fileList && this.state.topicObj.fileList.map((item) => {
                                    return ( <div className="file-item" key={Math.random()} onClick={this.downloadHandle.bind(this, item.name)}>{item.name.split("/")[2]}</div> )
                                })
                            }
                        </div>
                    }

                    <div className="div-line"></div>

                    <div className="topic-list">
                    {
                        this.state.discussList.map((item) => {
                            return (
                                <TopicDiscussItem 
                                    id={"topic-discuss-item-" + item._id} 
                                    onBlur={() => this.undoHighlight()} key={"topic-discuss-item-" + item._id} 
                                    enableHighlight={this.state.enableHighlight} 
                                    highlight={!!this.props.location.state && this.props.location.state.id == item._id? true : false} 
                                    allowEdit={this.props.personInfo._id == item.creator._id} {...item} 
                                    saveEditHandle = {this.saveDiscussEditHandle}
                                    downloadHandle = {this.downloadHandle}
                                    memberList = {this.state.memberList}
                                />
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
                                            <Editor handleContentChange={this.discussContentHandle.bind(this)}
                                                handleFileUpload={this.discussFileUploadHandle.bind(this)}
                                                content={this.state.discussContentInput}
                                                deleteFile={this.deleteDiscussFile.bind(this)}
                                                attachments={this.state.discussAttachments}>
                                            </Editor>
                                            {/* <textarea autoFocus className='discuss-content' value={this.state.createDiscussContent} onChange={this.createDiscussInputHandle}></textarea> */}
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
