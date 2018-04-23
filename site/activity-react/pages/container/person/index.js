import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'

export default class Team extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA);
        
        // var obj = new WxLogin({
        //     id:"login_container", 
        //     appid: "wx50a231aefaff3222", 
        //     scope: "snsapi_login", 
        //     redirect_uri: "http%3A%2F%2Flocalhost%3A5000%2Fauth",
        // });

        // // 小号的测试号
        var obj = new WxLogin({
            id:"login_container", 
            appid: "wx4faa94837fccf23e", 
            scope: "snsapi_login", 
            redirect_uri: "http%3A%2F%2Flocalhost%3A5000%2Fauth",
        });

        // 授权页面
        // https://open.weixin.qq.com/connect/qrconnect?appid=wx50a231aefaff3222&scope=snsapi_login&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth&login_type=jssdk

        // 授权代码

        let a = { 
            "access_token":"8_0-d85Yp1SQEO73xiNwwjncsU3E6Zfnrn9XEduR0wq9dgfXPXKpdcL9sLD1PbhGslQvrACX_t_Kxcrahx-xZCHw",
            "expires_in":7200,
            "refresh_token":"8_4DCi13aDOkncxhRYzqydfzew90IpdRk1da92qnqh9EC2Kn3C78AWyMCIWUFzjgSUIqTUEiBx3tDaOsmI-K6bnQ",
            "openid":"oAX1fwaSM-QbT-6P0bwq7Py8eWuI",
            "scope":"snsapi_login",
            "unionid":"oTq_VwKk1viNoIh98ivzt_kyEJVk"
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

    state = {
        personInfo: {
            id: 1,
            name: '阿鲁巴大将军',
            headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
            phone: '17728282828',
            mail: 'ada@qq.com',
        }
    }

    headImgInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                headImg: e.target.value
            }
        })
    }
    
    render() {
        let personInfo = this.state.personInfo
        return (
            <Page title={"个人设置"} className="person-edit-page page-wrap">
                <div className="qr-code-container" id="login_container"></div>

                <div className="title">个人设置</div>

                <div className="head-edit">
                    <div className="left">
                        <img src={personInfo.headImg} className='head-img' />
                    </div>
                    <div className="right">
                        <input type="text" className="head-img-url" value={personInfo.headImg} onChange={this.headImgInputHandle}/>
                        <div className="head-des">请输入头像图片URL地址</div>
                    </div>
                </div>

                <div className="edit-con">
                    <div className="before">名字</div>
                    <input type="text" className="input-edit" value={personInfo.name}/>
                </div>

                <div className="edit-con">
                    <div className="before">邮箱</div>
                    <input type="text" className="input-edit" value={personInfo.mail}/>
                </div>

                <div className="edit-con">
                    <div className="before">手机</div>
                    <input type="text" className="input-edit" value={personInfo.phone}/>
                </div>

                <div className="edit-con">
                    <div className="before">当前密码</div>
                    <input type="password" className="input-edit" />
                </div>

                <div className="edit-con">
                    <div className="before">新密码</div>
                    <input type="password" className="input-edit" />
                </div>

                <div className="sava-btn">保存</div>
            </Page>
        )
    }
}


