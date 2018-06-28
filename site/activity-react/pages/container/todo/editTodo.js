import * as React from 'react';
import './style.scss'
import ItemLabel from './itemLabel'


class EditTodo extends React.Component {
    state = {
        assigneeId: this.props.assigneeId || null,
        date: this.props.date || null,
    }

    static defaultProps = {
        detail: '',
        closeAfterConfirm: true,
    }

    componentWillUnmount() {
        this.setState({assigneeId: null})
        this.setState({date: null})
    }

    handleConfirm = async() => {
        const params = {}
        if (this.props.id) {
            params.id = this.props.id
        }
        params.name = this.refs.name.value
        if (this.props.detail === 'detail')
            params.desc = this.refs.desc.value
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
        // console.log(e.target.value);
        this.setState({assigneeId: e.target.value});
    }

    handleDateChange = (e) => {
        // console.log('h', e.target.value);
        this.setState({date: e.target.value});
    }

    componentWillUnmount() {
        // 如果是修改todoItem，请求成功后组件将注销
        this.setState({assigneeId: null})
        this.setState({date: null})
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
                           placeholder="任务名"
                           defaultValue={_props.value?_props.value:''}>
                    </input>
                    <ItemLabel assigneeId = {this.state.assigneeId}
                               date = {this.state.date}
                               memberList={_props.memberList}
                               handleDateChange={this.handleDateChange.bind(this)}
                               handleAssigneeChange={this.handleAssigneeChange.bind(this)}>
                    </ItemLabel>
                    {   _props.detail === 'detail' &&
                        <input className="todo-desc" ref="desc" defaultValue={_props.desc?_props.desc:''}>
                        </input>
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