import * as React from 'react';
import './style.scss'
import api from '../../utils/api';
import Page from '../page'
var ReactDOM = require('react-dom')


export default class Modal extends React.Component {
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
                teamId: this.teamId,
                dir: this.curDir,
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
                                                    <span key={"dir-list-" + idx} onClick={() => { this.headDirClickHandle(item.dir) }}> <span className="blue"> {item.name} </span> {idx == this.state.dirList.length - 1 ? '' : '>'} </span>
                                                ))
                                            }
                                        </div>
                                        : <span className="blue"> 根目录 </span>
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
