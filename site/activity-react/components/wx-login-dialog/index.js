import * as React from 'react';
import './style.scss'

/*
props: {
    url: String
    state: String
    closeHandle: Function
}
*/

class WxLoginDialog extends React.Component{
    componentDidMount = async() => {
        var obj = new WxLogin({
            id:"login_container", 
            appid: "wx50a231aefaff3222", 
            scope: "snsapi_login", 
            redirect_uri: this.props.url ||  encodeURIComponent(location.origin + '/wxLogin'),
            state: this.props.state || "auth",
        });
    }
    render() {
        return(
            <div className={`wx-login-dialog`}>
                <div className="close iconfont icon-close" onClick={this.props.closeHandle}></div>
                <div className="qr-code-container" id="login_container"></div>
            </div>
        )
    }
}

export default WxLoginDialog