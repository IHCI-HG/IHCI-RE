import * as React from 'react';

import api, { authApi } from '../../utils/api';

import './style.scss'

import WxLoginDialog from '../../components/wx-login-dialog'

import SMSBlock from '../../components/smsCode'
export class LoginView extends React.Component {
    state = {
        //loginBlock: signUp || login
        loginBlock: "login",

        username: '',
        password: '',

        createPhone: '',
        authCode: '',
        createPassword: '',
        createNickname:'',
        infoCheck: {
            createPhoneEmpty: true,
            authCodeEmpty: true,
            createPasswordEmpty: true,
            usernameEmpty: true,
            passwordEmpty: true,
            createNicknameEmpty: true
        },
        helpDisplay: false
    }

    setToSignUpHandle = () => {
        if (this.state.loginBlock === 'login') {
            this.setState({
                loginBlock: 'signUp'
            })
        }
        if (this.state.loginBlock === 'signUp') {
            this.setState({
                loginBlock: 'login'
            })
        }
    }
    setToLoginHandle = () => {
        this.setState({
            loginBlock: 'login'
        });
    }
    createNicknameHandle = (e) => {
        const nickname = e.target.value;
        var empty = true;
        if(nickname){
            empty = false;
        }else{
            empty = true;
        }
        this.setState({
            createNickname: nickname,
            infoCheck:{
                ...this.state.infoCheck,
                createNicknameEmpty: empty
            }
        })
    }
    usernameHandle = (e) => {
        const username = e.target.value
        var usernameEmpty = true
        if (username) {
            usernameEmpty = false
        } else {
            usernameEmpty = true
        }
        this.setState({
            username: e.target.value,
            infoCheck: {
                ...this.state.infoCheck,
                usernameEmpty: usernameEmpty
            }
        })
    }
    passwordHandle = (e) => {
        const password = e.target.value
        var passwordEmpty = true
        if (password) {
            passwordEmpty = false
        } else {
            passwordEmpty = true
        }
        this.setState({
            password: password,
            infoCheck: {
                ...this.state.infoCheck,
                passwordEmpty: passwordEmpty
            }
        })
    }

    createPhoneHandle = (e) => {
        const createPhone = e.target.value
        var createPhoneEmpty = true
        if (createPhone) {
            createPhoneEmpty = false
        } else {
            createPhoneEmpty = true
        }
        this.setState({
            createPhone: createPhone,
            infoCheck: {
                ...this.state.infoCheck,
                createPhoneEmpty: createPhoneEmpty
            }
        })
    }
    authCodeHandle = (e) => {
        const authCode = e.target.value
        var authCodeEmpty = true
        if (authCode) {
            authCodeEmpty = false
        } else {
            authCodeEmpty = true
        }
        this.setState({
            authCode: authCode,
            infoCheck: {
                ...this.state.infoCheck,
                authCodeEmpty: authCodeEmpty
            }
        })
    }
    createPasswordHandle = (e) => {
        const confirmPassword = e.target.value
        var createPasswordEmpty = true
        if (confirmPassword) {
            createPasswordEmpty = false
        } else {
            createPassworddEmpty = true
        }
        this.setState({
            createPassword: e.target.value,
            infoCheck: {
                ...this.state.infoCheck,
                createPasswordEmpty: createPasswordEmpty
            }
        })
    }

    loginHandle = async () => {
        if (this.state.infoCheck.usernameEmpty) {
            window.toast("用户名为空")
            return
        }
        if (this.state.infoCheck.passwordEmpty) {
            window.toast("密码为空")
            return
        }

        const result = await authApi(this.state.username, this.state.password)
        if (result.state.code === 0) {
            window.toast("登录成功")
            setTimeout("window.location.href = '/team'", 1000)
        } else {
            window.toast(result.state.msg || "登录失败")
        }
    }

