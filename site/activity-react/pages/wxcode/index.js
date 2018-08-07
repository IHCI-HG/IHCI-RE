import * as React from 'react';

class Wxcode extends React.Component{
    render() {
        return(
            <div className={`wx-login-dialog`}>
                <img src={require('./sample-qr.png') }/>
                <p className="text">关注公众号，加入IHCI平台</p>
            </div>
        )
    }
}

render(<Wxcode /> ,document.getElementById('app'));