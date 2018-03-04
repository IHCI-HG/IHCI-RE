import * as React from 'react';
import { createPortal } from 'react-dom';
import { autobind } from 'core-decorators'

import './toast.scss'

interface IState {
    show: boolean
    content: string
}

@autobind
class Toast extends React.Component<{}, IState> {

    state = {
        show: false,
        content: '',
    }

    show(msg: string, timeout: number = 1000) {
        if (this.state.show) {
            return;
        }

        this.setState({
            show: true,
            content: msg
        }, () => {
            setTimeout(() => {
                this.setState({
                    show: false,
                    content: '',
                });
            }, timeout)
        })
    }

    render() {
        return createPortal(
            <div className={`toast ${this.state.show ? '' : 'closed'}`}>
                <div className='bd'>
                    <p className='cnt'>{this.state.content}</p>
                </div>
            </div>,
            document.body
        );
    }
}

export default Toast;