    signHandle = async () => {
        // todo 检验账号密码是否可用
        if (this.state.infoCheck.createPhoneEmpty) {
            window.toast("手机为空")
            return
        }
        if (this.state.infoCheck.authCodeEmpty) {
            window.toast("验证码为空")
            return
        }
        if (this.state.infoCheck.createPasswordEmpty) {
            window.toast("密码为空")
            return
        }

        // 密码自己设置
        const result = await api('/api/signUp', {
            method: 'POST',
            body: {
                userInfo: {
                    username: this.state.createPhone, // 手机登录 账号为手机号码
                    password: this.state.createPassword, // 输入的密码就是登陆密码
                    code: this.state.authCode,
                    nickname: this.state.createNickname
                }
            }
        })


        if (result.state.code === 0) {
            window.toast("注册成功")
            setTimeout(() => {
                location.href = '/team'
            }, 300);
        }
        else {
            window.toast(result.state.msg || "注册失败")
        }
    }

    forgetPwd = async () => {
        setTimeout(() => {
            location.href = '/password-reset'
        }, 300);
    }

    smsCodeInputHandle = (e) => {
        const code = e.target.value
        this.setState({
            authCode: code,
            infoCheck: {
                ...this.state.infoCheck,
                authCodeEmpty: false
            }
        })

    }

    render() {
        return <div className="auth-con">
            <div className="auth-nav">
                <div
                    className={this.state.loginBlock == "login" ? "auth-nav-item-login active" : "auth-nav-item-login"}
                >{(this.state.loginBlock === "login") ? "登录" : "注册"}</div>
                <div
                    className={this.state.loginBlock == "signUp" ? "auth-nav-item-signup active" : "auth-nav-item-signup"}
                    onClick={this.setToSignUpHandle}
                >{(this.state.loginBlock === "login") ? "注册" : "登录"}</div>
            </div>
            {
                this.state.loginBlock == "signUp" ?
                    <div className='login-view-form'>
                        <input type="number" pattern="[0-9]*" className="auth-input" placeholder="请输入手机号"
                            value={this.state.createPhone} onChange={this.createPhoneHandle}
                            onClick={this.judgeUsernameEmptyHandle} autoFocus></input>
                        <input type='text' className='auth-input' placeholder='请输入昵称' 
                            vlaue={this.state.createNickname} onChange={this.createNicknameHandle}></input>
                        <input className="auth-input" placeholder="请输入密码"
                            type="password" value={this.state.createPassword} onChange={this.createPasswordHandle}></input>
                        <SMSBlock smsCodeInputHandle={this.smsCodeInputHandle}
                            smsCode={this.state.authCode}
                            phoneNumber={this.state.createPhone}
                            phoneEmpty={this.state.infoCheck.createPhoneEmpty}
                        ></SMSBlock>
                        <div className="forgetPwd" onClick={() => { this.setState({ helpDisplay: !this.state.helpDisplay }) }}>收不到验证码?</div>
                        {this.state.helpDisplay && <div className="help-block">
                            <div className="menuArrow" ></div>
                            <div className="help-title">没收到短信验证码？</div>
                            <div className="help-close" onClick={() => { this.setState({ helpDisplay: false }) }}><i className="iconfont icon-close"></i></div>
                            <ul className="help-text">
                                <li className="help-row">1、网络通讯异常可能会造成短信丢失，请重新获取或稍后再试。</li>
                                <li className="help-row">2、请核实手机是否已欠费停机，或者屏蔽了系统短信。</li>
                                <li className="help-row">3、如果手机已丢失或停用， 请选择其他验证方式 。</li>
                                <li className="help-row">4、您也可以尝试将SIM卡移动到另一部手机，然后重试。</li>
                            </ul>
                        </div>
                        }
                        <div className="submit-btn" onClick={this.signHandle}>加入我们</div>
                    </div>
                    : ""
            }
            {
                this.state.loginBlock == "login" ?
                    <div className='login-view-form'>
                        <div className="auth-desc">用户名</div>
                        <input type="number" pattern="[0-9]*" className="auth-input" value={this.state.username} onChange={this.usernameHandle}></input>
                        <div className="auth-desc">密码</div>
                        <input className="auth-input" type="password" value={this.state.password} onChange={this.passwordHandle}></input>
                        <div className="forgetPwd" onClick={this.forgetPwd}>忘记密码?</div>
                        <div className="submit-btn" onClick={this.loginHandle}>加入我们</div>
                        <div className="wx-submit-btn" onClick={this.props.showWxDialogHandle}>
                            <img className="wx-submit-img" src={require('./wechat@2x.png')} />
                            微信登录
                                    </div>
                    </div>
                    : ""
            }
        </div>
    }

}
