import * as React from 'react';
import './style.scss'


class ItemLabel extends React.Component {
    state = {
        editDialog: false,
    }

    // handleOpenEditDialog = () => {
    //     this.setState({ editDialog: true })
    // }
    //
    // handleCloseEditDialog = () => {
    //     this.setState({ editDialog: false })
    // }

    toggerEditDialog = () => {
        const editDialog = !this.state.editDialog
        this.setState({ editDialog })
    }

    render() {
        const _props = this.props

        // 如果props中没有传入assigneeId，为创建todo的label
        const assignee = _props.memberList.find((item) => {
            return item._id = _props.assigneeId
        })
        console.log('r', _props.date)

        return (
            <div className="todo-label">
                <span onClick={this.toggerEditDialog}>
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
                                            <option value={item.userId} key={item.userId}>
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
            </div>
        )
    }
}

export default ItemLabel