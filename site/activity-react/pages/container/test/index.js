import * as React from 'react';
var ReactDOM = require('react-dom')
import Modal from '../../../components/modal';
import Page from '../../../components/page'
import './style.scss'

const root = document.getElementById('app')

class Window extends React.Component {

    state = {
        text: 'initText'
    }

    onChildChanged = (newText) => {
        this.setState({
            text: newText
        })
    }

    closeWindow = () => {
        this.props.callbackParent('')
    }

    confirm = () => {
        this.props.callbackParent('this is the target dir')
    }

    render () {
        return (
            <div className="window" > 
                <div className="outerBox"> 
                    <Modal text={this.state.text} callbackParent={this.onChildChanged}> 
                        {this.text}
                    </Modal>
                    <div className="btn" onClick={this.confirm}> confirm </div>
                    <div className="btn" onClick={this.closeWindow}> close </div>
                </div>
            </div>
        )
    }
}

    
export default class Hello extends React.Component {

    state = {
        ele: document.createElement('div'),
        teamId: ''
    }

    constructor() {
        ReactDOM.render(<Window teamId={this.state.teamId} callbackParent={this.onChildChanged} />,this.state.ele)
    }

    onChildChanged = (moveTarDir) => {
        if(moveTarDir) {console.log(moveTarDir)}
        this.close()
    }

    close = () => {
        document.getElementById('app').removeChild(this.state.ele)
    }

    open = () => {
        document.getElementById('app').appendChild(this.state.ele)
    }

    render() {
        return (
            <div>
                <div className='btn' onClick={this.open}> Click Me! </div>
            </div>
        )
    }
}
