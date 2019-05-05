import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';
//import {WxChoose as staticText} from '../../../commen/static-text'
import SMSBlock from '../../../components/smsCode'
const sha256 = require('crypto-js/SHA256');

export default class PwdReset extends React.Component{
    state = {
        phone:'',
        newPassword:'',
        smsCode:'',
        phoneEmpty:true,
        passwordEmpty:true,
        codeEmpty:true,

    }
    componentDidMount = () => {
        this.setState({
            phone: window.sessionStorage.getItem('phone')||''
        },() =>{
            if(this.state.phone !== ''){
                this.setState({
                    phoneEmpty: false
                })
            }
        })
     }

    phoneInputHandle = (e) => {
        const phoneNumber = e.target.value
        this.setState({
            phone: phoneNumber,
            phoneEmpty:false  
        },() => {
            window.sessionStorage.setItem('phone',phoneNumber)
        })
    }

    passwordInputHandle = (e) =>{
        const password = e.target.value
        this.setState({
            newPassword: password,
            passwordEmpty:false
        })

    }
    smsCodeInputHandle = (e) =>{
        const code = e.target.value
        this.setState({
            smsCode: code,
            codeEmpty:false
        })
    }

    resetPasswordHandle = async() =>{
        if(this.state.phoneEmpty){
            window.toast("手机号为空")
        }
        if(this.state.passwordEmpty){
            window.toast("密码为空")
        }
        if(this.state.codeEmpty){
            window.toast("验证码为空")
        }

        const password = sha256(this.state.newPassword).toString()
        const result = await api('/api/forgotPassword', {
            method: 'POST',
            body:{
                phone: this.state.phone,
                code: this.state.smsCode,
                password: password,
            }
        })
        if(result.state.code === 0){
            window.sessionStorage.removeItem('phone')
            window.sessionStorage.removeItem('number')
            window.sessionStorage.removeItem('count')
            window.toast("修改成功")
            setTimeout(() => {
                window.history.go(-1)
            },1000)
        }else{
            window.toast(result.state.msg)
        }
    }

    returnHandle = () =>{
        setTimeout(()=>{
            window.history.go(-1)
        },1000)
    }

    render (){
        return(
            <Page title = "重新设置密码" className = "reset-page">
                <div className = "auth-form">
                <div className = "title">重新设置密码</div>
                <input type="number" pattern="[0-9]*" className = "input-edit" value={this.state.phone} onChange = {this.phoneInputHandle} placeholder = "手机号"></input>
                <input className = "input-edit" type="password"  value = {this.state.newPassword} onChange = {this.passwordInputHandle} placeholder = "新密码"></input>
                <SMSBlock 
                   smsCodeInputHandle = {this.smsCodeInputHandle}
                   smsCode = {this.state.smsCode}
                   phoneNumber = {this.state.phone}
                   phoneEmpty = {this.state.phoneEmpty}
                />
                <div className = "reset-btn" onClick = {this.resetPasswordHandle}>确定</div>
                <div className = "reset-btn" onClick = {this.returnHandle}>返回</div>
                </div>
            </Page>
            
        )
    }
    
}