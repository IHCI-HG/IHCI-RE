import React from 'react'
import api, { authApi } from '../../utils/api';
import './style.scss'

export default class SMSBlock extends React.Component{
    state = {
        count: 60,
        enable: true,
        number: 0,
        captchaCode:'',
        captchaImg :'',
        captchaText:'',
        numberCheck:true,
        captchCodeCheck:false,
    }
    componentDidMount = async () =>{
        this.getCaptchaImg()
    }
    
    checkSMSNumber = () =>{
        if(this.state.number ===3){
            this.setState({
                numberCheck:false,
            })
        }else{
            var number = this.state.number
            number += 1
            this.setState({
                number: number
            })
        }
    }
    GetSMSHandle = async () =>{
        if(this.props.phoneEmpty){
            window.toast("请输入手机号")
        }
        if(this.state.enable && !this.props.phoneEmpty){
            this.checkSMSNumber()
            if(this.state.numberCheck){
                const result = await api('/api/createSMS',{
                    method:'POST',
                    body:{
                        phoneNumber:this.props.phoneNumber
                    }
                })
                if(result.state.code === 0 ){

                }else{
                    window.toast(result.state.msg || "请重新输入")
                }
                this.countDown()
            }else{
                window.toast("获取验证码次数过多，请输入图片验证码")
                this.getCaptchaImg()
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
        if(code === this.state.captchaText){
            this.setState({
                captchCodeCheck: true,
                enable: true
            })
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
    render () {
        return(
            <div className = "sms-block">
                <input className = "input-code" placeholder = "4位数字验证码" value = {this.props.smsCode} onChange = {this.props.smsCodeInputHandle}></input>
                {
                    <div className ={this.state.numberCheck ? 'active-btn' : 'inacitve-btn'} onClick = {this.GetSMSHandle}>{this.state.enable? '获取验证码':`${this.state.count}秒后重发`}</div>
                }
                
            {
                !this.state.numberCheck?
                <div>
                    <input className = "input-code" value = {this.state.captchaCode} onChange={this.captchaInputHandle}></input>
                    {this.state.captchCodeCheck?<i className="icon iconfont check-cion">&#xe750;</i>:""}
                    <div dangerouslySetInnerHTML = {{__html:this.state.captchaImg}}></div>
                    <div className = "change-icon" onClick = {this.getCaptchaImg}>看不清，换一张</div>
                </div>
                :""
            }
            </div>                    
        )
    }
}