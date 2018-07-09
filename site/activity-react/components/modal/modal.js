import * as React from 'react';
import './style.scss';

export default class Modal extends React.Component {
    render() {
        return (
            <div> 
                {this.props.children}
            </div>
        )
    }
}
