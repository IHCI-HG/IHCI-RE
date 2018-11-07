import * as React from 'react';
import { render } from 'react-dom';

import Page from '../../components/page';

import api, { authApi } from '../../utils/api';

import './style.scss'
import '../../commen/style.scss'

import WxLoginDialog from '../../components/wx-login-dialog'
import { LoginView } from '../../components/login-view';

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

    componentDidMount = async () => {
        this.data = window.INIT_DATA

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
                    <img className="logo" src={require('./logo@2x.png')} />
                    <div className="slogan">
                            <div className="english">All for the valuable code</div> 
                            <div className="chinese">一切为了有价值的代码</div></div>
                    <div className="division">iHCI俱乐部&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;iHCI实验室</div>
                </div>
            </div>
            <div className="slogan-bg">一切只为了有价值的代码</div>
            <div className="banner">
                <div className="banner-con max-w-con">
                    <div><img className="banner-img" src={require('./tuceng7@2x.png')} /></div>
                    <LoginView showWxDialogHandle={this.showWxDialogHandle}/>
                </div>
            </div>
            <div className="video">  
                <div className="video-wrap">
                    { /* <iframe frameborder="0" width="450" height="254" src="https://v.qq.com/iframe/player.html?vid=f0564fwe5va&tiny=0&auto=0" allowfullscreen></iframe> */}
                    <div><img className="video-template" src={require('./mp4.png')}/></div>
                    <div className="video-des">这是一些关于视频的描述balabala</div>
                </div>
                
            </div>
            <div className="stories">
                <div className="story-con">
                    <div className="story-item">
                        <div><img  className="head-img" src={require('./toxiang1.png')}/></div>
                        <div className="item-wrap">
                        <div className="name">Meta Hirschl</div>
                        <div className="title">网页设计师</div>
                        <div className="desc">
                        <div>我是一个待业者</div>
                        <div>通过人机交互实验室</div>
                        <div>我获得了一份网页设计师的工作</div>
                        </div>
                        </div>
                    </div>
                    <div className="story-item">
                        <div><img  className="head-img" src={require('./toxiang2.png')}/></div>
                        <div className="item-wrap">
                        <div className="name">Brian Grant</div>
                        <div className="title">出国考研学生</div>
                        <div className="desc">
                        <div>我是一个在国外考研的大学生</div>
                        <div>通过人机交互实验室</div>
                        <div>我在国外考研更加轻松了</div>
                        </div>
                        </div>
                    </div>
                    <div className="story-item">
                        <div><img className="head-img" src={require('./toxiang3.png')}/></div>
                        <div className="item-wrap">
                        <div className="name">Maxim Orlov</div>
                        <div className="title">创业者</div>
                        <div className="desc">
                        <div>我是创业者</div>
                        <div>通过人机交互实验室</div>
                        <div>让我的公司开发了更好的产品</div>
                        </div>
                        </div>
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
                        <div className="foot-item-title">iHCI俱乐部</div>
                        <div href="">HTML&CSS</div>
                        <div href="">JavaScript</div>
                        <div href="">Python</div>
                    </div>
                    <div className="foot-item">
                        <div className="foot-item-title">iHCI实验室</div>
                        <div href="">软件工程</div>
                        <div href="">人机交互</div>
                        <div href="">人工智能</div>
                    </div>
                </div>
            </div>
        </Page>
    }
}


render(<MainPage />, document.getElementById('app'));

