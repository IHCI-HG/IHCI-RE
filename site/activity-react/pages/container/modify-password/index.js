import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';
const sha256 = require('crypto-js/SHA256');


export default class ModidyPassword extends React.Component{
    state = {
        currentPwd : '',
        newPwd :'',
        username:''
    }
    componentDidMount = async() => {
        const result = await api('/api/getMyInfo', {
            method: 'POST',
            body: {}    
        })
        
        this.setState({
            username:result.data.userObj.username
        })
    }
    currentPwdHandle = async (e) =>{
        const currentPwd = e.target.value
        this.setState({
           currentPwd:currentPwd
        })
    }
    newPwdHandle = async (e) =>{
        const newPwd = e.target.value
        this.setState({
            newPwd:newPwd
        })
    }
    saveChangePwd = async() =>{
        const oldPassword = sha256(this.state.currentPwd).toString()
        const newPassword = sha256(this.state.newPwd).toString()
        const result =  await api('/api/modifyPassword',{
            method:'POST',
            body:{
                username:this.state.username,
                oldPassword:oldPassword,
                newPassword:newPassword
            }
        })
      
        if(result.state.code === 1){
            window.toast(result.state.msg)
            return
        }
        if(result.state.code === 0){
            window.toast(result.state.msg)
            location.href = './team'
        }

    }
    
 
    
    render() {
        return (
            <Page title="修改密码" className="modify-password">  
            <div className="page-wrap">  
                <h2>修改密码</h2>      
                <br/>       
                <div className="edit-con">
                <div className="before">当前密码</div>
                <input type="password" className="input-edit" 
                    onChange={this.currentPwdHandle} value={this.state.currentPwd} autoFocus
                />
            </div>
            <div className="edit-con">
                <div className="before">新密码</div>
                <input type="password" className="input-edit" 
                    onChange={this.newPwdHandle} value={this.state.newPwd}
                />
            </div>
            <span className="saveChangePwd" onClick={this.saveChangePwd} >保存修改密码</span>
            </div>
            </Page>
        )
    }
}


