import * as React from 'react';
import './style.scss'


class ItemLabel extends React.Component {
    state = {
        editDialog: false,
        date: null,
        assigneeId: null,
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
        // const defaultDate = _props.date?

        // 如果props中没有传入
        const assignee = _props.memberList.find((item) => {
            return item._id = this.state.assigneeId
        })
        console.log('r', this.state.date)

        return (
            <div className="todo-label">
                <span onClick={this.toggerEditDialog}>
                    {   assignee ?
                        <span className="assignee">{assignee.name}</span>
                        :<span className="due">未指派</span>
                    }
                    {   this.state.date &&
                        <span className="due">{this.state.date}</span>
                    }
                </span>
                {   this.state.editDialog &&
                    <div className="todo-label-edit">
                        <div className="arrow"></div>
                        <div>
                            <label>将任务指派给</label>
                            <select onChange={this.handleAssigneeChange}>
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
                            <input type="date" onChange={this.handleDateChange}></input>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default ItemLabel