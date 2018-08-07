import * as React from 'react';

class Wxcode extends React.Component{
    componentDidMount = async() => {
        var obj = new WxLogin({
            id: "login_container",
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
                <p className="text">关注公众号，加入IHCI平台</p>
            </div>
        )
    }
}

render(<Wxcode /> ,document.getElementById('app'));