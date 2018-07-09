import * as React from 'react';
var ReactDOM = require('react-dom')
import Modal from '../../../components/modal';
import Page from '../../../components/page'
import api from '../../../utils/api';
import './style.scss'

const root = document.getElementById('app')

class Window extends React.Component {
    componentDidMount = async () => {
        this.teamId = this.props.teamId
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

    closeWindow = () => {
        this.props.callbackParent('')
    }

    confirm = () => {
        this.props.callbackParent(this.curDir)
    }

    render() {
        console.log(this.state.fileList)
        console.log(this.state.dirList)
        return (
            <div className="window" >
                <div className="outerBox">
                    <Page className="move-File">
                    <div className="file-con">
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
                        <div className="file-list">
                        {
                            this.state.fileList.map((item, idx) => {

                                if (item.fileType == 'folder') {
                                    return (
                                        <div className="file-line files" key={item.fileType + '-' + item._id}>
                                            <div className="name" onClick={() => { this.folderClickHandle(item.name) }}>{item.name}</div>
                                        </div>
                                    )
                                }


                            })
                        }
                        </div>
                        <div className="btn" onClick={this.confirm}> confirm </div>
                        <div className="btn" onClick={this.closeWindow}> close </div>
                        </div>
                    </Page>
                </div>
            </div>
        )
    }
}


export default class Hello extends React.Component {

    state = {
        ele: document.createElement('div'),
        teamId: '5b42c9daba146414dad18a85'
    }

    constructor() {
        ReactDOM.render(<Window teamId={this.state.teamId} callbackParent={this.onChildChanged} />, this.state.ele)
    }

    onChildChanged = (moveTarDir) => {
        if (moveTarDir) { console.log(moveTarDir) }
        this.close()
    }

    close = () => {
        document.getElementById('app').removeChild(this.state.ele)
    }

    open = () => {
        document.getElementById('app').appendChild(this.state.ele)
    }

    render() {
        return (
            <div>
                <Page title="测试移动功能">
                    <div className='btn' onClick={this.open}> Click Me! </div>
                </Page>
            </div>
        )
    }
}
