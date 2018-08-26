import React from 'react'
import api, { authApi } from '../../utils/api';
import './style.scss'

export default class SMSBlock extends React.Component{
    state = {
        count: '',
        enable: true,
        number: '',
        captchaCode:'',
        captchaImg :'',
        captchaText:'',
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
        if(this.state.number ===3){
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
    GetSMSHandle = async () =>{
        if(this.props.phoneEmpty){
            window.toast("请输入手机号")
            this.setState({
                enable: false
            })
        }
        if(this.state.enable){
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
            console.log(result.data)
            this.setState({
                captchaImg: result.data.img,
                captchaText:result.data.text
            })
            
        }
        
    }
    render () {
        return(
            <div>
                <input className = "input-edit" placeholder = "6位数字验证码" value = {this.props.smsCode} onChange = {this.props.smsCodeInputHandle}></input>
                {
                    <div className = {this.state.numberCheck?"active":"inacitve"} onClick = {this.GetSMSHandle}>{this.state.enable? '获取验证码':`${this.state.count}秒后重发`}</div>
                }
                
            {
                this.state.numberCheck?
                <div>
                    <input className = "input-edit" value = {this.state.captchaCode} onChange={this.captchaInputHandle}></input>
                    <div dangerouslySetInnerHTML = {{__html:this.state.captchaImg}}></div>
                    {this.state.captchCodeCheck?<i className="icon iconfont">&#xe750;</i>:""}
                    <div className = "change-icon" onClick = {this.getCaptchaImg}>看不清，换一张</div>
                </div>
                :""
            }
            </div>                    
        )
    }
}