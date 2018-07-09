import * as React from 'react';
import './style.scss';

const modalOpenClass = 'modal-open';

const toggleBodyClass = (isOpen) => {
    if (isOpen) {
        document.body.classList.add(modalOpenClass);
    } else {
        document.body.classList.remove(modalOpenClass);
    }
}

const bindMethods = (methods, obj) => {
    methods.forEach(func => {
        if(typeof func === 'function') {
            obj[func] = obj[func].bind(this);
        }
    })
}

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        bindMethods(['onCancelClick', 'onOkClick', 'close'], this)
        this.state = {
            isOpen: props.isOpen || false
        };
    }
    componentWillReceiveProps = (nextProps) => {
        if ('isOpen' in nextProps) {
            this.setState({
                isOpen: nextProps.isOpen
            });
        }
    }

    close = () => {
        this.setState({
            isOpen: false
        });
        toggleBodyClass(false);
    }
    // 点击确认回调函数
    onOkClick = () => {
        this.props.onOk();
        this.close();
    }
    // 点击取消的回调函数
    onCancelClick = () => {
        this.props.onCancel();
        this.close();
    }

    render() {
        const {
            title,
            children,
            className,
            okText,
            cancelText,
            onOk,
            onCancel,
            maskClosable
        } = this.props;
        return (
            <div className={`modal-container${className}`} onClick={maskClosable ? this.close : () => {}}>
            <div className="modal-body">
                <div className={`modal-title`}>{title}</div>
            <div className="modal-content">{children}</div>
            <div className="modal-footer">
                <button className="ok-btn" onClick={this.onOkClick}>{okText}</button>
                <button className="cancel-btn" onClick={this.onCancelClick}>{cancelText}</button>
            </div>
            </div>
        </div>
        );
    }
}

Modal.defaultProps = {
    className: '',
    maskClosable: true,
    onCancel: () => { },
    onOk: () => { },
    okText: 'OK',
    cancelText: 'Cancel'
}
