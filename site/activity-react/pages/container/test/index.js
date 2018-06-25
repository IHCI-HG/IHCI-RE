import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import fileUploader from '../../../utils/file-uploader';
import fileDownloader from '../../../utils/file-downloader';
import Page from '../../../components/page'
import { resultKeyNameFromField } from 'apollo-client/data/storeUtils';


export default class Team extends React.Component{

    state =  {
        chosenFile: {},
        fileList: [],
        folderName: '',
        teamId: '5b30ab66748668336444b67b',
        dir: '/',
        ossKey: '',
    }

    componentDidMount = async() => {
        this.getDirFileListHandle()
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
        this.getDirFileListHandle()
    }

    createFolderHandle = async () => {
        const result = await api('/api/file/createFolder',{
            method: 'POST',
            body: {
                folderInfo: {
                    teamId: this.state.teamId,
                    dir: this.state.dir,
                    folderName: this.state.folderName
                }
            }
        })
        
        console.log(result);
        
        if(result.state.code === 0) {
            window.toast("Folder created")
        }

        //this.getDirFileListHandle()
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
            this.setState({
                fileList: result.data.fileList
            })
        }
    }

    folderNameChangeHandle = (e) => {
        this.setState({
            folderName: e.target.value
        })
    }

    downloadFileHandle = async () => {

        const result = await api('/api/file/downloadFile',{
            method: 'POST',
            body: {
                fileInfo: {
                    teamId: 'teamxxx',
                    dir: '/aa',
                    fileName: 'start.sh'
                }
            }
        })

        console.log(result)

        /*
        if(result.state.code == 0) {
            window.toast("Downloaded file")
        }
        */
    }

    test = async () => {
        
    }

    /*
    showFilesHandle = async () => {
        console.log(this.fileList);
    }
    */

    deleteHandle = async (file) => {
        if(file.fileType == 'file')
        {
            await api('/api/file/delFile'),{

            }
        }
    }

    render() {
        return (
            <Page title="这是个测试用页面" className='test-page'>

                <div onClick={this.openFileInput}>上传文件</div>
                <div>选中的文件: {this.state.chosenFile.name}</div>

                <input type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>

                <div className="files">
                {
                    this.state.fileList.map((item) => {
                        return (
                            <div className="fileName" key={'fileName-'+item._id}>
                                <span className="name">{item.name}</span>
                                <span className="del" onClick={this.deleteHandle.bind(this,item)}>   delete</span>
                            </div>
                        )
                    })
                }
                </div>
                    
                <div className="folder_name">文件夹名称</div>
                <input type="text" value={this.state.folderName} className="folder_input" onChange={this.folderNameChangeHandle} />
                    
                <div className="savaBtn" onClick={this.createFolderHandle}>Confirm</div>
                <div className="downBtn" onClick={this.downloadFileHandle}>Download</div>

                <div className="test" onClick={this.test}> test </div>
            
            </Page>
        )
    }
}


