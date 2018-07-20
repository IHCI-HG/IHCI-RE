import * as React from 'react';

import api, { authApi } from '../../utils/api';

import './style.scss'

import WxLoginDialog from '../../components/wx-login-dialog'

export class TeamLoginView extends React.Component {
    state = {
        //loginBlock: signUp || login
        loginBlock: "login",

        username: '',
        password: '',

        createUsername: '',
        createPassword: '',
        createConfirmPassword:'',
        infoCheck:{
            createUsernameEmpty: true,
            createPasswordEmpty:true,
            createConfirmPasswordEmpty: true,
            usernameEmpty:true,
            passwordEmpty:true
        },
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
        const username = e.target.value
        var usernameEmpty = true
        if(username){
            usernameEmpty = false
        }else{
            usernameEmpty = true
        }
        this.setState({
            username: e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                usernameEmpty:usernameEmpty
            }
        })
    }
    passwordHandle = (e) => {
        const password = e.target.value
        var passwordEmpty = true
        if(password){
            passwordEmpty = false
        }else{
            passwordEmpty = true
        }
        this.setState({
            password: password,
            infoCheck:{
                ...this.state.infoCheck,
                passwordEmpty:passwordEmpty
            }
        })
    }

    createUsernameHandle = (e) => {
        const createUsername = e.target.value
        var createUsernameEmpty = true
        if(createUsername){
            createUsernameEmpty = false
        }else{
            createUsernameEmpty = true
        }
        this.setState({
            createUsername: createUsername,
            infoCheck:{
                ...this.state.infoCheck,
                createUsernameEmpty:createUsernameEmpty
            }
        })
    }
    createPasswordHandle = (e) => {
        const createPassword = e.target.value
        var createPasswordEmpty = true
        if(createPassword){
            createPasswordEmpty = false
        }else{
            createPasswordEmpty = true
        }
        this.setState({
            createPassword: createPassword,
            infoCheck:{
                ...this.state.infoCheck,
                createPasswordEmpty:createPasswordEmpty
            }
            

        })
    }
    createConfirmPasswordHandle = (e) =>{
        const confirmPassword = e.target.value
        var createConfirmPasswordEmpty = true
        if(confirmPassword){
            createConfirmPasswordEmpty = false
        }else{
            createConfirmPasswordEmpty = true
        }
        this.setState({
            createConfirmPassword:e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                createConfirmPasswordEmpty:createConfirmPasswordEmpty
            }
        })
    }

    loginHandle = async () => {
        if(this.state.infoCheck.usernameEmpty){
            window.toast("用户名为空")
            return
        }
        if(this.state.infoCheck.passwordEmpty){
            window.toast("密码为空")
            return
        }

        const result = await authApi(this.state.username, this.state.password)
        if(result.state.code === 0) {
            window.toast("登录成功")
            if (this.props.join)
                window.location.href = window.location.href
            else
                window.location.href = '/team'
        } else {
            window.toast(result.state.msg || "登录失败")
        }
    }

    signHandle = async () => {
        // todo 检验账号密码是否可用
        if(this.state.infoCheck.createUsernameEmpty){
            window.toast("用户名为空")
            return
        }
        if(this.state.infoCheck.createPasswordEmpty){
            window.toast("密码为空")
            return
        }
        if(this.state.infoCheck.createConfirmPasswordEmpty){
            window.toast("确认密码为空")
            return 
        }
        if(this.state.createPassword !== this.state.createConfirmPassword){
            window.toast("两次输入密码不同")
            return
        }
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
            window.toast("注册成功")
            setTimeout(() => {
                if (this.props.join)
                    location.href = location.href
                else location.href = '/person'
            }, 300);
        }
        else{
            window.toast(result.state.msg || "注册失败")
        }
    }


    render () {
        return <div className="auth-con">
        <div className='h1'>加入{this.props.teamName}</div>
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

                                    <div className="auth-desc"></div>
                                    <input type="text" placeholder="Your username" className="auth-input" value={this.state.createUsername} onChange={this.createUsernameHandle}></input>

                                    <div className="auth-desc"></div>
                                    <input type="text" placeholder="Your password" className="auth-input" type="password" value={this.state.createPassword} onChange={this.createPasswordHandle}></input>

                                    <div className="auth-desc"></div>
                                    <input className="auth-input" placeholder="Confirm Password" type="password" value={this.state.createConfirmPassword} onChange={this.createConfirmPasswordHandle}></input>

                                    <div className="submit-btn" onClick={this.signHandle}>CREATE ACCOUNT</div>
                                </div>
                            : ""
                        }
                        {
                            this.state.loginBlock == "login" ?
                                <div className='auth-form'>
                                <div className="auth-desc"></div>
                                <input type="text" placeholder="Your name" className="auth-input" value={this.state.username} onChange={this.usernameHandle}></input>
                                <div className="auth-desc"></div>
                                <input type="text" placeholder="Your password" className="auth-input" type="password" value={this.state.password} onChange={this.passwordHandle}></input>

                                    <div className="submit-btn" onClick={this.loginHandle}>LOG IN</div>
                                    {/* <div className="submit-btn" onClick={this.props.showWxDialogHandle}>微信登录</div> */}
                                    <div className="wx-alarm">Or connect with:</div>
                                    <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
                                    <div><i className="fa fa-weixin fa-3x wx-btn" aria-hidden="true" onClick={this.props.showWxDialogHandle}></i></div>
                                </div>
                            : ""
                        }
                    </div>
    }

}