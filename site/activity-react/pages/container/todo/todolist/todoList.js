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
        const listType = _props.listType || 'classification'
        console.log(_props)

        return (
            <div className="todolist">
                {
                    this.state.mode === 'edit'
                        ? <EditTodoList
                            confirmLabel="保存"
                            handleConfirm={this.handleSave.bind(this)}
                            handleClose={this.handleClose.bind(this)}>
                        </EditTodoList>
                        : <div>
                            <div className="actions">
                                <i className="icon iconfont"
                                   onClick={_props.handleTodoListDelete}>&#xe70b;</i>
                                <i className="icon iconfont"
                                   onClick={(e) => {
                                       console.log('edit')
                                       this.setMode('edit')
                                       e.stopPropagation()
                                   }}>&#xe6ec;</i>
                            </div>
                            <h4 className="todolist-name">
                                {_props.name}
                            </h4>
                        </div>
                }
                {
                    listType === 'classification' &&
                        <div>添加新任务</div>
                }
            </div>
        )
    }
}

export default TodoList
