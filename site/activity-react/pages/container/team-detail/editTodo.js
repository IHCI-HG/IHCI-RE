import * as React from 'react';
import './style.scss'


class EditTodo extends React.Component {
    state = {
        showLabelEditBoard: false,
    }
    handleCreate = () => {
        const content = this.refs.content.value
        const assignee = null
        const checkItem = null
        this.props.handleCreate({
            content,
            assignee,
            checkItem
        });
    }
    render() {
        const _props = this.props
        return (
            <div className="todo">
                <div className='check-box-disable'></div>
                <div className="todo-wrap">
                    <input ref="content"></input>
                    <span className="todo-label"
                          onClick={() => {
                              const showLabelEditBoard = !this.state.showLabelEditBoard
                              this.setState({ showLabelEditBoard })
                          }}>
                        <span className="assignee">huang</span>
                        <span className="due">2017.1.1</span>
                        {
                            this.state.showLabelEditBoard &&
                            <div className="todo-label-edit">
                                <div className="arrow"></div>
                                <div>
                                    <label>将任务指派给</label>
                                    <select>
                                        <option value ='-1'>未指定</option>
                                        {
                                            _props.memberList.map((item) => {
                                                return (
                                                    <option value ={item._id} key={item._id}>
                                                        {item.name}
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label>任务截止时间</label>
                                    <input type="date"></input>
                                </div>
                            </div>
                        }
                    </span>
                    <div className="buttons">
                        <button className="confirm"
                                onClick={this.handleCreate}>确定</button>
                        <button onClick={_props.handleClose}>取消</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditTodo