import * as React from 'react';
import { createPortal } from 'react-dom';

import './bar.scss'

interface IState {
    show: boolean
    content: string
}

class Bar extends React.Component<{}, IState> {

    state = {
        show: false,
        content: '',
    }

    show(msg: string) {
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
                    content: msg,
                });
            }, 50)
        })
    }

    render() {
        var divStyle;
        if(Number(this.state.content) > 0.9){
             divStyle = {   
                width: Number(this.state.content)*100 +'%'
              };
        }else{
        divStyle = {    
            width: Number(this.state.content)*100 +'%'
          };
        }
        // console.log(this.state.show||Number(this.state.content) != 1)
        return createPortal(
            <div className={`bar ${this.state.show||Number(this.state.content) <0.9 ? '' : 'closed'}`}>
                {/* <div className='bd'> */}
                    {/* <p className='cnt'>{this.state.content}</p> */}
                    <div className="progress" >
                    <div className="progress-inner" id="progress" style={divStyle}>
                    </div>
                {/* </div> */}
                </div>
            </div>,
            document.body
        );
    }
}

export default Bar;
