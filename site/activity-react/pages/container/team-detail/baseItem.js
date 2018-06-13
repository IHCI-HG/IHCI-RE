import * as React from 'react';
import './style.scss'


class baseItem extends React.Component {
    render() {
        return (
            <div className="todo">
                <div>
                    <div className='check-box-disable'>
                    </div>
                </div>
                <div className="todo-wrap">
                    <span className="todo-label">
                        <span className="assignee">huang</span>
                        <span className="due">2017.1.1</span>
                    </span>
                </div>
            </div>
        )
    }
}


class LeftIcon extends React.Component {
    render() {
        return (
            <div>
               11111111
            </div>
        )
    }
}



class CreateItem extends React.Component {
    render() {
        return (
            <BaseItem leftIcon={<LeftIcon />} content={<LeftIcon />}></BaseItem>
        )
    }
}


class BaseItem extends React.Component {
    render() {
        return (
            <div className="todo">
                {this.props.leftIcon}
                <div className="todo-wrap">
                    {this.props.content}
                    <span className="todo-label">
                        <span className="assignee">huang</span>
                        <span className="due">2017.1.1</span>
                    </span>
                </div>
            </div>
        )
    }
}


export default CreateItem