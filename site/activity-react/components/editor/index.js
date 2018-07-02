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
            height: 200,
            contentFormat: 'html',
            initialContent: _props.content,
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

                <div className="editor-file-list">
                    {
                        _props.attachments&&_props.attachments.map((item) => {
                            return( <div className="file-item" key={Math.random()}>{item.name}</div> )
                        })
                    }
                </div>
            </div>
        )
    }
}