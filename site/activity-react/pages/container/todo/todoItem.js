import * as React from 'react';
import shallowEqualIgnoreFun from '../../../utils/pure-render/shallowEqualIgnoreFun'
import EditTodo from './editTodo'
import './style.scss'
import ItemLabel from './itemLabel'
import { timeBefore } from '../../../utils/util'


// 通用item: todo&check
class TodoItem extends React.Component {
    state = {
        // mode 任务框模式, edit 或者 read
        mode: 'read',
    }

    static defaultProps = {
        detail: '',
        type: 'todo'
    }

    setMode(mode) {
        // console.log('setMode:', mode);
        this.setState({ mode: mode })
    }

    // 中间步骤省略？
    handleSave = async(params) =>{
        const resp = await this.props.handleTodoModify(params)
        // console.log('resp', resp)
        if (resp.status === 200 ||resp.status === 201) {
            this.setMode('read')
        }
        return resp
    }

    handleClose = () => {
        this.setMode('read')
    }

    caculateHasDoneNum = () => {
        let hasDoneNum = 0;
        if (this.props.list) {
            hasDoneNum = this.props.list.filter(function (item) {
                return item.hasDone === true
            }).length;
        }
        return hasDoneNum
    }

    caculateStyle = () => {
        if (this.props.type === 'check') {
            // check
            if (this.props.hasDone === true) {
                return 'check-complete'
            }
            return 'check'
        } else {
            // todo
            if (this.props.hasDone === true) {
                return 'todo-complete'
            }
            return 'todo'
        }
    }


    shouldComponentUpdate (nextProps, nextState) {
        // console.log(this.props.id,'props', shallowEqualIgnoreFun(this.props, nextProps))
        // console.log(this.props.id,'state', shallowEqualIgnoreFun(this.state, nextState))
        return (
            !shallowEqualIgnoreFun(this.props, nextProps) ||
            !shallowEqualIgnoreFun(this.state, nextState)
        );
    }

    render() {
        const _props = this.props
        console.log('todoitem渲染', _props.id)
        // console.log('_props', _props)

        if (this.state.mode === 'edit') {
            return (
                <div>
                    <EditTodo
                        assigneeId={_props.assignee?_props.assignee.id:null}
                        date={_props.ddl}
                        id={_props.id}
                        value={_props.name}
                        memberList={_props.memberList}
                        detail={_props.detail}
                        desc={_props.desc}
                        confirmLabel="保存"
                        handleConfirm={this.handleSave.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                    ></EditTodo>
                </div>
            )
        }

        const hasDoneNum = this.caculateHasDoneNum()
        const componentClass = this.caculateStyle()

        return (
            <div className={componentClass}>
                <div className="actions-wrap">
                    <div className="actions">
                        <i className="icon iconfont"
                           onClick={_props.handleTodoDelete}
                        >&#xe70b;</i>
                        {
                            !_props.hasDone &&
                            <i className="icon iconfont"
                               onClick={(e) => {
                                   // console.log('edit')
                                   this.setMode('edit')
                                   e.stopPropagation()
                               }}>
                                &#xe6ec;
                            </i>
                        }
                    </div>
                </div>
                <div className={`${_props.hasDone ? 'check-box-checked' : 'check-box'}`}
                     onClick={_props.handleTodoCheck.bind(this, _props.hasDone)}>
                    <i className="icon iconfont checked-icon">&#xe750;</i>
                </div>
                <div className="todo-wrap">
                    <span className="name"
                        onClick={() => {
                            if (_props.detail === 'detail' || _props.type === 'check')
                                return
                            location.href = `/todo/${this.props.id}`
                    }}>
                        {_props.name}
                    </span>
                    {/*如果存在item计数，优先使用*/}
                    {
                        (_props.list&& _props.list.length>0)
                            ?<span className="todo-progress">{`${hasDoneNum}/${_props.list != null && _props.list.length}`}</span>
                            :(_props.checkItemNum &&<span className="todo-progress">{_props.checkItemDoneNum}/{_props.checkItemNum}</span>)
                    }
                    { _props.checkItem && <i className="icon iconfont todo-twr">&#xe6e7;</i> }

                    { _props.hasDone?
                        <span>
                            <span className="remark">{_props.assignee&&_props.assignee.username}</span>
                            <span className="remark">{timeBefore(_props.completeTime)}</span>
                        </span>
                        :< ItemLabel
                            // 使用用户传入，不用id
                            assigneeId={_props.assignee?_props.assignee.id:null}
                            date={_props.ddl}
                            memberList={_props.memberList}
                            handleDateChange={_props.handleDateChange}
                            handleAssigneeChange={_props.handleAssigneeChange}>
                        </ItemLabel>
                    }
                    {   _props.detail === 'detail' &&
                    <div className="todo-desc">{_props.desc}</div>
                    }
                </div>
            </div>
        )
    }
}

export default TodoItem
