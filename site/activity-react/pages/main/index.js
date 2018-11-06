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
                    <div className="slogan">All for the valuable code 一切为了有价值的代码</div>
                    <div className="division">iHCI俱乐部&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;iHCI实验室</div>
                </div>
            </div>
            <div className="banner">
                <div className="banner-con max-w-con">
                    <div><img className="banner-img" src={require('./tuceng7@2x.png')} /></div>
                    <LoginView showWxDialogHandle={this.showWxDialogHandle}/>
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

