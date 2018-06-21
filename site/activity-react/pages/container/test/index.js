import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import fileUploader from '../../../utils/file-uploader';
import Page from '../../../components/page'


export default class Team extends React.Component{

    state =  {
        chosenFile: {},
        folderName: '',
        teamId: 'aaaaaaaaaaaa',
        dir: '/',
        ossKey: '',
    }

    componentDidMount = async() => {

    }

    openFileInput = () => {
        this.fileInput.click()
    }

    uploadFileHandle = async (e) => {

        var file = e.target.files[0];
        this.setState({
            chosenFile: file
        })

        console.log(file)

        const result = await api('/api/file/createFile', {
            method: 'POST',
            body: {
                fileInfo: {
                   teamId: this.state.teamId,
                   dir: this.state.dir,
                   fileName: file.name,
                   ossKey: this.ossKey
                }
            }
        })
            
        console.log(result);

        if(result.state.code === 0) {
            window.toast("File appended")
        }

        fileUploader('teamxxx', '/aa', file)
    }

    createFolderHandle = async () => {
        const result = await api('/api/file/createFolder',{
            method: 'POST',
            body: {
                folderInfo: {
                    teamId: this.state.teamId,
                    dir: this.state.dir,
                    folderName: this.folderName
                }
            }
        })
        
        console.log(result);
        
        if(result.state.code === 0) {
            window.toast("Folder created")
        }

    }

    getDirFileListHandle = async () => {
        const result = await api('/api/file/getDirFileList',{
            method: 'POST',
            body: {
                dirInfo: {
                    teamId: this.state.teamId,
                    dir: this.state.dir,
                }
            }
        })

        console.log(result);

        if(result.state.code == 0) {
            window.toast("Got file list")
        }
    }

    folderNameChangeHandle = (e) => {
        this.setState({
            folderName: e.target.value
        })
    }

    render() {
        return (
            <Page title="这是个测试用页面" className='test-page'>

                <div onClick={this.openFileInput}>上传文件</div>
                <div>选中的文件: {this.state.chosenFile.name}</div>

                <input type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>

                <div onClick={this.getDirFileListHandle}>ShowFiles</div>
                    
                <div className="folder_name">文件夹名称</div>
                <input type="text" value={this.state.folderName} className="folder_input" onChange={this.folderNameChangeHandle} />
                    
                <div className="sava-btn" onClick={this.createFolderHandle}>Confirm</div>
            
            </Page>
        )
    }
}


