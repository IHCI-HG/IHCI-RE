import * as React from 'react'
import { createPortal } from 'react-dom';

let loadingGif = require('./loading.gif');

import './style.scss'

interface IState {
    /** 是否显示loading */
    show: boolean
}

export default class Loading extends React.Component<{}, IState> {

    state = {
        show: false
    }
    
    public show(status: boolean, timeout: number = 1000) {
        this.setState({
            show: status
        });
    }

    render () {
        return createPortal(
            <div className='co-loading' hidden={!this.state.show}>
                <div className="co-loading-box">
                    <img src={ this.state.show ? loadingGif: '' } />
                </div>
            </div>,
            document.body
        );
    }
}
