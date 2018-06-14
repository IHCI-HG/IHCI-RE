import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import fileUploader from '../../../utils/file-uploader';
import Page from '../../../components/page'


export default class Team extends React.Component{

    state =  {
        chosenFile: {}
    }

    componentDidMount = async() => {

    }

    openFileInput = () => {
        this.fileInput.click()
    }

    handleChange = (e) => {
        console.log(e.target.files[0]);
        this.setState({
            chosenFile: e.target.files[0]
        })

        const result = await api('/api/file/uploadFile', {
            method: 'POST',
            body: {
                fileInfo: {
                   teamId: 'teamxxx',
                   dir: '/',
                   fileName: e.target.files[0].name,
                   ossKey: ""

                }
            }
        })

        if(result.state.code === 0) {
            console.log(result);
            window.toast("Appended")
        }

        fileUploader('teamxxx', '/aa', e.target.files[0])
    }

    render() {
        return (
            <Page title="这是个测试用页面" className='test-page'>

                <div onClick={this.openFileInput}>上传文件</div>
                <div>选中的文件: {this.state.chosenFile.name}</div>

                <input type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.handleChange}></input>
            </Page>
        )
    }
}


