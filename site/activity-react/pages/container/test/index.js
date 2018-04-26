import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'


export default class Team extends React.Component{
    componentDidMount = async() => {
        var obj = new WxLogin({
            id:"login_container", 
            appid: "wx50a231aefaff3222", 
            scope: "snsapi_login", 
            redirect_uri: "http%3A%2F%2Flocalhost%3A5000%2Ftest",
            state: "auth",
        });

        // 小号的测试号
        // var obj = new WxLogin({
        //     id:"login_container", 
        //     appid: "wx87136e7c8133efe3", 
        //     scope: "snsapi_userinfo", 
        //     redirect_uri: "http%3A%2F%2Flocalhost%3A5000%2Fauth",
        // });

        // 授权页面
        // https://open.weixin.qq.com/connect/qrconnect?appid=wx50a231aefaff3222&scope=snsapi_login&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth&login_type=jssdk

        // 授权代码

        let a = {
            "access_token": "9_y1ySzUrSA2mh6E6kNcpG7tLw05ynnntdg9wm5rsyyi0mktzD10bCYqPaP7_QTPw1oXPh_1dlc3cedxmot0l8Vw",
            "expires_in": 7200,
            "refresh_token": "9_g4Xhu1FwwV_TIBD-371xIXE2G8vA0tma8upaK7nVnH0-GbNnOtcknkmviA3UDhKafMYSyLDuxKSeucGzRmgLjg",
            "openid": "oAX1fwRD4MfWXbsP5NJdUX4l2kGU",
            "scope": "snsapi_login",
            "unionid": "oTq_VwNhsB143AYULDVgm7PTQaLI"
        }

        // 获取用户信息
        // https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID
    }

    starHandle = async (id) => {
        const result = await api('/api/base/sys-time', {
            method: 'GET',
            body: {}
        })
        if(result) {
            const teamList = this.state.teamList
            teamList.map((item) => {
                if(item.id == id) {
                    item.marked = !item.marked
                }
            })
            this.setState({
                teamList: teamList
            })
        }
    }

    render() {
        return (
            <Page title="这是个测试用页面" className='test-page'>
                <div className="qr-code-container" id="login_container"></div>
            </Page>
        )
    }
}


