import * as React from 'react';
import './style.scss'
import ItemLabel from './itemLabel'


class EditTodo extends React.Component {
    state = {
        assigneeId: null,
        date: null,
    }

    handleConfirm = () => {
        const params = {}
        if (this.props.value) {
            params.id = this.props.value.id
        }
        params.name = this.refs.name.value
        params.assigneeId = this.state.assigneeId
        params.date = this.state.date
        // params.assignee = this.refs.label.state.assigneeId
        // params.date = this.refs.label.state.date

        // 调用父组件方法，把提交参数传出去
        this.props.handleConfirm(params);
    }

    handleClose = (e) => {
        // 输入框重置
        console.log('close')
        this.props.handleClose()
        e.stopPropagation()
    }


    handleAssigneeChange = (e) => {
        console.log(e.target.value);
        this.setState({assigneeId: e.target.value});
        // 嵌套父亲方法
    }

    handleDateChange = (e) => {
        console.log('h', e.target.value);
        this.setState({date: e.target.value});
        // 嵌套父亲方法
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
                           defaultValue={_props.value?_props.value.name:''}>
                    </input>
                    <ItemLabel ref="label"
                               assigneeId = {this.state.assigneeId}
                               date = {this.state.date}
                               handleDateChange={this.handleDateChange.bind(this)}
                               handleAssigneeChange={this.handleAssigneeChange.bind(this)}
                               memberList={_props.memberList}>
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