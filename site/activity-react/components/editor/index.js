import * as React from 'react';
import BraftEditor from 'braft-editor'
import './braft.scss'
import './style.scss'



export default class Beditor extends React.Component{

    openFileInput = () => {
        this.fileInput.click()
    }

    render() {
        const _props = this.props

        const editorProps = {
            height: 500,
            contentFormat: 'html',
            initialContent: '',
            onChange: _props.handleContentChange,
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
            <div>
                <input style={{display: "none"}}
                       type="file"
                       ref={(fileInput) => this.fileInput = fileInput}
                       onChange={_props.handleFileUpload}>
                </input>

                <BraftEditor {...editorProps} />


                {/*<div dangerouslySetInnerHTML={this.state.content}></div>*/}
                {/*<div className="create-btn" onClick={this.handleSave.bind(this)}>保存</div>*/}

                <div className="file-list">
                    {
                        _props.attachments.map((item) => {
                            return( <div key={Math.random()}>{item.name}</div> )
                        })
                    }
                </div>
            </div>
        )
    }
}