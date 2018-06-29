import * as React from 'react';
var conf = require('../../../../../server/conf')
import './style.scss'
import fetch from 'isomorphic-fetch';
import api from '../../../utils/api';
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'

export default class Team extends React.Component{
    componentDidMount = async() => {
        this.personInfo = {}
        console.log(INIT_DATA);

        if(INIT_DATA.userObj) {
            this.setState({
                userObj: INIT_DATA.userObj,
                personInfo: INIT_DATA.userObj.personInfo || {
                    name: '',
                    mail: '',
                    phone: '',
                    headImg: INIT_DATA.userObj && INIT_DATA.userObj.wxUserInfo && INIT_DATA.userObj.wxUserInfo.headimgurl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnregyyDrMvhEDpfC4wFetzykulWRVMGF-jp7RXIIqZ5ffEdawIA',
                }
            })
        } else {
            // todo 可以优化为客户端渲染
            window.location.reload()
        }

        if(INIT_DATA.userObj.wxUserInfo) {
            this.setState({
                ...this.state.personInfo,
                headImg: INIT_DATA.userObj.wxUserInfo.headimgurl
            })
        }

        if(this.props.location.query.alreadyBind) {
            window.toast("该微信号已经绑定")
            history.pushState({}, {}, '/person')
        }
         this.testPub()
    }

    testPub =  ()=> {

        const redirect_uri = encodeURIComponent(location.origin + '/wxLogin') 
        const state = "pub"
        const result = await fetch(`https://api.weixin.qq.com/connect/oauth2/authorize?appid=${conf.pubAppId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`)
       const data = await result.json()
        return data
        // const result = await api('/wxReceiver', {
        //     method: 'POST',
        //     body: {
        //             xml:
        // { tousername:  'gh_15a5ec8f6116' ,
        //   fromusername:  'oC9vJwnxrquE5Ss2PEL49TX-3hpI' ,
        //   createtime:  '1526454558' ,
        //   msgtype:  'event' ,
        //   event:  'subscribe' ,
        //   eventkey:  ''  } } 

            
        // })
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
        showWxLogin: false,
        userObj: {},
        personInfo: {
            // name: '阿鲁巴大将军',
            // headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
            // phone: '17728282828',
            // mail: 'ada@qq.com',
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
    nameInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                name: e.target.value
            }
        })
    }
    phoneInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                phone: e.target.value
            }
        })
    }
    mailInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                mail: e.target.value
            }
        })
    }

    openWxLoginHandle = () => {
        this.setState({
            showWxLogin: true
        })
    }

    closeWxLoginHandle = () => {
        this.setState({
            showWxLogin: false
        })
    }


    saveHandle = async () => {
        const result = await api('/api/setUserInfo', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })

        if(result.state.code === 0) {
            window.toast("设置成功")
            setTimeout(() => {
                location.href = location.href
            }, 300);
        } else {
            window.toast("设置失败，请稍后再试")
        }
    }

    logOutHandle = async () => {
        const result = await api('/api/logout', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })

        if(result.state.code === 0) {
            location.href = '/'
        }

    } 

    unbindHandle = async () => {
        const result = await api('/api/unbindWechat', {
            method: 'POST',
            body: {}
        })
        if(result.state.code === 0) {
            location.href = location.href
        } else {
            window.toast("解绑失败")
        }
    }
    
    
    render() {
        let personInfo = this.state.personInfo
        return (
            <Page title={"个人设置"} className="person-edit-page page-wrap">
                <div className="title">个人设置</div>

                <div className="head-edit">
                    <div className="left">
                        <img src={personInfo.headImg} className='head-img' />
                    </div>
                    <div className="right">
                        <input type="text" className="head-img-url" value={personInfo.headImg || ''} onChange={this.headImgInputHandle}/>
                        <div className="head-des">请输入头像图片URL地址</div>
                    </div>
                </div>

                <div className="edit-con">
                    <div className="before">微信</div>

                    { 
                        !!this.state.userObj.unionid ? 
                            <div className="bind-wx act">已绑定</div> 
                            : 
                            <div className="bind-wx">未绑定</div>  
                    }
                    {
                        !!this.state.userObj.unionid ? 
                            <div className="band" onClick={this.unbindHandle}>解绑</div>
                            :
                            <div className="band" onClick={this.openWxLoginHandle}>绑定</div>
                    }
                </div>

                <div className="edit-con">
                    <div className="before">服务号</div>

                    { !!this.state.userObj.subState ? <div className="bind-wx act">已关注</div> : <div className="bind-wx">未关注</div> }
                    

                    <div>需要关注服务号才能接受讨论消息提醒</div>


                </div>

                <div className="edit-con">
                    <div className="before">名字</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={personInfo.name}/>
                </div>

                <div className="edit-con">
                    <div className="before">邮箱</div>
                    <input type="text" onChange={this.mailInputHandle} className="input-edit" value={personInfo.mail}/>
                </div>

                <div className="edit-con">
                    <div className="before">手机</div>
                    <input type="text" onChange={this.phoneInputHandle} className="input-edit" value={personInfo.phone}/>
                </div>

                {/*
                    <div className="edit-con">
                        <div className="before">当前密码</div>
                        <input type="password" className="input-edit" />
                    </div>

                    <div className="edit-con">
                        <div className="before">新密码</div>
                        <input type="password" className="input-edit" />
                    </div>
                */}


                <div className="sava-btn" onClick={this.saveHandle}>保存</div>

                <div className="sava-btn" onClick={this.logOutHandle}>登出</div>
                
                {
                    this.state.showWxLogin && <WxLoginDialog state="bind" closeHandle={this.closeWxLoginHandle}/>
                }
            </Page>
        )
    }
}


