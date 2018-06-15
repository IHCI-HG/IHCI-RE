import * as React from 'react';
import EditTodoList from './editTodoList'
import './style.scss'

class TodoList extends React.Component {
    state = {
        // mode 任务框模式, edit 或者 read
        mode: 'read',
    }

    setMode(mode) {
        console.log('setMode:', mode);
        this.setState({ mode: mode })
    }

    handleSave = (params) =>{
        console.log('handleSave', params)
        this.props.handleTodoListModify(params)
        this.setMode('read')
    }

    handleClose = () => {
        this.setMode('read')
    }

    render() {
        const _props = this.props

        if (this.state.mode === 'edit') {
            return (
                <EditTodoList
                    confirmLabel="保存，开始添加任务"
                    handleConfirm={this.handleSave.bind(this)}
                    handleClose={this.handleClose.bind(this)}>
                </EditTodoList>
            )
        }

        return (
            <div className="todolist">
                <div className="actions">
                    <i className="icon iconfont">&#xe70b;</i>
                    <i className="icon iconfont"
                       onClick={(e) => {
                           console.log('edit')
                           this.setMode('edit')
                           e.stopPropagation()
                       }}>&#xe6ec;</i>
                </div>
                <h4 className="todolist-name">
                    {/*{_props.name}*/}
                    11111
                </h4>
            </div>
        )
    }
}

export default TodoList