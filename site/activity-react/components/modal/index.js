import * as React from 'react';
var ReactDOM = require('react-dom')
import './style.scss';

export default class Modal extends React.Component {

    click = () => {
        var text = 'changed'
        this.props.callbackParent(text)
    }

    render () {
        return (
            <div>
                <div> {this.props.text} </div> 
                <div onClick={this.click}> clickMe </div>
            </div>
        )
    }
}