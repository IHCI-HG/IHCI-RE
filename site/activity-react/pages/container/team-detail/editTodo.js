import * as React from 'react';
import './style.scss'


class EditTodo extends React.Component {
    render() {
        return (
            <div className="todo">
                <div className='check-box-disable'></div>
                <div className="todo-wrap">
                    <input ></input>
                    <span className="todo-label">
                        <span className="assignee">huang</span>
                        <span className="due">2017.1.1</span>
                    </span>
                    <div className="buttons">
                        <button className="confirm">确定</button>
                        <button>取消</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditTodo