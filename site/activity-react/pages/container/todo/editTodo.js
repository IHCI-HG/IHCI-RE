import * as React from 'react'
import './style.scss'
import ItemLabel from './itemLabel'
import fileUploader from '../../../utils/file-uploader'
import Editor from '../../../components/editor'
import {create} from '../../../../../server/components/uuid/uuid'


class EditTodo extends React.Component {
    state = {
        assigneeId: this.props.assigneeId || null,
        date: this.props.date || null,
        todoDesc: this.props.desc || '',
        todoAttachments: this.props.attachments,
        attachmentsArr:[],
        ossKeyArr:[],
    }

    static defaultProps = {
        detail: '',
        closeAfterConfirm: true,
    }

    componentWillUnmount() {
        this.setState({todoDesc: null})
        this.setState({todoAttachments: null})
        this.setState({assigneeId: null})
        this.setState({date: null})
    }

    handleTodoDescChange = (content) => {
        this.setState({
            todoDesc: content
        })
        console.log(this.state.todoDesc)
    }

    fileUploadHandle = async (e) => {
        var fileName = e.target.files[0].name
        var fileSize = e.target.files[0].size
        var nameParts = e.target.files[0].name.split('.')
        var ossKey = this.props.teamId + '/' + create() + '.' + nameParts[nameParts.length-1]
        const attachmentsArr = this.state.attachmentsArr
        const ossKeyArr = this.state.ossKeyArr
        attachmentsArr.push(e.target.files[0])
        ossKeyArr.push(ossKey)
        this.setState({
            attachmentsArr,
            ossKeyArr
        })
        const resp = await fileUploader( e.target.files[0],ossKey)
        resp.teamId = this.props.teamId
        resp.size = fileSize
        resp.dir = '/'
        resp.fileName = fileName
        resp.ossKey = ossKey
        let todoAttachments = this.state.todoAttachments
        todoAttachments = [...todoAttachments, resp]
        this.setState({
            todoAttachments,
        })
    }

    deleteFile = async (e, index) => {
        let todoAttachments = this.state.todoAttachments
        todoAttachments.splice(index,1);
        this.setState({
            todoAttachments,
        })
    }


    handleConfirm = async() => {
        const params = {}
        if (this.props.id) {
            params.id = this.props.id
        }
        params.name = this.refs.name.value
        params.ossKeyArr = this.state.ossKeyArr
        params.attachmentsArr = this.state.attachmentsArr
        if (this.props.detail === 'detail') {
            params.desc =  this.state.todoDesc
            params.fileList =  this.state.todoAttachments
        }
        params.assigneeId = this.state.assigneeId
        params.date = this.state.date
        // 调用父组件方法，把提交参数传出去
        const resp = await this.props.handleConfirm(params);
        if (resp.state.code === 0) {
            if (this.refs.name)
                this.refs.name.value = ''
        }

        if (this.props.closeAfterConfirm === false) {
            this.setState({assigneeId: null})
            this.setState({date: null})
        }
    }

    handleClose = (e) => {
        // 输入框重置
        this.state.assigneeId = null
        this.state.date = null
        this.props.handleClose()
        e.stopPropagation()
    }

    handleAssigneeChange = (e) => {
        this.setState({assigneeId: e.target.value});
    }

    handleDateChange = (e) => {
        this.setState({date: e.target.value});
    }



    render() {
        const _props = this.props
        // console.log(_props)
        return (
            <div className="todo">
                <div className='check-box-disable'></div>
                <div className="todo-wrap">
                    <input ref="name"
                           className="dashed-input"
                           placeholder={_props.createInput}
                           defaultValue={_props.value?_props.value:''}
                           onKeyDown={(event)=>{if(event.keyCode== "13"){this.handleConfirm()}}}
                           autoFocus>
                           
                    </input>
                    <ItemLabel assigneeId = {this.state.assigneeId}
                               date = {this.state.date}
                               memberList={_props.memberList}
                               handleDateChange={this.handleDateChange.bind(this)}
                               handleAssigneeChange={this.handleAssigneeChange.bind(this)}>
                    </ItemLabel>
                    {   _props.detail === 'detail' &&
                        <Editor handleContentChange={this.handleTodoDescChange.bind(this)}
                                handleFileUpload={this.fileUploadHandle.bind(this)}
                                content={this.state.todoDesc}
                                deleteFile={this.deleteFile.bind(this)}
                                attachments={this.state.todoAttachments}></Editor>
                    }
                    <div className="buttons">
                        <button className="confirm"
                                onClick={this.handleConfirm}>{_props.confirmLabel}</button>
                        <button onClick={this.handleClose}>取消</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditTodo
