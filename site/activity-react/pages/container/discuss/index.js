import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeBefore, sortByCreateTime, formatDate } from '../../../utils/util'
import Page from '../../../components/page'
import fileUploader from '../../../utils/file-uploader';

import MemberChosenList from '../../../components/member-chose-list'
import { DEFAULT_DEPRECATION_REASON } from 'graphql';

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

class TopicItem extends React.PureComponent{
    render() {
        return(
            <div className="topic-item" key={"topic-item-" + this.props._id} onClick={() => {this.props.locationTo('/discuss/topic/' + this.props._id)}}>
                <img src={this.props.creator.headImg} alt="" className="head-img" />
                <div className="name">{this.props.creator.name}</div>
                <div className="main">
                    <div className="topic-title">{this.props.title}</div>
                    <div className="topic-content">{this.props.content}</div>
                </div>
                <div className="time">{timeBefore(this.props.create_time)}</div>
            </div>
        )
    }
}

export default class Discuss extends React.Component{

    state = {
        showCreateTopic: true,
        isCreator: false,

        createTopicName: '',
        createTopicContent: '',
        memberNum: 0,

        teamInfo: {
            _id: 1,
            name: 'IHCI平台搭建项目组',
            teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
            desc: '完成IHCI平台搭建',
            managed: true,
        },

        topicList: [],
        memberList: [],

        fileList: [],
        showCreateFolder: false,
        createFolderName: '新建文件夹',
    }

    componentDidMount = async() => {
        this.teamId = this.props.params.id
        this.initTeamInfo()
        this.initTeamFile()
    }

    locationTo = (url) => {
        this.props.router.push(url)
    }

