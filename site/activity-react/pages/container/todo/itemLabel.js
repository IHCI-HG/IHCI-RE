import * as React from 'react';
import './style.scss'


class ItemLabel extends React.Component {
    state = {
        editDialog: false,
    }

    handleOpenEditDialog = () => {
        this.setState({ editDialog: true })
    }

    handleCloseEditDialog = () => {
        this.setState({ editDialog: false })
    }

    render() {
        const _props = this.props
        // console.log('memberList', _props.memberList)

        // 如果props中没有传入assigneeId，为创建todo的label
        const assignee = _props.memberList.find((item) => {
            return item._id === _props.assigneeId
        })
        // console.log('r', _props)

        return (
            <div className="todo-label">
                <span onClick={this.handleOpenEditDialog}>
                    {   assignee ?
                        <span className="assignee">{assignee.name}</span>
                        :<span className="due">未指派</span>
                    }
                    {   _props.date &&
                        <span className="due">{_props.date}</span>
                    }
                </span>
                {   this.state.editDialog &&
                    <div className="todo-label-edit">
                        <div className="arrow"></div>
                        <div>
                            <label>将任务指派给</label>
                            <select onChange={_props.handleAssigneeChange}>
                                <option value='null'>未指派</option>
                                {
                                    _props.memberList.map((item) => {
                                        return (
                                            <option value={item._id} key={item._id}>
                                                {item.name}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div>
                            <label>任务截止时间</label>
                            <input type="date" onChange={_props.handleDateChange}></input>
                        </div>
                    </div>
                }
                {   this.state.editDialog &&
                    <div className="mask" onClick={this.handleCloseEditDialog}></div>
                }
                </div>
        )
    }
}

export default ItemLabel