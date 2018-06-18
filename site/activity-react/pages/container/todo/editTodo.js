import * as React from 'react';
import './style.scss'
import ItemLabel from './itemLabel'


class EditTodo extends React.Component {
    state = {
        assigneeId: this.props.assigneeId || null,
        date: this.props.date || null,
    }

    handleConfirm = async() => {
        const params = {}
        if (this.props.id) {
            params.id = this.props.id
        }
        params.name = this.refs.name.value
        params.assigneeId = this.state.assigneeId
        params.date = this.state.date
        // 调用父组件方法，把提交参数传出去
        const resp = await this.props.handleConfirm(params);
        console.log('handleConfirm', resp)
        if (resp.status === 200 ||resp.status === 201) {
            this.refs.name.value = ''
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
        console.log(e.target.value);
        this.setState({assigneeId: e.target.value});
    }

    handleDateChange = (e) => {
        console.log('h', e.target.value);
        this.setState({date: e.target.value});
    }

    render() {
        const _props = this.props
        console.log(_props)
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