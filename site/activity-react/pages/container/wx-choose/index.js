import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api, { authApi } from '../../../utils/api';
import {WxChoose as staticText} from '../../../commen/static-text'



export default class WxChoose extends React.Component{
    state = {
        openid:String,
        teamjoin:String,
        loginBlock:'',
        username:'',
        password:'',
        infoCheck:{
            usernameEmpty:true,
            passwordEmpty:true
        },
    }
    componentWillMount = () => {
        
    }
    componentDidMount = () => {
       //var textData = require('../../../text.json');
       this.setState({
           openid:this.props.location.query.openid,
           teamjoin:this.props.location.query.teamjoin
       })
    }
    setTologinHandle = () => {
        if(this.state.loginBlock !=="login"){
            this.setState({
                loginBlock:"login"
              });
        }else{
            this.setState({
                loginBlock:''
            });
        }      
    }
    usernameHandle = (e) => {
        const username = e.target.value;
        var usernameEmpty = true;
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
    loginHandle = async () => {
        if(this.state.infoCheck.usernameEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.ENTER_USERNAME_EMPTY)
            return
        }
        if(this.state.infoCheck.passwordEmpty){
            window.toast(staticText.PERSON_INFO_CHECK.ENTER_PASSWORD_EMPTY)
            return
        }

        const result = await authApi(this.state.username, this.state.password, this.state.openid)
        if(result.state.code === 0) {
            window.toast(staticText.RESPONSE_MESSAGE.WELCOME_BACK_MSG)
            setTimeout(() => {
                location.href = '/team'
            }, 1000)   
        } else {
            window.toast(result.state.msg || staticText.RESPONSE_MESSAGE.SUBMIT_ERROR_MSG)
        }
    }
    enterHandle = () =>{
        window.toast(staticText.RESPONSE_MESSAGE.COMPLETE_PERSON_INFO)
        setTimeout(() => {
            if(this.state.teamjoin){
                location.href = `/ihci-join?openid=${this.state.openid}&teamjoin=${this.state.teamjoin}`
            }else{
                location.href = `/ihci-join?openid=${this.state.openid}`
            }
        }, 1000)

    }

    resetPWDHandle = () =>{
        setTimeout(() => {
            location.href = '/password-reset'
        },500)
    }
    render () {
        return(
        <Page>
            {
                this.state.loginBlock === ''?
            <div className="auth-nav"> 
               <div className = "auth-header">{staticText.PAGE_INFO.CHOOSE_BLOCK_TITLE}</div>
               <div className = "login-desc">{staticText.PAGE_INFO.PAGE_IHCI_DESC}</div>
               <div className = "auth-nav-item" onClick={this.setTologinHandle}>{staticText.BUTTON_TEXT.BIND_ACCOUNT}</div>
               <div className = "auth-nav-item" onClick={this.enterHandle}>{staticText.BUTTON_TEXT.ENTER_IHCI}</div>
            </div>
            :""
            }
            {
                   this.state.loginBlock === "login"?
                   <div className="loginBlock">
                   <div className = "auth-header">{staticText.PAGE_INFO.ACCOUNT_BLOCK_TITLE}</div>
                   <div className ="login-desc">{staticText.LABEL_TEXT.SET_USERNAME}</div>
                   <input className="login-input" value={this.state.username} onChange={this.usernameHandle}></input>
                   <div className ="login-desc">{staticText.LABEL_TEXT.SET_PASSWORD}</div>
                   <input className="login-input" type="password" value={this.state.password} onChange={this.passwordHandle}></input>
                   <div className="login-btn" onClick={this.loginHandle}>{staticText.BUTTON_TEXT.SUBMIT}</div>
                   <div className="login-btn" onClick={this.setTologinHandle}>{staticText.BUTTON_TEXT.CANCEL}</div>
                   <div className = "login-desc" onClick={this.resetPWDHandle}>{staticText.BUTTON_TEXT.FORGET_PWD}</div>
                   </div>
                :""
            }
    </Page>
    )   
    }  
}
