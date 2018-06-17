import * as React from 'react';
import EditTodoList from './editTodoList'
import TodoItem from '../todoItem'
import NewTodo from '../editTodo'
import './style.scss'

class TodoList extends React.Component {
    state = {
        // mode 任务框模式, edit 或者 read
        mode: 'read',
        showCreateTodo: false,
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
        const doneList = _props.list.filter((todo) => {
            return todo.hasDone === true
        })
        const todoList = _props.list.filter((todo) => {
            return todo.hasDone === false
        })
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
                            <h4 className="todolist-name">
                                <div className="name-actions">
                                    <i className="icon iconfont"
                                       onClick={_props.handleTodoListDelete}>&#xe70b;</i>
                                    <i className="icon iconfont"
                                       onClick={(e) => {
                                           console.log('edit')
                                           this.setMode('edit')
                                           e.stopPropagation()
                                       }}>&#xe6ec;</i>
                                </div>
                                {_props.name}
                            </h4>
                        </div>
                }

                {
                    todoList.map((todo) => {
                        return (
                            <TodoItem
                                {...todo}
                                key={todo.id}
                                memberList={_props.memberList}
                                // handleAssigneeChange={this.handleAssigneeChange.bind(this,todo.id)}
                                // handleDateChange={this.handleDateChange.bind(this,todo.id)}
                                // handleTodoModify={this.handleTodoModify.bind(this,todo.id )}
                                // handleTodoDelete={this.handleTodoDelete.bind(this,todo.id )}
                                // handleTodoCheck={this.handleTodoCheck.bind(this,todo.id)}
                            />
                        )
                    })
                }

                {
                    listType === 'classification' && (
                        this.state.showCreateTodo?
                            <NewTodo
                                memberList={_props.memberList}
                                confirmLabel="添加任务"
                                handleConfirm={_props.handleTodoCreate}
                                handleClose={(() => {this.setState({showCreateTodo: false})}).bind(this)}>
                            </NewTodo>
                            :<div onClick={(e) => {
                                this.setState({showCreateTodo: true})
                                e.stopPropagation()
                            }}>添加新任务</div>
                    )
                }

                {
                    doneList.map((todo) => {
                        return (
                            <TodoItem
                                {...todo}
                                key={todo.id}
                                memberList={_props.memberList}
                                // handleAssigneeChange={this.handleAssigneeChange.bind(this,todo.id)}
                                // handleDateChange={this.handleDateChange.bind(this,todo.id)}
                                // handleTodoModify={this.handleTodoModify.bind(this,todo.id )}
                                // handleTodoDelete={this.handleTodoDelete.bind(this,todo.id )}
                                // handleTodoCheck={this.handleTodoCheck.bind(this,todo.id)}
                            />
                        )
                    })
                }
            </div>
        )
    }
}

export default TodoList
