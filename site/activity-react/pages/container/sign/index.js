import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'

export default class Sign extends React.Component{
    componentDidMount = async() => {
    }

    starHandle = async (id) => {
        const result = await api('/api/base/sys-time', {
            method: 'GET',
            body: {}
        })
        if(result) {
            const teamList = this.state.teamList
            teamList.map((item) => {
                if(item.id == id) {
                    item.marked = !item.marked
                }
            })
            this.setState({
                teamList: teamList
            })
        }
    }

    state = {
        showWxLogin: false,
        fromWx: false,

        username: '',
        password: '',
    }

    openWxLoginHandle = () => {
        this.setState({
            showWxLogin: true
        })
    }
    closeWxLoginHandle = () => {
        this.setState({
            showWxLogin: false
        })
    }

    userNameInputHandle = async (e) => {
        // todo 检查账号是否已经存在 
        this.setState({
            username: e.target.value
        })
    }

    passWordInputHandle = (e) => {
        // todo 检验密码有效性
        this.setState({
            password: e.target.value
        })
    }

   
    signHandle = async () => {
        // todo 检验账号密码是否可用
        const mailCode = this.randomChar()
        const result = await api('/api/signUp', {
            method: 'POST',
            body: {
                userInfo: {
                    username: this.state.username,
                    password: this.state.password,
                },
            }
        })

     

        if(result.state.code === 0) {
            location.href = '/person'
        }
    }

    
    render() {
        let personInfo = this.state.personInfo
        return (
            <Page title={"注册"} className="person-edit-page page-wrap">

                {
                    this.state.fromWx && <div>请补充账户信息</div>
                }

                <div>
                    <input value={this.state.username} onChange={this.userNameInputHandle} type="text"/>
                </div>
                <div>
                    <input value={this.state.password} onChange={this.passWordInputHandle} type="password"/>
                </div>

                <div onClick={this.signHandle}>确定</div>

                {
                    this.state.showWxLogin && <WxLoginDialog state="bind" closeHandle={this.closeWxLoginHandle}/>
                }
            </Page>
        )
    }
}


