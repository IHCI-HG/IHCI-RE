import * as React from 'react';
import './style.scss'

export class LoginView extends React.Component {
    state = {
        //loginBlock: signUp || login
        loginBlock: "login",

        username: '',
        password: '',

        createUsername: '',
        createPassword: '',
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
            window.toast("注册成功")
            setTimeout(() => {
                location.href = '/person'
            }, 300);
        }
        else{
            window.toast(result.state.msg || "注册失败")
        }
    }

    render () {
        return <div className="auth-con">
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

                                    <div className="submit-btn" onClick={this.props.showWxDialogHandle}>微信登录</div>
                                </div>
                            : ""
                        }
                    </div>
    }

}