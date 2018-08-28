import * as React from 'react';

import api, { authApi } from '../../utils/api';

import './style.scss'

import WxLoginDialog from '../../components/wx-login-dialog'

export class LoginView extends React.Component {
    state = {
        //loginBlock: signUp || login
        loginBlock: "login",

        username: '',
        password: '',

        createPhone: '',
        authCode: '',
        createPassword:'',
        infoCheck:{
            createPhoneEmpty: true,
            authCodeEmpty:true,
            createPasswordEmpty: true,
            usernameEmpty:true,
            passwordEmpty:true
        },

        getCode: true,
        count: '',

        numberCheck:true,
        enable: true,
        numberCheck:true,
        captchaCode:'',
        captchaImg :'',
        captchaText:'',
        number: '',
        captchCodeCheck:false,
    }

    componentDidMount = async() => {
        this.setState({
            number: 0,
        })
    }


    handleClick = () => {
        if (this.state.createPhone == "") {
            window.toast('手机号不能为空')
            return
        } else {
            // 手机正确格式验证
            if(!(/^1[3|4|5|7|8]\d{9}$/.test(this.state.createPhone))) {
                window.toast('手机格式有误')
                return 
            }
        }

        //发送验证码

        this.getSMS();

        const interval = 5;

        var temp = interval
        this.setState({
            getCode: false,
            count: temp
        })
        var timer = setInterval(() => {
            this.setState({
                count: --temp, 
            })
        
            if(this.state.count == 0) {
                this.setState({
                    count: interval,
                    getCode: true
                })
                clearInterval(timer)
            }
        }, 1000);
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

    createPhoneHandle = (e) => {
        const createPhone = e.target.value
        var createPhoneEmpty = true
        if(createPhone){
            createPhoneEmpty = false
        }else{
            createPhoneEmpty = true
        }
        this.setState({
            createPhone: createPhone,
            infoCheck:{
                ...this.state.infoCheck,
                createPhoneEmpty:createPhoneEmpty
            }
        })
    }
    authCodeHandle = (e) => {
        const authCode = e.target.value
        var authCodeEmpty = true
        if(authCode){
            authCodeEmpty = false
        }else{
            authCodeEmpty = true
        }
        this.setState({
            authCode: authCode,
            infoCheck:{
                ...this.state.infoCheck,
                authCodeEmpty:authCodeEmpty
            }
        })
    }
    createPasswordHandle = (e) =>{
        const confirmPassword = e.target.value
        var createPasswordEmpty = true
        if(confirmPassword){
            createPasswordEmpty = false
        }else{
            createPassworddEmpty = true
        }
        this.setState({
            createPassword:e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                createPasswordEmpty:createPasswordEmpty
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
                setTimeout("window.location.href = '/team'", 1000)
        } else {
            window.toast(result.state.msg || "登录失败")
        }
    }

    checkSMSNumber = () => {
        if (this.state.number === 3){
            this.setState({
                numberCheck:false,
            })
        } else{
            var number = this.state.number
            number += 1
            this.setState({
                number: number
            })
        }
    }

    getSMS = async() => {
        if(this.state.enable) {
        this.checkSMSNumber()
        if(this.state.numberCheck){
            const result = await api('/api/createSMS', {
                method: 'POST',
                body: {
                    phoneNumber: this.state.createPhone
                }
            })
            if(result.state.code === 0 ){

            } else {
                window.toast(result.state.msg || "请重新输入")
            }
            this.countDown()
        } else {
            window.toast("获取验证码次数过多，请输入图片验证码")
            this.getCaptchaImg()
        }
        }
    }

    getCaptchaImg = async () =>{
        const result = await api('/api/createCaptcha',{
            method:'POST',
            body:{}
        })
        if(result.state.code === 0){
   
            this.setState({
                captchaImg: result.data.img,
                captchaText:result.data.text
            })
            
        }
        
    }

    captchaInputHandle = (e) =>{
        const code = e.target.value
        this.setState({
            captchaCode: code
        })
        if(code === this.state.captchaText){
            this.setState({
                captchCodeCheck: true,
                enable: true
            })
        }

    }

    countDown = () =>{
        this.setState({
            enable:false
        })
        var timer = setInterval(() => {
            var count = this.state.count  
            count -=1
            if(count < 1){
                count = 60
                this.setState({
                    enable: true,
                    count: count
                })
                clearInterval(timer)
            }else{
                this.setState({
                    count: count
                    })
                }               
            },1000)
    }

    signHandle = async () => {
        // todo 检验账号密码是否可用
        if(this.state.infoCheck.createPhoneEmpty){
            window.toast("手机为空")
            return
        }
        if(this.state.infoCheck.authCodeEmpty){
            window.toast("验证码为空")
            return
        }
        if(this.state.infoCheck.createPasswordEmpty){
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

                                    <div className="auth-desc">手机</div>
                                    <input className="auth-input" placeholder="请输入手机号" 
                                    value={this.state.createPhone} onChange={this.createPhoneHandle} 
                                    onClick={this.judgeUsernameEmptyHandle} autoFocus></input>
                                    
                                    <div className="auth-desc">验证码</div>
                                    <input className="auth-smallinput" placeholder="请输入验证码" type="text" 
                                    value={this.state.authCode} onChange={this.authCodeHandle}></input>
                                    {
                                        <button className={this.state.numberCheck ? 'codeBtn': 'countSecond'}
                                        onClick={this.getSMS}>{this.state.enable?'获取验证码':`${this.state.count}秒后重发`}</button>
                                    }

                                    {
                                        !this.state.numberCheck ?
                                        <div>
                                            <input className = "input-code" value = {this.state.captchaCode} onChange={this.captchaInputHandle}></input>
                                            {
                                                this.state.captchCodeCheck ? <i className="icon iconfont check-cion">&#xe750;</i> : ""
                                            }
                                            <div dangerouslySetInnerHTML = {{__html:this.state.captchaImg}}></div>
                                            <div className = "change-icon" onClick = {this.getCaptchaImg}>看不清，换一张</div>
                                        </div>
                                        : ""
                                    }

                                    <div className="auth-desc">密码</div>
                                    <input className="auth-input" placeholder="请输入密码"
                                    type="password" value={this.state.createPassword} onChange={this.createPasswordHandle}></input>
                                   
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
                                <div className="forgetPwd">忘记密码?</div>
                                    <div className="submit-btn" onClick={this.loginHandle}>LOG IN</div>
                                    <div className="submit-btn" onClick={this.props.showWxDialogHandle}>微信登录</div>
                                </div>
                            : ""
                        }
                    </div>
    }

}
