import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'
import FollowDialog from '../../../components/follow-dialog'

export default class Person extends React.Component{
    componentDidMount = async() => {
        this.personInfo = {}
        if(INIT_DATA.userObj) {
            this.setState({
                userObj: INIT_DATA.userObj,
                personInfo: INIT_DATA.userObj.personInfo || {
                    name: '',
                    mail: '',
                    phone: '',
                    headImg: INIT_DATA.userObj && INIT_DATA.userObj.wxUserInfo && INIT_DATA.userObj.wxUserInfo.headimgurl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnregyyDrMvhEDpfC4wFetzykulWRVMGF-jp7RXIIqZ5ffEdawIA',
                }
            })
        } else {
            // todo 可以优化为客户端渲染
            window.location.reload()
        }

        if(INIT_DATA.userObj.wxUserInfo) {
            this.setState({
                ...this.state.personInfo,
                headImg: INIT_DATA.userObj.wxUserInfo.headimgurl
            })
        }

        if(this.props.location.query.alreadyBind) {
            window.toast("该微信号已经绑定")
            history.pushState({}, {}, '/person')
        }

        if(INIT_DATA.userObj.personInfo.mail.length>0)
        {
            this.setState({
                hasMail: true,
            })
        }
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
        showFollow: false,
        userObj: {},
        personInfo: {
            name: '',
            headImg: '',
            phone: '',
            mail: '',
        },
        infoCheck:{
            illegalEmailAddress: false,
            illegalPhoneNumber:false,
        },
        confirmEditMail: false,
        submittable: false,
        hasMail: false,
    }

    headImgInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                headImg: e.target.value
            }
        })
    }
    nameInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                name: e.target.value
            }
        })
    }

    isPhoneNumber = (phoneNumber) => {
        const reg = /^0?(1[0-9][0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/;
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
    openFollowDialogHandle = () => {
        this.setState({
            showFollow: true
        })
    }

    closeFollowDialogHandle = () => {
        this.setState({
            showFollow: false
        })
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

    infoCheckIllegal = () =>{
        var infoCheck = {
            illegalEmailAddress: false,
            illegalPhoneNumber:false,
        }

        if (!this.isEmailAddress(this.state.personInfo.mail)){
            infoCheck.illegalEmailAddress = true
        }

        if (!this.isPhoneNumber(this.state.personInfo.phone)){
            infoCheck.illegalPhoneNumber = true
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

    saveHandle = async () => {
        var infoCheckIllegal = this.infoCheckIllegal()

        if (this.infoCheckIllegal()){
            window.toast("设置失败，请检查格式")
            return
        }
        const result = await api('/api/setUserInfo', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })

        if(result.state.code === 0) {
            window.toast("设置成功")
            setTimeout(() => {
                location.href = location.href
            }, 300);
        } else {
            window.toast("设置失败，请稍后再试")
        }
    }

    logOutHandle = async () => {
        const result = await api('/api/logout', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })

        if(result.state.code === 0) {
            location.href = '/'
        }

    } 

    unbindHandle = async () => {
        const result = await api('/api/unbindWechat', {
            method: 'POST',
            body: {}
        })
        if(result.state.code === 0) {
            location.href = location.href
        } else {
            window.toast("解绑失败")
        }
    }

    activateMailHandle = async() => {
        if (this.state.personInfo.mail.length <= 0)
        {
            window.toast("邮箱未设置，请先修改邮箱")
            return
        }

        const result = await api('/api/activation', {
            method: 'POST',
            body: {
                mailAccount: this.state.personInfo.mail,
            }
        })

        if(result.state.code === 0) {
            window.toast("已发送激活邮件，请检查邮箱")
            setTimeout(() => {
                location.href = location.href
            }, 300);
        } else {
            window.toast("激活邮件发送失败，请稍后再试")
        }
    }

    editConfirmHangle = () => {
        this.setState({
            confirmEditMail: true,
        })
    }
    
    
    render() {
        // let personInfo = this.state.personInfo
        return (
            <Page title={"个人设置"} className="person-edit-page page-wrap">
                <div className="title">个人设置</div>

                <div className="head-edit">
                    <div className="left">
                        <img src={this.state.personInfo.headImg} className='head-img' />
                    </div>
                    <div className="right">
                        <input type="text" className="head-img-url" value={this.state.personInfo.headImg || ''} onChange={this.headImgInputHandle}/>
                        <div className="head-des">请输入头像图片URL地址</div>
                    </div>
                </div>

                <div className="edit-con">
                    <div className="before">微信</div>

                    { 
                        !!this.state.userObj.unionid ? 
                            <div className="bind-wx act">已绑定</div> 
                            : 
                            <div className="bind-wx">未绑定</div>  
                    }
                    {
                        !!this.state.userObj.unionid ? 
                            <div className="band" onClick={this.unbindHandle}>解绑</div>
                            :
                            <div className="band" onClick={this.openWxLoginHandle}>绑定</div>
                    }
                </div>

                <div className="edit-con">
                    <div className="before">服务号</div>

                    { !!this.state.userObj.subState ? <div className="bind-wx act">已关注</div> : <div className="bind-wx">未关注</div> }
                
                    { !!!this.state.userObj.subState && <div className='after'>需要<div className='follow-btn' onClick={this.openFollowDialogHandle}>关注服务号</div>才能接受讨论消息提醒</div>}


                </div>

                <div className="edit-con">
                    <div className="before">名字</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                </div>

                <div className="edit-con">
                    
                    <div className="before">邮箱</div>
                    {!this.state.confirmEditMail && 
                        <div className='mail-present-bar'>
                            <div className='after default-color'>
                                {this.state.personInfo.mail}
                            </div>
                            {!this.state.hasMail ?
                            <div className='edit-btn' onClick={this.editConfirmHangle}>设置邮箱</div>
                            : <div className='edit-btn' onClick={this.editConfirmHangle}>修改邮箱</div>
                            }
                            {this.state.hasMail &&
                                <div className='active-info'>
                                    {this.state.userObj.isLive ?
                                        <div className='active-info'><div className='iconfont icon-mail green'></div><div className='active-info'>邮箱已激活</div></div>
                                        : <div className='active-info'><div className='iconfont icon-mail yellow'></div><div className='active-info'>邮箱未<div className='activate-btn' onClick={this.activateMailHandle}>激活</div></div></div>
                                    }
                                </div>
                            }
                        </div>
                    }
                    {this.state.confirmEditMail && <input type="text" onChange={this.mailInputHandle} className="input-edit" value={this.state.personInfo.mail}/>}
                    {this.state.infoCheck.illegalEmailAddress && <div className='after error'>格式错误,请填写正确格式的邮件地址</div>}
                </div>

                <div className="edit-con">
                    <div className="before">手机</div>
                    <input type="text" onChange={this.phoneInputHandle} className="input-edit" value={this.state.personInfo.phone}/>
                    {this.state.infoCheck.illegalPhoneNumber && <div className='after error'>格式错误,请填写正确格式的电话号码</div>}
                </div>

                {/*
                    <div className="edit-con">
                        <div className="before">当前密码</div>
                        <input type="password" className="input-edit" />
                    </div>

                    <div className="edit-con">
                        <div className="before">新密码</div>
                        <input type="password" className="input-edit" />
                    </div>
                */}


                <div className="sava-btn" onClick={this.saveHandle}>保存</div>

                <div className="sava-btn" onClick={this.logOutHandle}>登出</div>
                
                {
                    this.state.showWxLogin && <WxLoginDialog state="bind" closeHandle={this.closeWxLoginHandle}/>
                }

                {
                    this.state.showFollow && <FollowDialog closeHandle={this.closeFollowDialogHandle}/>
                }

            </Page>
        )
    }
}


