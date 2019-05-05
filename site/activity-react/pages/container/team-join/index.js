import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'

import WxLoginDialog from '../../../components/wx-login-dialog'
//import { LoginView } from '../../../components/login-view';
import { TeamLoginView } from '../../../components/team-login-view';

export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        console.log(this)
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
            }else if(result.state.msg ==='您已在团队中'){
                location.href = "/team/"+this.state.teamObj._id
            }
        }, 400);

    }

    render() {
       
        return(
            <Page title='加入团队 - IHCI' className="join-team">
            
            {
                this.state.showWxDialog && <WxLoginDialog state="auth" closeHandle={this.hideWxDialogHandle}/>
            }
                <div className="nav">
                    <div className="max-w-con nav-con">
                        <div className="logo">换成logo</div>
                    </div>
                </div>
                <div className="banner">
                    {/* <div className='h1'>加入{this.state.teamObj.name}</div> */}
                    <div className="banner-con max-w-con">
                    {
                        this.state.login ? 
                        <div className='join-box'>
                            <img className='team-img' src={this.state.teamObj.teamImg}></img>
                            <div className='team-name'>{this.state.teamObj.name}</div>
                            <div className='join-btn' onClick={this.joinBtnHandle}>点击加入团队</div> 
                        </div>
                        : 
                        <TeamLoginView teamId={this.props.params.id} join={true} showWxDialogHandle={this.showWxDialogHandle} teamName={this.state.teamObj.name} teamName={this.state.teamObj.name } />
                    
                    }
                    </div>
                    
                </div>
        
                {/* <div className="footer">
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
                </div> */}
            </Page>)
    }
}


