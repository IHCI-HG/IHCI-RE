import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api, { authApi } from '../../../utils/api';
import {IhciJoin as staticText} from '../../../commen/static-text'

export default class IhciJoin extends React.Component{

    state = {
        openid:String,
        personInfo: {
            name: '',
            phone: '',
            mail: '',
        },
        infoCheck:{
            nameEmpty:true,
            phoneEmpty:true,
            emailEmpty:true,
            illegalEmailAddress: false,
            illegalPhoneNumber:false,
            illegalName: false,
        },
    }
    componentWillMount = () => {

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
                nameEmpty:false,
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
                phoneEmpty:false,
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
                emailEmpty:false,
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
        if(this.state.infoCheck.nameEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_NAME_EMPTY)
        }
        if(this.state.infoCheck.phoneEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_PHONE_EMPTY)
        }
        if(this.state.infoCheck.emailEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_EMAIL_EMPTY)
        }
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
            window.toast(staticText.RESPONSE_MESSAGE.WELCOME_IHCI_MSG)
            setTimeout(() => {
                history.go(-2)
            }, 1000)
        } else {
            window.toast(result.state.msg ||staticText.RESPONSE_MESSAGE.SUBMIT_ERROR_MSG)
        }
    }

    render () {
        return (
            <Page title = {staticText.PAGE_INFO.JOIN__BLOCK_TITLE} className = "enter-page">
                <div className="join-table">
                    <div className = "title">{staticText.PAGE_INFO.PAGE_TITLE}</div>
                    <div className = "desc">{staticText.PAGE_INFO.PAGE_IHCI_DESC}</div>
                    <div className = "head">{staticText.PAGE_INFO.JOIN_BLOCK_TITLE}</div>
                    <div className="edit-con">
                            <div className="before">{staticText.LABEL_TEXT.NAME_LABEL_TEXT}</div>
                            <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                            {this.state.infoCheck.illegalName && <div className='after error'>{staticText.PERSON_INFO_CHECK.CREATE_NAME_ILLEGAL}</div>}
                        </div>

                        <div className="edit-con">    
                            <div className="before">{staticText.LABEL_TEXT.EMAIL_LABEL_TEXT}</div>
                            <input type="text" onChange={this.mailInputHandle} className="input-edit" value={this.state.personInfo.mail}/>
                            {this.state.infoCheck.illegalEmailAddress && <div className='after error'>{staticText.PERSON_INFO_CHECK.CREATE_EMAIL_ILLEGAL}</div>}
                                
                        </div>

                        <div className="edit-con">
                            <div className="before">{staticText.LABEL_TEXT.PHONE_LABEL_TEXT}</div>
                            <input type="text" onChange={this.phoneInputHandle} className="input-edit" value={this.state.personInfo.phone}/>
                            {this.state.infoCheck.illegalPhoneNumber && <div className='after error'>{staticText.PERSON_INFO_CHECK.CREATE_PHONE_ILLEGAL}</div>}
                        </div>
                    <div className = "enter-btn" onClick = {this.enterHandle}>{staticText.BUTTON_TEXT.ENTER_IHCI_BUTTON}</div>
                </div>
              
            </Page>
        )
    }
}