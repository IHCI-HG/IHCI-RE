import * as React from 'react';
import { render } from 'react-dom';
import { autobind } from 'core-decorators';

import Page from '../../components/page';

import api, { authApi } from '../../utils/api';
import * as ui from '../../utils/ui';

import './style.scss'
import '../../commen/style.scss'
import { loading } from '../../utils/ui';

import WxLoginDialog from '../../components/wx-login-dialog'

export default class MainPage extends React.Component {

    state = {
        //loginBlock: signUp || login
        loginBlock: "login",

        username: '',
        password: '',

        createUsername: '',
        createPassword: '',


        showWxDialog: false,
    }
    data = {

    }

    componentDidMount = () => {
        this.data = window.INIT_DATA
    }

    setToSignUpHandle = () =>  {
        this.setState({
            loginBlock: 'signUp'
        });
    }
    setToLoginHandle = () => {
        this.setState({
            loginBlock: 'login'
        });
    }

    usernameHandle = (e) => {
        this.setState({
            username: e.target.value
        })
    }
    passwordHandle = (e) => {
        this.setState({
            password: e.target.value
        })
    }

    createUsernameHandle = (e) => {
        this.setState({
            createUsername: e.target.value
        })
    }
    createPasswordHandle = (e) => {
        this.setState({
            createPassword: e.target.value
        })
    }

    loginHandle = async () => {
        const result = await authApi(this.state.username, this.state.password)
        if(result.state.code === 0) {
            window.toast("登录成功")
            window.location.href = '/team'
        } else {
            window.toast(result.state.msg || "登录失败")
        }
    }

    signHandle = async () => {
        // todo 检验账号密码是否可用
        const result = await api('/api/signUp', {
            method: 'POST',
            body: {
                userInfo: {
                    username: this.state.createUsername,
                    password: this.state.createPassword,
                }
            }
        })

        if(result.state.code === 0) {
            location.href = '/person'
        }
    }

    showWxDialogHandle = () => {
        this.setState({
            showWxDialog: true
        })
    }

    hideWxDialogHandle = () => {
        this.setState({
            showWxDialog: false
        })
    }





    render () {
        return <Page title='IHCI' className="main-page">

            {
                this.state.showWxDialog && <WxLoginDialog state="auth" closeHandle={this.hideWxDialogHandle}/>
            }

            <div className="nav">
                <div className="max-w-con nav-con">
                    <div className="logo">IHCI(换成图)</div>
                </div>
            </div>
            <div className="banner">
                <h1>All for the valuable code.</h1>
                <div className="banner-con max-w-con">
                    <div className="banner-img">这是LOGO图</div>
                    <div className="auth-con">
                        <div className="auth-nav">
                            <div
                                className={this.state.loginBlock == "login" ? "auth-nav-item active" : "auth-nav-item"}
                                onClick={this.setToLoginHandle}
                            >登录</div>
                            <div
                                className={this.state.loginBlock == "signUp" ? "auth-nav-item active" : "auth-nav-item"}
                                onClick = {this.setToSignUpHandle}
                            >注册</div>
                        </div>
                        {
                            this.state.loginBlock == "signUp" ?
                                <div className='auth-form'>

                                    <div className="auth-desc">Your username</div>
                                    <input className="auth-input" value={this.state.createUsername} onChange={this.createUsernameHandle}></input>

                                    <div className="auth-desc">Your password</div>
                                    <input className="auth-input" type="password" value={this.state.createPassword} onChange={this.createPasswordHandle}></input>

                                    <div className="submit-btn" onClick={this.signHandle}>CREATE ACCOUNT</div>
                                </div>
                            : ""
                        }
                        {
                            this.state.loginBlock == "login" ?
                                <div className='auth-form'>
                                <div className="auth-desc">Choose a username</div>
                                <input className="auth-input" value={this.state.username} onChange={this.usernameHandle}></input>
                                <div className="auth-desc">Choose a password</div>
                                <input className="auth-input" type="password" value={this.state.password} onChange={this.passwordHandle}></input>

                                    <div className="submit-btn" onClick={this.loginHandle}>LOG IN</div>

                                    <div className="submit-btn" onClick={this.showWxDialogHandle}>微信登录</div>
                                </div>
                            : ""
                        }
                    </div>
                </div>
            </div>
            <div className="video">
                <div className="video-des">这是一些关于视频的描述balabala这是一些关于视频的描述balabala这是一些关于视频的描述balabala这是一些关于视频的描述balabala</div>
                <div className="video-wrap">
                    { /* <iframe frameborder="0" width="450" height="254" src="https://v.qq.com/iframe/player.html?vid=f0564fwe5va&tiny=0&auto=0" allowfullscreen></iframe> */}
                </div>
            </div>
            <div className="stories">
                <h1>iHCI stories</h1>
                <div className="story-con">
                    <div className="story-item">
                        <div className="head-img"></div>
                        <div className="name">名字</div>
                        <div className="title">这是头衔的描述</div>
                        <div className="desc">一段说明性的文字</div>
                    </div>
                    <div className="story-item">
                        <div className="head-img"></div>
                        <div className="name">名字</div>
                        <div className="title">这是头衔的描述</div>
                        <div className="desc">一段说明性的文字</div>
                    </div>
                    <div className="story-item">
                        <div className="head-img"></div>
                        <div className="name">名字</div>
                        <div className="title">这是头衔的描述</div>
                        <div className="desc">一段说明性的文字</div>
                    </div>
                </div>

                <div className="join-num">
                    <div className="p1">迄今已有</div>
                    <div className="num">450人</div>
                    <div className="p1">加入了IHCI</div>
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
        </Page>
    }
}

render(<MainPage />, document.getElementById('app'));
