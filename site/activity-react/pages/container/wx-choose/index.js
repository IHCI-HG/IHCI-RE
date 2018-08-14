import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';

export default class wxChoose extends React.Component{
    state = {
        openid:String,
        loginBlock:'',
        username:'',
        password:'',
        infoCheck:{
            usernameEmpty:true,
            passwordEmpty:true
        },
    }
    componentDidMount = () => {
       this.setState({
           openid:this.props.location.query.openid
       });
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
            window.toast("用户名为空")
            return
        }
        if(this.state.infoCheck.passwordEmpty){
            window.toast("密码为空")
            return
        }

        const result = await authApi(this.state.username, this.state.password, this.state.openid)
        if(result.state.code === 0) {
            window.toast("成功")
            setTimeout(() => {
                location.href = '/person'
            }, 1000)   
        } else {
            window.toast(result.state.msg || "失败")
        }
    }
    
    render () {
        return(
        <Page>
            {
                this.state.loginBlock === ''?
            <div className="auth-nav"> 
               <div className = "auth-header">欢迎来到iHCI平台</div>
               <div className = "login-desc">iHCI平台介绍</div>
               <div className = "auth-nav-item" onClick={this.setTologinHandle}>绑定账号</div>
               <div className = "auth-nav-item" onClick={()=>{location.href = '/'}}>直接进入平台</div>
            </div>
            :""
            }
            {
                   this.state.loginBlock === "login"?
                   <div className="loginBlock">
                   <div className = "auth-header">绑定已有账号</div>
                   <div className ="login-desc">账号: </div>
                   <input className="login-input" value={this.state.username} onChange={this.usernameHandle}></input>
                   <div className ="login-desc">密码: </div>
                   <input className="login-input" type="password" value={this.state.password} onChange={this.passwordHandle}></input>
                   <div className="login-btn" onClick={this.loginHandle}>确定</div>
                   <div className="login-btn" onClick={this.setTologinHandle}>取消</div>
                   </div>
                :""
            }
    </Page>
    )   
    }  
}
