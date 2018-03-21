import * as React from 'react';
import { render } from 'react-dom';

import Page from '../../components/page';

import api, { IApiOptions, IApiResult } from '../../utils/api';
import * as ui from '../../utils/ui';

import './style.scss'
import { loading } from '../../utils/ui';

export default class TeamPage extends React.Component {

    state = {
        //loginBlock: signUp || login
        loginBlock: "signUp",
    }
    data = {

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

    componentDidMount = () => {
        this.data = window.INIT_DATA
    }

    render () {
        return <Page title='IHCI' className="main-page">
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
                                className={this.state.loginBlock == "signUp" ? "auth-nav-item active" : "auth-nav-item"}
                                onClick = {this.setToSignUpHandle}
                            >注册</div>
                            <div 
                                className={this.state.loginBlock == "login" ? "auth-nav-item active" : "auth-nav-item"}
                                onClick = {this.setToLoginHandle}
                            >登录</div>
                        </div>

                        {
                            this.state.loginBlock == "signUp" ?
                                <div className='auth-form'>
                                    <div className="auth-desc">Choose a username</div>
                                    <input className="auth-input"></input>

                                    <div className="auth-desc">Your email address</div>
                                    <input className="auth-input"></input>

                                    <div className="auth-desc">Choose a password</div>
                                    <input className="auth-input"></input>

                                    <div className="submit-btn">CREATE ACCOUNT</div>
                                </div> 
                            : ""
                        }
                        {
                            this.state.loginBlock == "login" ?
                                <div className='auth-form'>
                                    <div className="auth-desc">Your email or username</div>
                                    <input className="auth-input"></input>

                                    <div className="auth-desc">Your password</div>
                                    <input className="auth-input"></input>

                                    <div className="submit-btn">LOG IN</div>
                                </div> 
                            : ""
                        }
                    </div>
                </div>
            </div>
            <div className="video">
                <div className="video-des">这是一些关于视频的描述balabala这是一些关于视频的描述balabala这是一些关于视频的描述balabala这是一些关于视频的描述balabala</div>
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

render(<TeamPage />, document.getElementById('app'));