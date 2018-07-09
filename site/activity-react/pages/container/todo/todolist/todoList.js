import * as React from 'react'
import shallowEqualIgnoreFun from '../../../../utils/pure-render/shallowEqualIgnoreFun'
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

    static defaultProps = {
        list: [],
        listType: 'classification'
    }

    setMode(mode) {
        console.log('setMode:', mode);
        this.setState({ mode: mode })
    }

    handleSave = async(params) =>{
        this.setMode('read')
        const resp = await this.props.handleTodoListModify(params)
        return resp
    }

    handleClose = () => {
        this.setMode('read')
    }

    shouldComponentUpdate (nextProps, nextState) {
        // 因为有函数bind,影响短路优化,这里忽略函数变化,因为函数在这里不会改变，其他地方使用影响未知
        // console.log(this.props.id,'props', shallowEqualIgnoreFun(this.props, nextProps))
        // console.log(this.props.id,'state', shallowEqualIgnoreFun(this.state, nextState))
        return (
            !shallowEqualIgnoreFun(this.props, nextProps) ||
            !shallowEqualIgnoreFun(this.state, nextState)
        );
    }

    render() {
        const _props = this.props
        const listType = _props.listType
        const doneList = _props.list.filter((todo) => {
            return todo.hasDone === true
        })
        const todoList = _props.list.filter((todo) => {
            return todo.hasDone === false
        })
        console.log('todolist渲染', _props.id)
        console.log('list', _props.list)

        return (
            <div className="todolist">
                {
                    listType === 'classification' && (
                    this.state.mode === 'edit'
                        ? <EditTodoList
                            confirmLabel="保存"
                            defaultValue={_props.name}
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
                    )
                }

                {
                    todoList.map((todo) => {
                        return (
                            <TodoItem
                                {...todo}
                                key={todo.id}
                                memberList={_props.memberList}
                                handleAssigneeChange={_props.handleAssigneeChange.bind(this,todo.id)}
                                handleDateChange={_props.handleDateChange.bind(this,todo.id)}
                                handleTodoModify={_props.handleTodoModify.bind(this,todo.id )}
                                handleTodoDelete={_props.handleTodoDelete.bind(this,todo.id )}
                                handleTodoCheck={_props.handleTodoCheck.bind(this, todo.id)}
                            />
                        )
                    })
                }

                {/*归类list*/}
                {
                    listType === 'classification' && (
                        this.state.showCreateTodo?
                            <NewTodo
                                memberList={_props.memberList}
                                confirmLabel="添加任务"
                                closeAfterConfirm={false}
                                handleConfirm={_props.handleTodoCreate}
                                handleClose={(() => {this.setState({showCreateTodo: false})}).bind(this)}>
                            </NewTodo>
                            :<div className="new-todo"
                                  onClick={(e) => {
                                    this.setState({showCreateTodo: true})
                                    e.stopPropagation()}}>添加新任务</div>
                    )
                }

                {/*未归类list*/}
                {
                    listType !== 'classification' && (
                        _props.showCreateTodo &&
                            <NewTodo
                                memberList={_props.memberList}
                                confirmLabel="添加任务"
                                closeAfterConfirm={false}
                                handleConfirm={_props.handleTodoCreate}
                                handleClose={_props.handlecloseEditTodo}>
                            </NewTodo>
                    )
                }


                {
                    doneList.map((todo,index) => {
                        return (
                            <TodoItem
                                {...todo}
                                key={todo.id}
                                memberList={_props.memberList}
                                handleTodoDelete={_props.handleTodoDelete.bind(this,todo.id)}
                                handleTodoCheck={_props.handleTodoCheck.bind(this, todo.id)}
                            />
                        )
                    })
                }
            </div>
        )
    }
}

export default TodoList
