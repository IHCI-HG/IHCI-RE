import * as React from 'react';
import '../style.scss'

class EditTodoList extends React.Component {

    handleConfirm = () => {
        console.log('handleConfirm')
        const params = {}
        // id 可以在之前绑定
        // if (this.props) {
        //     params.id = this.props.id
        // }
        params.name = this.refs.name.value
        this.props.handleConfirm(params);
        this.refs.name.value = ''
    }

    handleClose = (e) => {
        // 输入框重置
        this.props.handleClose()
        e.stopPropagation()
    }

    static defaultProps = {
        defaultValue: ''
    }

    render() {
        const _props = this.props
        console.log(_props)
        return (
            <div className="todo">
                <div className="todo-wrap">
                    <input ref="name"
                           className="dashed-input"
                           placeholder="输入清单名"
                           defaultValue={_props.defaultValue}>
                    </input>
                    <div className="buttons">
                        <button className="confirm"
                                onClick={this.handleConfirm}>{_props.confirmLabel}</button>
                        <button onClick={this.handleClose}>取消</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditTodoList