import * as React from 'react';
import EditTodo from './editTodo'
import './style.scss'


class TodoItem extends React.Component {
    state = {
        // mode 任务框模式, edit 或者 read
        mode: 'read',
    }

    setMode(mode) {
        console.log('setMode:', mode);
        this.setState({ mode: mode })
    }

    handleClose = () => {
        this.setMode('read')
    }

    render() {
        const _props = this.props
        console.log(_props.assignee,_props.date)
        if (this.state.mode === 'edit') {
            return (
                <EditTodo
                    assigneeId={_props.assignee?_props.assignee.id:null}
                    date={_props.ddl}
                    value={..._props}
                    memberList={_props.memberList}
                    confirmLabel="保存"
                    handleConfirm={_props.handleTodoModify}
                    handleClose={this.handleClose.bind(this)}
                ></EditTodo>
            )
        }

        let hasDoneNum = 0;
        if (this.props.checkItem) {
            hasDoneNum = this.props.checkItem.filter(function (item) {
                return item.hasDone === true
            }).length;
        }

        return (
            <div className="todo">
                <div className="actions">
                    <i className="icon iconfont">&#xe70b;</i>
                    {
                        !_props.hasDone &&
                        <i className="icon iconfont"
                           onClick={(e) => {
                               console.log('edit')
                               this.setMode('edit')
                               e.stopPropagation()
                           }}>
                            &#xe6ec;
                        </i>
                    }
                </div>
                <div className={`${_props.hasDone ? 'check-box-checked' : 'check-box'}`}
                     onClick={_props.handleTodoCheck}>
                    <i className="icon iconfont checked-icon">&#xe750;</i>
                </div>
                <div className="todo-wrap">
                    <span>{_props.name}</span>
                    {   (_props.checkItem != null && _props.checkItem.length>0) &&
                        <span className="todo-progress">
                            {`(${hasDoneNum}/${_props.checkItem != null && _props.checkItem.length})`}
                        </span>
                    }
                    { _props.checkItem && <i className="icon iconfont todo-twr">&#xe6e7;</i> }
                    <span className="todo-label">
                        { _props.assignee?
                            <span className="assignee">{_props.assignee.username}</span>
                            : <span className="assignee">未指派</span>
                        }
                        {
                            _props.ddl && <span className="due">{_props.ddl}</span>
                        }
                    </span>
                </div>
            </div>
        )
    }
}

export default TodoItem