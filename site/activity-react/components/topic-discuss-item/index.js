import * as React from 'react';
import './style.scss'
import Editor from "../editor"
import { timeBefore, createMarkup } from '../../utils/util'


class TopicDiscussItem extends React.Component {
    componentDidMount = () => {
        this.setState({
            content: this.props.content
        })
    }

    state = {
        content: '',
        editState: false,
        enableHighlight: false,
        discussAttachments:this.props.fileList,
        discussAttachmentsArr:[],
        discussOssKeyArr:[],
    }

    editInputHandle = (e) => {
        this.setState({
            content: e.target.value
        })
    }

    discussContentHandle = (contents) => {
        this.setState({
            content: contents
        })
    }
    discussFileUploadHandle = async (e) => {
        var ossKey = this.props.teamId + '/' + Date.now() + '/' + e.target.files[0].name
        const discussAttachmentsArr = this.state.discussAttachmentsArr
        const discussOssKeyArr = this.state.discussOssKeyArr
        discussAttachmentsArr.push(e.target.files[0])
        discussOssKeyArr.push(ossKey)
        this.setState({
            discussAttachmentsArr,
            discussOssKeyArr
        })
        const resp = await fileUploader(e.target.files[0], ossKey)
        let discussAttachments = this.state.discussAttachments;
        discussAttachments = [...discussAttachments, resp]
        this.setState({
            discussAttachments,
        })
    }

    deleteDiscussFile = async (e, index) => {
        let discussAttachments = this.state.discussAttachments
        discussAttachments.splice(index,1);
        this.setState({
            discussAttachments,
        })
    }

    render() {
        const {
            _id,
            creator,
            content,
            create_time,
            saveEditHandle,
            allowEdit,
            fileList,
        } = this.props

        return (
            <div className='no-border' id={this.props.id} tabIndex="0" onBlur={this.props.onBlur}>
                {
                    this.state.editState ? <div className="topic-subject-edit">
                        <Editor handleContentChange={this.discussContentHandle.bind(this)}
                            handleFileUpload={this.discussFileUploadHandle.bind(this)}
                            content={this.state.content}
                            deleteFile={this.deleteDiscussFile.bind(this)}
                            attachments={this.state.discussAttachments}>
                        </Editor>
                        <div className="button-warp">
                            <div className="save-btn" 
                                onClick={() => { 
                                    this.props.saveEditHandle(_id, this.state.content,this.state.discussAttachments,this.state.discussAttachmentsArr,this.state.discussOssKeyArr); 
                                    this.setState({ editState: false }) 
                                    }}>保存</div>
                            <div className="cancel-btn" onClick={() => { this.setState({ editState: false }) }}>取消</div>
                        </div>
                    </div>
                    :
                    <div  className={(this.props.enableHighlight &&this.props.highlight) ? "topic-subject-con discuss-con highlight" :"topic-subject-con discuss-con"}>
                        <div className="flex">
                            <img className="head-img" src={creator.headImg}></img>
                            <div className="topic-main">
                                <div className="head-wrap">
                                    <div className="left">
                                        <span className="name">{creator.name}</span>
                                        <span className="time">{timeBefore(create_time)}</span>
                                    </div>
                                    {
                                        !this.state.editState && <div className="right">
                                            <span className="edit" onClick={() => { this.props.onBlur(), this.setState({ editState: true }) }}>编辑</span>
                                        </div>
                                    }
                                </div>
                                <p dangerouslySetInnerHTML={createMarkup(content)}></p>
                            </div>
                        </div>
                        <div className="file-list">
                            {
                                this.props.imgList.map((item) => {
                                    return (
                                        <div className="file-pic-item" key={Math.random()} onClick={this.props.downloadHandle.bind(this, item.name)}>
                                            <img className="file-pic" src={window.location.origin + '/static/' + item.name}></img>
                                            <div className="file-name">{item.name.split("/")[2]}</div>
                                        </div>
                                    )
                                })
                            }
                            {
                            this.props.fileList.map((item) => {
                                if(!(item.name.endsWith(".jpg")||item.name.endsWith(".jpeg")||item.name.endsWith(".png")||item.name.endsWith(".bmp")||item.name.endsWith(".gif"))){
                                    return ( <div className="file-item" key={Math.random()} onClick={this.props.downloadHandle.bind(this, item.name)}>{item.name.split("/")[2]}</div> )
                                }
                                })
                            }
                        </div>
                    </div>
                }
            </div>
        )
    }
}
export default TopicDiscussItem