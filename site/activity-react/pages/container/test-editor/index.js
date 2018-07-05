import * as React from 'react';
import BraftEditor from 'braft-editor'
import '../../../commen/braft.scss'
import './style.scss'

import api from '../../../utils/api';
import fileUploader from '../../../utils/file-uploader';
import Page from '../../../components/page'


export default class Team extends React.Component{
    state =  {
        fileList: [],
    }

    componentDidMount = async() => {

    }

    openFileInput = () => {
        this.fileInput.click()
    }


    handleChange = (content) => {
        console.log(content)
    }

    openFileInput = () => {
        this.fileInput.click()
    }

    handleInputChange = async (e) => {
        // 上传文件到阿里云服务器
        const result = await fileUploader('teamId', '', e.target.files[0])
        console.log(result);

        const fileList = this.state.fileList
        fileList.push(result.name)

        this.setState({
            fileList: fileList,
        })


    }

    render() {
        const editorProps = {
            height: 500,
            contentFormat: 'html',
            initialContent: '',
            onChange: this.handleChange,
            controls: [
                'undo', 'redo', 'split', 'font-size', 
                'text-color', 'bold', 'italic', 'underline', 'strike-through',
                'emoji', 'text-align', 'split', 'headings', 'list_ul',
                'list_ol', 'blockquote', 'hr', 'remove-styles', 'clear'
            ],
            extendControls: [
                {
                    type: 'button',
                    text: 'Hello',
                    html: '附件',
                    hoverTitle: '上传文件!',
                    className: 'preview-button',
                    onClick: () => this.openFileInput()
                }
            ]
        }

        return (
            <Page title="这是个测试用页面" className='test-page'>
                <input style={{display: "none"}} type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.handleInputChange}></input>
                <div className="demo">
                      <BraftEditor {...editorProps} />  
                </div>
                <div className="file-list">
                    {
                        this.state.fileList.map((item) => {
                            return( <div key={Math.random()}>{item}</div> )
                        })
                    }
                </div>
            </Page>
        )
    }
}