    initTeamFile = async() => {
        const result = await api('/api/file/getDirFileList',{
            method: 'POST',
            body: {
                dirInfo: {
                    teamId: this.teamId,
                    dir: '/',
                }
            }
        })
        if(result && result.data && result.data.fileList) {
            this.setState({
                fileList: result.data.fileList
            })
        }
    } 

    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })

        if(!result.data) {
            window.toast('团队内容加载出错')
        }

        const teamInfo = {}
        teamInfo._id = result.data._id 
        teamInfo.name = result.data.name
        teamInfo.teamImg = result.data.teamImg
        teamInfo.desc = result.data.teamDes


        const memberList = []
        const memberIDList = []

        const curUserId = this.props.personInfo._id

        let isCreator = false
        result.data.memberList.map((item) => {
            if(item.userId == curUserId) {
                isCreator = true
            }
            memberIDList.push(item.userId)
        })
        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })

        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.memberList[idx],
                chosen: false,
            })
        })

        this.setState({
            isCreator: isCreator,
            teamInfo: teamInfo,
            memberNum: result.data.memberList.length,
            memberList: memberList,
            topicList: sortByCreateTime(result.data.topicList)
        })
    }



    createTopicHandle = async () => {
        const informList = []
        this.state.memberList.map((item) => {
            if(item.chosen) {
                informList.push(item._id)
            }
        })

        const result = await api('/api/topic/createTopic', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                name: this.state.createTopicName,
                content: this.state.createTopicContent,
                informList: informList,
            }
        })

        if(result.state.code == 0) {
            const topicList = this.state.topicList
            const time = new Date().getTime()
            topicList.unshift({
                _id: result.data._id,
                creator: this.props.personInfo,
                title: this.state.createTopicName,
                content: this.state.createTopicContent,
                time: time,
            })
            this.setState({
                topicList: topicList,
                showCreateTopic: false,
                createTopicName: '',
                createTopicContent: '',
            })
        } else {
            window.toast(result.state.msg)
        }
    }

    topicNameInputHandle = (e) => {
        this.setState({
            createTopicName: e.target.value
        })
    }

    topicContentInputHandle = (e) => {
        this.setState({
            createTopicContent: e.target.value
        })
    }

    memberChoseHandle = (tarId) => {
        const memberList = this.state.memberList
        memberList.map((item) => {
            if(item._id == tarId) {
                item.chosen = !item.chosen
            }
        })
        console.log(memberList)
        this.setState({memberList})
    }

    toAdminHandle = () => {
        location.href = '/team-admin/' + this.teamId
    }
    toMemberHandle = () =>{
        const location = {pathname:'/member', state:{teamId:this.state.teamInfo._id}}
        this.props.router.push(location)
    }

    createFolderHandle = async () => {
        this.setState({showCreateFolder: true})
    }

    createFolderNameInputHandle = (e) => {
        this.setState({
            createFolderName: e.target.value
        })
    }

    createFolderComfirmHandle = async () => {
        const result = await api('/api/file/createFolder',{
            method: 'POST',
            body: {
                folderInfo: {
                    teamId: this.teamId,
                    dir: '/',
                    folderName: this.state.createFolderName
                }
            }
        })
        
        if(result.state.code === 0) {
            window.toast("创建文件夹成功")
            this.setState({showCreateFolder: false, createFolderName: '新建文件夹'})
        } else {
            window.toast(result.state.msg)
        }
        this.initTeamFile()
    }

    createFolderCancelHandle = () => {
        this.setState({showCreateFolder: false, createFolderName: '新建文件夹'})
    }

    openFileInput = () => {
        this.fileInput.click()
    }

    uploadFileHandle = async (e) => {
        var file = e.target.files[0];
        this.setState({
            chosenFile: file
        })

        var ossKey = this.teamId+'/'+Date.now()+'/'+file.name
        
        var succeeded;
        const uploadResult = fileUploader(file, ossKey)
        await uploadResult.then(function(val) {
            console.log(val)
            succeeded = 1
        }).catch(function(reason){
            console.log(reason)
            succeeded = 0
        })

        if(succeeded === 0) {
            window.toast("上传文件失败")
            return
        } 

        const result = await api('/api/file/createFile', {
            method: 'POST',
            body: {
                fileInfo: {
                   teamId: this.teamId,
                   size: file.size,
                   dir: '/',
                   fileName: file.name,
                   ossKey: ossKey,
                }
            }
        })
        console.log(result);
        if(result.state.code === 0) {
            window.toast("上传文件成功")
        } else {
            window.toast(result.state.msg)
        }

        this.initTeamFile()
    }

    viewHandle = async (file) => {
        if(file.fileType == 'folder') 
        {
            var path;
            if(this.state.dir == '/') path = this.state.dir+file.name;
            else path = this.state.dir+'/'+file.name;
            this.state.dir = path;
        }
        this.getDirFileListHandle()
    }

    deleteHandle = async (type, name) => {
        if(type == 'file')
        {
            const result = await api('/api/file/delFile',{
                method: 'POST',
                body: {
                    fileInfo: {
                        teamId: this.teamId,
                        dir: '/',
                        fileName: name
                    }
                }
            })
        }
        else 
        {
            const result = await api('/api/file/delFolder',{
                method: 'POST',
                body: {
                    folderInfo: {
                        teamId: this.teamId,
                        dir: '/',
                        folderName: name
                    }
                }
            })
        }

        this.initTeamFile()
    }

    downloadHandle = (ossKey) => {
        window.open(window.location.origin  + '/static/' + ossKey)
    }

    folderClickHandle = (dir) => {
        location.href = '/files/' + this.teamId + '?dir=/' + dir
    }
    
    renameHandle = (item) => {
        this.state.renameId = item._id
        this.state.renameName = item.name
        this.initTeamFile()
    }

    renameNameInputHandle = async (e) => {
        this.setState({
            renameName: e.target.value
        })
    }

    renameCancelHandle = () => {
        this.state.renameId = ''
        this.state.renameName = ''
        this.initTeamFile()
    }

    renameComfirmHandle = async (item) => {
        if (item.fileType == 'file') {

            const result = await api('/api/file/updateFileName', {
                method: 'POST',
                body: {
                    fileInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        fileName: item.name, 
                    },
                    tarName: this.state.renameName,
                }
            })

            if(result.state.code == 0) {
                window.toast("修改文件名称成功")
                this.setState({
                    renameName: '',
                    renameId: '',
                })
                this.initTeamFile()
            } else {
                window.toast(result.state.msg)
            }
        } else {
            const result = await api('/api/file/updateFolderName', {
                method: 'POST',
                body: {
                    folderInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        folderName: item.name,
                    },
                    tarName: this.state.renameName,
                }
            })

            if(result.state.code == 0) {
                window.toast("修改文件夹名称成功")
                this.setState({
                    renameName: '',
                    renameId: '',
                })
                this.initTeamFile()
            } else {
                window.toast(result.state.msg)
            }
        }
    }

    render() {
        let teamInfo = this.state.teamInfo

        return (
            <Page title={"团队名称xx - IHCI"} className="discuss-page">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >团队列表</span>
                    <span className="iconfont icon-enter"></span>
                    <span>团队主页</span>
                </div>

                <div className="discuss-con page-wrap">
                    <div className="team-info">
                        <div className="left">
                            <div className="head">{teamInfo.name}</div>
                            <pre><div className="team-des">{teamInfo.desc}</div>  </pre>
                        </div>
                        <div className="right">
                            <div className="admin"onClick={this.toMemberHandle}>
                                <div className="admin-con member-num" >{this.state.memberNum}</div>
                                <span>成员</span>
                            </div>
                            {
                                this.state.isCreator && <div className="admin">
                                    <div className="admin-con iconfont icon-setup_fill"  onClick={this.toAdminHandle}></div>
                                <span>设置</span>
                            </div>
                            }

                        </div>
                    </div>


                    <div className="div-line"></div>

                    <div className="head">
                        <span className='head-title'>文件</span>
                        <div className="create-btn" onClick={this.openFileInput}>上传文件</div>
                        <div className="create-btn" onClick={this.createFolderHandle}>创建文件夹</div>
                    </div>

                    <div className="file-list">
                        <div className="file-line header">
                            <div className="name">名称</div>
                            <div className="size">大小</div>
                            <div className="last-modify">最后修改时间</div>
                            <div className="tools"></div>
                        </div>

                        {
                            this.state.showCreateFolder ? <div className="file-line files">
                                <div className="name">
                                    <input autoFocus="autofocus" type="text" className="folder-name" onChange={this.createFolderNameInputHandle} value={this.state.createFolderName} />
                                </div>
                                <div className="tools">
                                    <span onClick={this.createFolderComfirmHandle}>创建</span>
                                    <span onClick={this.createFolderCancelHandle}>取消</span>
                                </div>
                            </div> : ''
                        }

                        {
                            this.state.fileList.map((item, idx) => {
                                if(idx > 10) {
                                    return
                                }
                                if (item._id == this.state.renameId) {
                                    return (
                                        <div className="file-line files">
                                            <div className="name">
                                                <input autoFocus="autofocus" type="text" className="folder-name" onChange={this.renameNameInputHandle} value={this.state.renameName} />
                                            </div>
                                            <div className="tools">
                                                <span onClick={() => { this.renameComfirmHandle(item) }}>确定</span>
                                                <span onClick={this.renameCancelHandle}>取消</span>
                                            </div>
                                        </div>
                                    )

                                } else {
                                    if (item.fileType == 'folder') {
                                        return (
                                            <div className="file-line files" key={item.fileType + '-' + item._id}>
                                                <div className="name" onClick={() => { this.folderClickHandle(item.name) }}>{'(文件夹)'}{item.name}</div>
                                                <div className="size">-</div>
                                                <div className="last-modify">{formatDate(item.last_modify_time)}</div>
                                                <div className="tools">
                                                    <span>移动</span>
                                                    <span onClick={() => { this.renameHandle(item)}}> 重命名 </span> 
                                                    <span onClick={() => { this.deleteHandle('folder', item.name) }}>删除</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                    if (item.fileType == 'file') {
                                        return (
                                            <div className="file-line files" key={item.fileType + '-' + item._id}>
                                                <div className="name">{item.name}</div>
                                                <div className="size">{item.size}</div>
                                                <div className="last-modify">{formatDate(item.last_modify_time)}</div>
                                                <div className="tools">
                                                    <span onClick={() => { this.downloadHandle(item.ossKey) }}>下载</span>
                                                    <span>移动</span>
                                                    <span onClick={() => { this.renameHandle(item)}}> 重命名 </span> 
                                                    <span onClick={() => { this.deleteHandle('file', item.name) }}>删除</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                }
                            })
  
                        }
                        <div className='show-all-file' onClick={() => {location.href = '/files/' + this.teamId}}> 查看全部文件 </div>

                        
                    </div>



                <div className="head">
                    <span className='head-title'>讨论</span> 
                    <div className="create-btn" onClick={() => {this.setState({showCreateTopic: true})}}>发起讨论</div>
                </div>

                {
                    this.state.showCreateTopic && <div className="create-area">
                        <input type="text" className="topic-name" onChange={this.topicNameInputHandle} value={this.state.createTopicName} placeholder="话题" />
                        <textarea className="topic-content" onChange={this.topicContentInputHandle} value={this.state.createTopicContent} placeholder="说点什么"></textarea>
                        
                        <div className="infrom">请选择要通知的人：</div>
                        <MemberChosenList choseHandle={this.memberChoseHandle} memberList={this.state.memberList}/>

                        <div className="btn-con">
                            <div className="create-btn" onClick={this.createTopicHandle}>发起讨论</div>
                            <div className="cancle" onClick={() => {this.setState({showCreateTopic: false})}}>取消</div>
                        </div>
                    </div>
                }

                <div className="topic-list">
                    {
                        this.state.topicList.map((item) => {
                            return (
                                <TopicItem key={'topic-item' + item._id} locationTo={this.locationTo} {...item} />
                            )
                        })
                    }
                </div>




                </div>

            </Page>
        )
    }
}


