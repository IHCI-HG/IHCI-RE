import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api, { authApi } from '../../../utils/api';


export default class IhciJoin extends React.Component{

    state = {
        openid:String,
        personInfo: {
            name: '',
            phone: '',
            mail: '',
        },
        infoCheck:{
            illegalEmailAddress: false,
            illegalPhoneNumber:false,
            illegalName: false,
        },
    }
    componentDidMount = () => {
        //var textData = require('../../../text.json');
        this.setState({
            openid:this.props.location.query.openid
        })
     }
    isName = (name) => {
        const reg = /^[\u4E00-\u9FA5A-Za-z]{1}[\u4E00-\u9FA5A-Za-z0-9_\-]{0,11}$/;
        return reg.test(name);
    }

    nameInputHandle = (e) => {
        const name = e.target.value
        var illegalName = false
        if (!this.isName(name)){
            illegalName = true
        }
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                name: name,
            },
            infoCheck: {
                ...this.state.infoCheck,
                illegalName: illegalName,
            },
        })
    }

    isPhoneNumber = (phoneNumber) => {
        const reg = /^0?(13[0-9]|15[0-3,5-9]|17[0,3,5-8]|18[0-9]|14[57]|19[89])[0-9]{8}$/;
        return reg.test(phoneNumber);
    }

    phoneInputHandle = (e) => {
        const phonNumber = e.target.value
        var illegalPhoneNumber = false
        if (!this.isPhoneNumber(phonNumber)){
            illegalPhoneNumber = true
        }
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                phone: phonNumber,
            },
            infoCheck: {
                ...this.state.infoCheck,
                illegalPhoneNumber: illegalPhoneNumber,
            },
        })
    }

    isEmailAddress = (emailAddress) => {
        const reg = /^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/;
        return reg.test(emailAddress);
    }

    mailInputHandle = (e) => {
        const email = e.target.value
        var illegalEmailAddress = false
        if (!this.isEmailAddress(email)){
            illegalEmailAddress = true
        }

        this.setState({
            personInfo: {
                ...this.state.personInfo,
                mail: email,
            },
            infoCheck: {
                ...this.state.infoCheck,
                illegalEmailAddress: illegalEmailAddress,
            },
        })
    }
    infoCheckIllegal = () =>{
        var infoCheck = {
            illegalEmailAddress: false,
            illegalPhoneNumber: false,
            illegalName: false,
        }

        if (!this.isEmailAddress(this.state.personInfo.mail)){
            infoCheck.illegalEmailAddress = true
        }

        if (!this.isPhoneNumber(this.state.personInfo.phone)){
            infoCheck.illegalPhoneNumber = true
        }

        if (!this.isName(this.state.personInfo.name)){
            infoCheck.illegalName = true
        }

        this.setState({
            infoCheck: infoCheck,
        })

        for(var key in infoCheck)
        {
            // console.log(infoCheck[key])
            if (infoCheck[key])
                return true
        }
        return false
    }
    enterHandle = async () =>{
        const result = await api('/api/user/wxEnter',{
            method:'POST',
            body:{
                openid:this.state.openid,
                name:this.state.personInfo.name,
                phone:this.state.personInfo.phone,
                mail:this.state.personInfo.mail
            }
        })
        if(result.state.code === 0){
            window.toast("欢迎来到iHCI平台")
        } else {
            window.toast(result.state.msg ||"操作失败，请稍后重试")
        }
    }

    render () {
        return (
            <Page title = {"加入iHCI"} className = "enter-page">
              <div className = "title">关于iHCI</div>
              <div className = "desc">iHCI的详情</div>
              <div className = "header">加入iHCI</div>
              <div className="edit-con">
                    <div className="before">姓名</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                    {this.state.infoCheck.illegalName && <div className='after error'>名字以不超过12个的英文、汉字、数字、下划线与短横构成，并以中文或英文开头</div>}
                </div>

                <div className="edit-con">    
                    <div className="before">邮箱</div>
                    <input type="text" onChange={this.mailInputHandle} className="input-edit" value={this.state.personInfo.mail}/>
                    {this.state.infoCheck.illegalEmailAddress && <div className='after error'>格式错误,请填写正确格式的邮件地址</div>}
                        
                </div>

                <div className="edit-con">
                    <div className="before">手机</div>
                    <input type="text" onChange={this.phoneInputHandle} className="input-edit" value={this.state.personInfo.phone}/>
                    {this.state.infoCheck.illegalPhoneNumber && <div className='after error'>格式错误,请填写正确格式的电话号码</div>}
                </div>
                <div className = "enter-btn" onClick = {this.enterHandle}>加入</div>
            </Page>
        )
    }
}