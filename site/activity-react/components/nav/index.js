import * as React from 'react';
import { createPortal } from 'react-dom';
import { autobind } from 'core-decorators'

import './style.scss'


@autobind
export default class Confirm extends React.Component {
    
    state = {
        show: false,
    }

    render() {
        return <section className={`co-dialog-container ${this.state.show ? '' : 'hide'}`}>


        </section>
        
    }

}