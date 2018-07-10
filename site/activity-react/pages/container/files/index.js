import * as React from 'react';
import './style.scss'

var ReactDOM = require('react-dom')
import { timeBefore, sortByCreateTime, formatDate } from '../../../utils/util'
import api from '../../../utils/api';
import Page from '../../../components/page'
import fileUploader from '../../../utils/file-uploader';



const root = document.getElementById('app')

class Modal extends React.Component {
    componentDidMount = async () => {
        this.teamId = this.props.teamId
        this.folderId = this.props.folderId
        this.initDirList()
        this.initTeamInfo()
        this.initTeamFile()
    }
    state = {
        teamInfo : {},
        fileList: [],
        dirList: [],
    }

    initDirList = () => {
        if(!this.curDir) {
            this.curDir = this.props.dir || '/'
        }
        if(this.curDir == '/') { 
            this.setState({
                dirList: []
            })
            return
        }
        let splitDir = this.curDir.split('/')
        let totalDirList = []
        splitDir.map((item, idx) => {
            if(idx == 0) {
                totalDirList.push({
                    name: '根目录',
                    dir: ''
                })
            } else {
                totalDirList.push({
                    name: item,
                    dir: totalDirList[idx - 1].dir + '/' + item
                }) 
            }
        })
        totalDirList[0].dir = '/'
        this.setState({
            dirList: totalDirList
        })
    }

    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.teamId
            }
        })
        if(result.data) {
            this.setState({
                teamInfo: result.data
            })
        }
    }

    initTeamFile = async () => {
        const result = await api('/api/file/getDirFileList', {
            method: 'POST',
            body: {
                dirInfo: {
                    teamId: this.teamId,
                    dir: this.curDir,
                }
            }
        })
        if (result && result.data && result.data.fileList) {
            this.setState({
                fileList: result.data.fileList
            })
        }
    }

    folderClickHandle = (folderName) => {
        const tarDir = this.curDir + (this.curDir == '/' ? '' : '/') + folderName
        this.curDir = tarDir
        this.initDirList()
        this.initTeamFile()

    }

    headDirClickHandle = (dir) => {
        if(dir == '/') {
            this.curDir = '/'
            this.initDirList()
            this.initTeamFile()
        } else {
            this.curDir = dir
            this.initDirList()
            this.initTeamFile()
        }
    }

    closeWindow = () => {
        this.props.callbackParent('')
    }

    confirm = () => {
        this.props.callbackParent(this.curDir)
    }

    render() {
        return (
            <div className="window" >
                <div className="outerBox">
                    <Page className="move-File">
                        <div className="move-file-con">
                        <div className="head-info"> 移动到： </div>
                            <div className="file-dir">
                                {
                                    this.state.dirList.length ?
                                        <div>
                                            {
                                                this.state.dirList.map((item, idx) => (
                                                    <span key={"dir-list-" + idx} onClick={() => { this.headDirClickHandle(item.dir) }}>{item.name} {idx == this.state.dirList.length - 1 ? '' : '>'} </span>
                                                ))
                                            }
                                        </div>
                                        : '根目录'
                                }
                            </div>
                            <div className="file-list">
                                <div className="file-line header">
                                    <div className="name">文件夹名称</div>
                                </div>

                                {
                                    this.state.fileList.map((item, idx) => {

                                        if (item.fileType == 'folder' && item._id != this.folderId) {
                                            return (
                                                <div className="file-line files" key={item.fileType + '-' + item._id}>
                                                    <div className="name" onClick={() => { this.folderClickHandle(item.name) }}>{item.name}</div>
                                                </div>
                                            )
                                        }


                                    })
                                }
                            </div>
                            <div className="btn-confirm" onClick={this.confirm}> 确定 </div>
                            <div className="btn-cancle" onClick={this.closeWindow}> 取消 </div>
                        </div>
                    </Page>
                </div>
            </div>
        )
    }
}

export default class Files extends React.Component {
    componentDidMount = async () => {
        this.teamId = this.props.params.id
        this.initDirList()
        this.initTeamInfo()
        this.initTeamFile()
    }
    state = {
        teamInfo: {},
        fileList: [],

        showCreateFolder: false,
        createFolderName: '新建文件夹',

        renameId: '',
        renameName: '',

        dirList: [],
        modal: document.createElement('div'),
        moveItem: '',
    }

