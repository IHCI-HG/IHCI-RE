import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api, { authApi } from '../../../utils/api';
import {IhciJoin as staticText} from '../../../commen/static-text'
import SMSBlock from '../../../components/smsCode'

export default class IhciJoin extends React.Component{

    state = {
        openid:String,
        personInfo: {
            name: '',
            phone: '',
        },  
        smsCode:'',
        infoCheck:{
            nameEmpty:true,
            phoneEmpty:true,
            codeEmpty:true,
            illegalPhoneNumber:false,
            illegalName: false,
        },
    }
    componentWillMount = () => {

    }
    componentDidMount = () => {
        //var textData = require('../../../text.json');
        this.setState({
            openid:this.props.location.query.openid,
            teamjoin:this.props.location.query.teamjoin,
            personInfo:{
                phone: window.sessionStorage.getItem('phone')||'',
                name: window.sessionStorage.getItem('name')||''
            }
        },() =>{
            if(this.state.personInfo.phone !== ''){
                this.setState({
                    infoCheck: {
                        ...this.state.infoCheck,
                        phoneEmpty:false,
                    }
                })
            }
            if(this.state.personInfo.name !== ''){
                this.setState({
                    infoCheck: {
                        ...this.state.infoCheck,
                        nameEmpty:false,
                    }
                })
            }
        })
             
     }
    isName = (name) => {
        const reg = /^[\u4E00-\u9FA5A-Za-z]{1}[\u4E00-\u9FA5A-Za-z0-9_\-]{0,11}$/;
        return reg.test(name);
    }

    nameInputHandle = (e) => {
        const name = e.target.value
        let nameEmpty = true
        if(name){
            nameEmpty = false
        }else{
            nameEmpty = true
        }
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
                nameEmpty:nameEmpty,
            },
        },() =>{
            window.sessionStorage.setItem('name',name)
        })
    }

    isPhoneNumber = (phoneNumber) => {
        const reg = /^0?(13[0-9]|15[0-3,5-9]|17[0,3,5-8]|18[0-9]|14[57]|19[89])[0-9]{8}$/;
        return reg.test(phoneNumber);
    }

    phoneInputHandle = (e) => {
        const phoneNumber = e.target.value
        let phoneEmpty = true
        if(phoneNumber){
            phoneEmpty = false
        }else{
            phoneEmpty = true
        }
        var illegalPhoneNumber = false
        if (!this.isPhoneNumber(phoneNumber)){
            illegalPhoneNumber = true
        }
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                phone: phoneNumber,
            },
            infoCheck: {
                ...this.state.infoCheck,
                illegalPhoneNumber: illegalPhoneNumber,
                phoneEmpty:phoneEmpty,
            },
        },() => {
            window.sessionStorage.setItem('phone',phoneNumber)
        })  
         
    }

    infoCheckIllegal = () =>{
        var infoCheck = {
            illegalEmailAddress: false,
            illegalPhoneNumber: false,
            illegalName: false,
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
        if(this.state.infoCheck.nameEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_NAME_EMPTY)
        }
        if(this.state.infoCheck.phoneEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_PHONE_EMPTY)
        }
        if(this.state.infoCheck.codeEmpty){
            window.toast("验证码为空")
        }
        const result = await api('/api/user/wxEnter',{
            method:'POST',
            body:{
                openid:this.state.openid,
                name:this.state.personInfo.name,
                phone:this.state.personInfo.phone,
                code:this.state.smsCode
            }
        })

        if(result.state.code === 0){
            window.sessionStorage.removeItem('phone')
            window.sessionStorage.removeItem('count')
            window.sessionStorage.removeItem('number')
            window.sessionStorage.removeItem('name')
            window.toast(staticText.RESPONSE_MESSAGE.WELCOME_IHCI_MSG)
            setTimeout(() => {
                if(this.state.teamjoin){
                    location.href = `/team-join/${this.state.teamjoin}`                    
                }else{
                    location.href = '/team'
                }
            }, 1000)
        } else {
            window.toast(result.state.msg ||staticText.RESPONSE_MESSAGE.SUBMIT_ERROR_MSG)
        }
    }

    smsCodeInputHandle = (e) =>{
        const code = e.target.value
        let codeEmpty = true
        if(code){
            codeEmpty = false
        }else{
            codeEmpty = true
        }
        this.setState({
            smsCode: code,
            infoCheck:{
                ...this.state.infoCheck,
                codeEmpty:false
            }
        })

    }
    
    render () {
        return (
            <Page title = {staticText.PAGE_INFO.JOIN__BLOCK_TITLE} className = "enter-page">
                <div className="join-table">
                    <div className = "title">{staticText.PAGE_INFO.PAGE_TITLE}</div>
                    <div className = "desc">{staticText.PAGE_INFO.PAGE_IHCI_DESC}</div>
                    <div className = "head">{staticText.PAGE_INFO.JOIN_BLOCK_TITLE}</div>
                    <div className="edit-con">
                            <div className="before">{staticText.LABEL_TEXT.SET_NAME}</div>
                            <input type="text"  onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                            {this.state.infoCheck.illegalName && <div className='after error'>{staticText.PERSON_INFO_CHECK.CREATE_NAME_ILLEGAL}</div>}
                        </div>

                        <div className="edit-con">
                            <div className="before">{staticText.LABEL_TEXT.SET_PHONE}</div>
                            <input type="number" pattern="[0-9]*" onChange={this.phoneInputHandle} className="input-edit" value={this.state.personInfo.phone}/>
                            {this.state.infoCheck.illegalPhoneNumber && <div className='after error'>{staticText.PERSON_INFO_CHECK.CREATE_PHONE_ILLEGAL}</div>}
                            
                        </div>
                        <div className = "edit-con">
                        <SMSBlock smsCodeInputHandle = {this.smsCodeInputHandle}
                                  smsCode = {this.state.smsCode}
                                  phoneNumber = {this.state.personInfo.phone}
                                  phoneEmpty = {this.state.infoCheck.phoneEmpty}
                                  ></SMSBlock>
                        </div>
                        <div className = "edit-con"><div className = "enter-btn" onClick = {this.enterHandle}>{staticText.BUTTON_TEXT.ENTER_IHCI}</div></div>      
                </div>
              
            </Page>
        )
    }
}