import * as React from 'react';
import './style.scss'
import sampleqr from './sample-qr.png'

/*
props: {
    url: String
    state: String
    closeHandle: Function
}
*/

class FollowDialog extends React.Component{
    componentDidMount = async() => {
    }

    render() {
        return(
            <div className={`follow-service-dialog`}>
                <div className="close iconfont icon-close" onClick={this.props.closeHandle}></div>
                <div className="content-box">
                    <div className='title'>关注服务号</div>
                    <div className='img-box'>
                        <img className='qr-img' src={require('./sample-qr.png')}/>
                    </div>
                    <div className='msg'>请使用微信扫描二维码关注</div>
                    <div className='msg'>“智能人机交互实验室”服务号</div>
                </div>
            </div>
        )
    }
}

export default FollowDialog