    initDirList = () => {
        if (!this.curDir) {
            this.curDir = this.props.location.query.dir || '/'
        }
        if (this.curDir == '/') {
            this.setState({
                dirList: []
            })
            return
        }
        let splitDir = this.curDir.split('/')
        let totalDirList = []
        splitDir.map((item, idx) => {
            if (idx == 0) {
                totalDirList.push({
                    name: '根目录',
                    dir: ''
                })
            } else {
                totalDirList.push({
                    name: item,
                    dir: totalDirList[idx - 1].dir + '/' + item
                })
            }
        })
        totalDirList[0].dir = '/'
        this.setState({
            dirList: totalDirList
        })
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

    initTeamFile = async () => {
        const result = await api('/api/file/getDirFileList', {
            method: 'POST',
            body: {
                dirInfo: {
                    teamId: this.teamId,
                    dir: this.curDir,
                }
            }
        })
        if (result && result.data && result.data.fileList) {
            this.setState({
                fileList: result.data.fileList
            })
        }
    }

    createFolderHandle = async () => {
        this.setState({ showCreateFolder: true })
    }

    createFolderNameInputHandle = (e) => {
        this.setState({
            createFolderName: e.target.value
        })
    }

    createFolderComfirmHandle = async () => {
        const result = await api('/api/file/createFolder', {
            method: 'POST',
            body: {
                folderInfo: {
                    teamId: this.teamId,
                    dir: this.curDir,
                    folderName: this.state.createFolderName
                }
            }
        })

        if (result.state.code === 0) {
            window.toast("文件夹创建成功")
            this.setState({ showCreateFolder: false, createFolderName: '新建文件夹' })
        } else {
            window.toast(result.state.msg)
        }
        this.initTeamFile()
    }

    createFolderCancelHandle = () => {
        this.setState({ showCreateFolder: false, createFolderName: '新建文件夹' })
    }

    openFileInput = () => {
        this.fileInput.click()
    }

    viewHandle = async (file) => {
        if (file.fileType == 'folder') {
            var path;
            if (this.state.dir == '/') path = this.state.dir + file.name;
            else path = this.state.dir + '/' + file.name;
            this.state.dir = path;
        }
        this.getDirFileListHandle()
    }

    moveHandle = async (item, tarDir) => {
        console.log(this.state.moveItem)
        if (item.fileType == 'file') {
            const result = await api('/api/file/moveFile', {
                method: 'POST',
                body: {
                    fileInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        fileName: this.state.moveItem.name,
                        tarDir: tarDir,
                    }
                }
            })

            if (result.state.code == 0) {
                window.toast("移动文件成功")
            } else {
                window.toast(result.state.msg)
            }
        }
        else {
            const result = await api('/api/file/moveFolder', {
                method: 'POST',
                body: {
                    folderInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        folderName: this.state.moveItem.name,
                        tarDir: tarDir,
                    }
                }
            })

            if (result.state.code == 0) {
                window.toast("移动文件夹成功")
            } else {
                window.toast(result.state.msg)
            }
        }
        this.initTeamFile()
    }

    onChildChanged = (moveTarDir) => {
        if (moveTarDir != '') {
            this.moveHandle(this.state.moveItem, moveTarDir)
        }
        document.getElementById('app').removeChild(this.state.modal)
        this.state.moveItem = ''
    }

    openMoveModalHandle = (item) => {
        this.state.moveItem = item
        ReactDOM.render(<Modal teamId={this.teamId} folderId={item._id} callbackParent={this.onChildChanged} />, this.state.modal)
        document.getElementById('app').appendChild(this.state.modal)
    }

    uploadFileHandle = async (e) => {
        var file = e.target.files[0];
        this.setState({
            chosenFile: file
        })

        var ossKey = this.teamId + '/' + Date.now() + '/' + file.name

        var succeeded;
        const uploadResult = fileUploader(file, ossKey)
        await uploadResult.then(function (val) {
            succeeded = 1
        }).catch(function (reason) {
            console.log(reason)
            succeeded = 0
        })

        if (succeeded === 0) {
            window.toast("上传文件失败")
            return
        }

        const result = await api('/api/file/createFile', {
            method: 'POST',
            body: {
                fileInfo: {
                    teamId: this.teamId,
                    size: file.size,
                    dir: this.curDir,
                    fileName: file.name,
                    ossKey: ossKey
                }
            }
        })
        if (result.state.code === 0) {
            window.toast("上传文件成功")
        } else {
            window.toast(result.state.msg)
        }

        this.initTeamFile()
    }

    deleteHandle = async (type, name) => {
        if (type == 'file') {
            const result = await api('/api/file/delFile', {
                method: 'POST',
                body: {
                    fileInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        fileName: name
                    }
                }
            })
        } else {
            const result = await api('/api/file/delFolder', {
                method: 'POST',
                body: {
                    folderInfo: {
                        teamId: this.teamId,
                        dir: this.curDir,
                        folderName: name
                    }
                }
            })
        }
        this.initTeamFile()
    }

    downloadHandle = (ossKey) => {
        window.open(window.location.origin + '/static/' + ossKey)
    }

    headDirClickHandle = (dir) => {
        if (dir == '/') {
            this.curDir = '/'
            this.initDirList()
            this.initTeamFile()
        } else {
            this.curDir = dir
            this.initDirList()
            this.initTeamFile()
        }
    }

    folderClickHandle = (folderName) => {
        const tarDir = this.curDir + (this.curDir == '/' ? '' : '/') + folderName
        this.curDir = tarDir
        this.initDirList()
        this.initTeamFile()

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

            if (result.state.code == 0) {
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

            if (result.state.code == 0) {
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
        return (
            <Page title="文件" className="file-page">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>

                <div className="file-con page-wrap">

                    <div className="head-info">
                        {this.state.teamInfo.name}的文件
                    </div>

                    <div className="file-dir">
                        {
                            this.state.dirList.length ?
                                <div>
                                    {
                                        this.state.dirList.map((item, idx) => (
                                            <span key={"dir-list-" + idx} onClick={() => { this.headDirClickHandle(item.dir) }}>{item.name} {idx == this.state.dirList.length - 1 ? '' : '>'} </span>
                                        ))
                                    }
                                </div>
                                : ''
                        }
                    </div>

                    <div className="head">
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
                                                    <span onClick={() => { this.openMoveModalHandle(item) }}>移动</span>
                                                    <span onClick={() => { this.renameHandle(item) }}> 重命名 </span>
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
                                                    <span onClick={() => { this.openMoveModalHandle(item) }}>移动</span>
                                                    <span onClick={() => { this.renameHandle(item) }}> 重命名 </span>
                                                    <span onClick={() => { this.deleteHandle('file', item.name) }}>删除</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                }
                            })
                        }

                    </div>
                </div>


            </Page>
        )
    }
}


