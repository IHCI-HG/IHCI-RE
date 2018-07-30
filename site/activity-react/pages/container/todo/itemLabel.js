import * as React from 'react';
import './style.scss'
import {formatDate } from '../../../utils/util'


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
        return (
            <div className="todo-label"
            data-id={this.props.dataId}
            data-item={this.props.dataItem}
            draggable='true'>
                <span onClick={this.handleOpenEditDialog}
                data-id={this.props.dataId}
                data-item={this.props.dataItem}
                draggable='true'>
                    {   assignee ?
                        <span className="assignee"
                        data-id={this.props.dataId}
                        data-item={this.props.dataItem}
                        draggable='true'>{assignee.name}</span>
                        :<span className="due"
                        data-id={this.props.dataId}
                        data-item={this.props.dataItem}
                        draggable='true'>未指派</span>
                    }
                    {   _props.date>= formatDate(new Date())?
                        <span className="due">{(_props.date)?_props.date.split("T")[0]:_props.date}</span>
                        :<span className=" due overdue">{(_props.date)?_props.date.split("T")[0]:_props.date}</span>
                    }

                </span>
                {   this.state.editDialog &&
                    <div className="todo-label-edit">
                        <div className="arrow"></div>
                        <div>
                            <label>将任务指派给</label>
                            <select onChange={_props.handleAssigneeChange} defaultValue={_props.assigneeId}>
                                <option value='null'>未指派</option>
                                {
                                    _props.memberList.map((item) => {
                                        return (
                                            <option value={item._id}
                                                    key={item._id}>
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