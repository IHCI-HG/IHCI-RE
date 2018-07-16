import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'

import api, { authApi } from '../../utils/api';
import WxLoginDialog from '../../../components/wx-login-dialog'
import { LoginView } from '../../../components/login-view';

export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA)
        if(INIT_DATA.login) {
            this.setState({
                login: true
            })
        }
        else{
            window.toast("请先登录或注册")
        }
        if(INIT_DATA.teamObj) {
            this.setState({
                teamObj: INIT_DATA.teamObj
            })
        }
    }

    showWxDialogHandle = () => {
        this.setState({
            showWxDialog: true
        })
    }

    state = {
        login: false,
        teamObj: {},

        showWxDialog: false,
    }

    hideWxDialogHandle = () => {
        this.setState({
            showWxDialog: false
        })
    }

    joinBtnHandle = async () => {
        const result = await api('/api/team/join', {
            method: 'POST',
            body: {
                teamId: this.state.teamObj._id
            }
        })
        window.toast(result.state.msg)
        
        setTimeout(() => {
            if(result.state.code == 0) {
                location.href = "/team/" + this.state.teamObj._id
            }
        }, 400);

    }

    render() {
        console.log(this)
        return(
            <Page title='加入团队 - IHCI' className="join-team">
            
            {
                this.state.showWxDialog && <WxLoginDialog state="auth" closeHandle={this.hideWxDialogHandle}/>
            }
                <div className="nav">
                    <div className="max-w-con nav-con">
                        <div className="logo">IHCI(换成图)</div>
                    </div>
                </div>
                <div className="banner">
                    <div className='h1'>All for the valuable code.</div>
                    <div className="banner-con max-w-con">
                    {
                        this.state.login ? 
                        <div className='join-box'>
                            <img className='team-img' src={this.state.teamObj.teamImg}></img>
                            <div className='team-name'>{this.state.teamObj.name}</div>
                            <div className='join-btn' onClick={this.joinBtnHandle}>点击加入团队</div> 
                        </div>
                        : 
                        <div className='reg-box'>
                            <span className='reg-msg'>您尚未登录</span>
                            <div className='reg-item'>
                                
                                <LoginView  join={true} showWxDialogHandle={this.showWxDialogHandle}/>
                            </div>
                        </div>
                    }
                    </div>
                    
                </div>
        
                <div className="footer">
                    <div className="footer-list max-w-con">
                        <div className="foot-item">
                            <div className="foot-item-title">IHCI</div>
                            <div href="">关于我们</div>
                        </div>
                        <div className="foot-item">
                            <div className="foot-item-title">分类</div>
                            <div href="">软件工程</div>
                            <div href="">人机交互</div>
                            <div href="">人工智能</div>
                        </div>
                        <div className="foot-item">
                            <div className="foot-item-title">编程课程</div>
                            <div href="">HTML&CSS</div>
                            <div href="">JavaScript</div>
                            <div href="">Python</div>
                        </div>
                        <div className="foot-item">
                            <div className="foot-item-title">资源</div>
                            <div href="">参考链接</div>
                        </div>
                    </div>
                </div>
            </Page>)
    }
}


