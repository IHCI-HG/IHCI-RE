import React from 'react'

import api, { authApi } from '../../utils/api';

//import './style.scss'

export default class SMSBlock extends React.Component{
    state = {
        count: '',
        enable: true,
        number: '',
        captchaCode:'',
        captchaImg :'',
        numberCheck:true,
        captchCodeCheck:false,
    }
    componentDidMount = async () =>{
        this.setState({
            count:60,
            number:0,
        })
    }
    
    checkSMSNumber = () =>{
        if(this.state.number >3){
            this.setState({
                numberCheck:false,
            })
        }else{
            var number = this.state.number
            number += 1
            this.setState({
                number: number
            }, () => {
                console.log(this.state.number)
                console.log(number)
            })
        }
    }
    GetSMSHandle = () =>{
        if(this.state.enable){
            this.checkSMSNumber()
            if(this.state.numberCheck){
                this.countDown()
            }
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

    captchaInputHandle = (e) =>{
        const code = e.target.value
        this.setState({
            captchaCode: code
        })

    }
    changeCaptchaImg = () =>{

    }
    render () {
        return(
            <div>
                <input className = "input-edit" placeholder = "6位数字验证码" value = {this.props.smsCode} onChange = {this.props.smsCodeInputHandle}></input>
                <div className = {this.state.enable?"active":"inacitve"} onClick = {this.GetSMSHandle}>{this.state.enable? '获取验证码':`${this.state.count}秒后重发`}</div>
            {
                !this.state.numberCheck?
                <div>
                    <input className = "input-edit" value = {this.state.captchaCode} onChange={this.captchaInputHandle}></input>
                    <div className = "captchImg"></div>
                    {this.state.captchCodeCheck?<span className = "check">√</span>:""}
                    <div className = "change-icon" onClick = {this.changeCaptchaImg}>看不清，换一张</div>
                </div>
                :""
            }
            </div>                    
        )
    }
}