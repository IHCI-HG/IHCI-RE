import React from 'react';
import ReactDOM from 'react-dom';
import Modal from './modal';

const show = (props) => {
    let component = null;
    const div = document.createElement('div');
    document.body.appendChild(div);

    const onClose = () => {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);

        if (typeof props.onClose === 'function') {
            props.onClose();
        }
    }

    ReactDOM.render(
        <Modal
            {...props}
            onClose={onClose}
            ref={c => component = c}
            isOpen
        >{props.content}</Modal>, div
    );
    return () => component.close();
}

const ModalBox = {};
ModalBox.confirm = (props) => show({
    ...props,
    type: 'confirm'
});

ModalBox.alert = (props) => show({
    ...props,
    type: 'alert'
});

ModalBox.error = (props) => show({
    ...props,
    type: 'error'
});

ModalBox.success = (props) => show({
    ...props,
    type: 'success'
});

export default ModalBox;
