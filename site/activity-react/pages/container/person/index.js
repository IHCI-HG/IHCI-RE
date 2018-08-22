import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'
import fileUploader from '../../../utils/file-uploader';
import FollowDialog from '../../../components/follow-dialog'
import api, { authApi } from '../../../utils/api';

import {Person as staticText} from '../../../commen/static-text'


export default class Person extends React.Component{
    componentDidMount = async() => {
        this.personInfo = {}
        this.originPersonInfo = {}
        if(INIT_DATA.userObj) {
            
            this.setState({
                userObj: INIT_DATA.userObj,
                personInfo: INIT_DATA.userObj.personInfo || {
                    name: '',
                    mail: '',
                    phone: '',
                    headImg: INIT_DATA.userObj && INIT_DATA.userObj.wxUserInfo && INIT_DATA.userObj.wxUserInfo.headimgurl || require('../DefaultImage.jpg'),
                },
                originPersonInfo: INIT_DATA.userObj.personInfo || {
                    name: '',
                    mail: '',
                    phone: '',
                    headImg: INIT_DATA.userObj && INIT_DATA.userObj.wxUserInfo && INIT_DATA.userObj.wxUserInfo.headimgurl || require('../DefaultImage.jpg'),
                }
            })
        } else {
            // todo 可以优化为客户端渲染
            window.location.reload()
        }

        if(INIT_DATA.userObj.wxUserInfo) {
            this.setState({
                ...this.state.personInfo,
                ...this.state.originPersonInfo,
                headImg: INIT_DATA.userObj.wxUserInfo.headimgurl
            })
        }

        if(this.props.location.query.alreadyBind) {
            window.toast(staticText.RESPONSE_MESSAGE.BIND_WX_FAIL)
            history.pushState({}, {}, '/person')
        }
        // else if (!this.initdataAllFilled()){
        //     window.toast("请先完成资料填写")
        // }

        if(!!INIT_DATA.userObj.personInfo)
            if(INIT_DATA.userObj.personInfo.mail.length>0)
            {
                this.setState({
                    hasMail: true,
                })
            }

    }

    initdataAllFilled = () => {
        if (!INIT_DATA.userObj.personInfo){
            return false
        }
        if (INIT_DATA.userObj.personInfo.name){
            return false
        }
        if (INIT_DATA.userObj.personInfo.mail){
            return false
        }
        if (INIT_DATA.userObj.personInfo.phone){
            return false
        }
        return true
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
        showUsenamePwd:false,
        userObj: {},
        personInfo: {
            name: '',
            headImg: '',
            phone: '',
            mail: '',
        },
        originPersonInfo:{
            name: '',
            headImg: '',
            phone: '',
            mail: '',
        },
        infoCheck:{
            illegalEmailAddress: false,
            illegalPhoneNumber:false,
            illegalName: false,
        },
        confirmEditMail: false,
        submittable: false,
        hasMail: false,
        sendMailEnabled: true,

        username:'',
        password:'',
        infoCheck:{
            illegalUsername:false,
            illegalPassword:false,
        },
    }

    
    usernameHandle = (e) => {
        const username = e.target.value;
        var illegalUsername = true;
        /*
        if(username){
            usernameEmpty = false
        }else{
            usernameEmpty = true
        }*/
        this.setState({  
            username: e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                illegalUsername:illegalUsername,
            }
        })
    }
    passwordHandle = (e) => {
        const password = e.target.value
        var illegalPassword = true
        /*
        if(password){
            passwordEmpty = false
        }else{
            passwordEmpty = true
        }
        */
        this.setState({
            password: password,
            infoCheck:{
                ...this.state.infoCheck,
                illegalPassword:illegalPassword,
                passwordEmpty:passwordEmpty
            }
        })
    }
    createUsernameHandle = (e) => {
        const createUsername = e.target.value
        var createUsernameEmpty = true
        if(createUsername){
            createUsernameEmpty = false
        }else{
            createUsernameEmpty = true
        }
        this.setState({
            createUsername: createUsername,
            infoCheck:{
                ...this.state.infoCheck,
                createUsernameEmpty:createUsernameEmpty
            }
        })
    }
    createPasswordHandle = (e) =>{
        const createPassword = e.target.value
        var createPasswordEmpty = true
        if(createPassword){
            createPasswordEmpty = false
        }else{
            createPasswordEmpty = true
        }
        this.setState({
            createPassword: createPassword,
            infoCheck:{
                ...this.state.infoCheck,
                createPasswordEmpty:createPasswordEmpty
            }
        })
    }
    createConfirmPasswordHandle = (e) =>{
        const confirmPassword = e.target.value
        var createConfirmPasswordEmpty = true
        if(confirmPassword){
            createConfirmPasswordEmpty = false
        }else{
            createConfirmPasswordEmpty = true
        }
        this.setState({
            createConfirmPassword:e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                createConfirmPasswordEmpty:createConfirmPasswordEmpty
            }
        })
    }
    loginHandle = async () => {
        if(this.state.infoCheck.usernameEmpty){
            // window.toast("用户名为空")
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_USERNAME_EMPTY);
            return
        }
        if(this.state.infoCheck.passwordEmpty){
            // window.toast("密码为空")
            window.toast(staticText.PERSON_INFO_CHECK.CREATE_PASSWORD_EMPTY);
            return
        }

        const result = await authApi(this.state.username, this.state.password, this.state.userObj.unionid)
        if(result.state.code === 0) {
            window.toast("成功")
            setTimeout(() => {
                location.href = '/person'
            }, 1000)   
        } else {
            window.toast(result.state.msg || "失败")
        }
    }
    signUpHandle = async () => {
        if(this.state.infoCheck.createUsernameEmpty){
            window.toast("用户名为空")
            return
        }
        if(this.state.infoCheck.createPasswordEmpty){
            window.toast("密码为空")
            return
        }
        if(this.state.infoCheck.createConfirmPasswordEmpty){
            window.toast("确认密码为空")
            return 
        }
        if(this.state.createPassword !== this.state.createConfirmPassword){
            window.toast("两次输入密码不同")
            return
        }
        const result = await api('/api/user/SignUpAndBindWx', {
            method: 'POST',
            body: {
                userInfo: {
                    username: this.state.createUsername,
                    password: this.state.createPassword,
                    unionid: this.state.userObj.unionid,
                }
            }
        })
    }
    
    headImgInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                headImg: e.target.value
            }
        })
    }

    isName = (name) => {
        const reg = /^[\u4E00-\u9FA5]{1}[\u4E00-\u9FA5\-]{0,11}$/;
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
        const reg =/^(86)?(13[0-9]|15[0-35-9]|17[035-8]|18[0-9]|14[57]|19[89])[0-9]{8}$/;
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

    saveHandle = async () => {
        var infoCheckIllegal = this.infoCheckIllegal()

        if (infoCheckIllegal){
            window.toast(staticText.PERSON_INFO_CHECK.PERSON_INFO_ILLEGAL)
            return
        }
        const result = await api('/api/setUserInfo', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })
        const result1 = await api('/api/topic/changeCreator',{
            method:'POST',
            body:{
                personInfo: this.state.personInfo,
                originPersonInfo: this.state.originPersonInfo,
            }
        })
        
        
        console.log(result1)
        if(result.state.code === 0) {
            if(INIT_DATA.userObj.personInfo){
                window.toast(staticText.RESPONSE_MESSAGE.SET_SUCCESS)
            }
            setTimeout(() => {
                location.href = '/team'
            }, 500);
        } else {
            window.toast(staticText.RESPONSE_MESSAGE.SET_FAIL)
        }
        if(!INIT_DATA.userObj.personInfo){
            const result = await api('/api/manual', {
                method: 'POST',
                body: {
                    mailAccount: this.state.personInfo.mail,
                }
            })
    
            if(result.state.code === 0) {
                window.toast(staticText.RESPONSE_MESSAGE.FIRST_SET_INFO_SUCCESS)
            }
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
            window.toast(staticText.RESPONSE_MESSAGE.UNBIND_WX_FAIL)
        }
    }
    
    openFileInput = () => {
        this.fileInput.click()
    }
    
    uploadFileHandle = async (e) => {

        var file = e.target.files[0];

        var arr = file.name.split('.')

        var type = arr.pop()
        type = type.toLowerCase()
        if(type != 'jpg' && type != 'jpeg' && type != 'png') {
            window.toast(staticText.PERSON_INFO_CHECK.IMAGE_ILLEGAL)
            return 
        }
        var newFile = new File([file],this.state.userObj._id+file.name)
        var ossKey = 'usrHeadImg'+'/'+Date.now()+'/'+newFile.name

        var succeeded;
        const uploadResult = fileUploader(newFile,ossKey)
        await uploadResult.then(function(val) {
            succeeded = 1
        }).catch(function(reason){
            console.log(reason)
            succeeded = 0
        })

        if(succeeded === 0) {
            window.toast(staticText.RESPONSE_MESSAGE.UPLOAD_IMAGE_FAIL)
            return
        } 

        window.toast(staticText.RESPONSE_MESSAGE.UPLOAD_IMAGE_SUCCESS)
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                headImg: window.location.origin+'/head/'+ossKey
            }
        })
        console.log(this.state.personInfo.headImg)
    }


    activateMailHandle = async() => {
        if(!this.state.sendMailEnabled){
            window.toast(staticText.RESPONSE_MESSAGE.ACTIVATE_MAIL_WAIT)
            return
        }

        if (this.state.personInfo.mail.length <= 0)
        {
            window.toast(staticText.RESPONSE_MESSAGE.ASKTO_SET_MAIL)
            return
        }

        const result = await api('/api/activation', {
            method: 'POST',
            body: {
                mailAccount: this.state.personInfo.mail,
            }
        })

        if(result.state.code === 0) {
            window.toast(staticText.RESPONSE_MESSAGE.ACTIVATE_MAIL_SUCCESS)
        } else {
            window.toast(staticText.RESPONSE_MESSAGE.ACTIVATE_MAIL_FAIL)
        }

        this.setState({
            sendMailEnabled: false,
        })

        setTimeout(() => {
            this.setState({
                sendMailEnabled: true,
            })
        }, 60000);

    }

    editConfirmHangle = () => {
        this.setState({
            confirmEditMail: true,
        })
    }
    UsernamePwdHandle = () => {
        this.setState({
            showUsenamePwd:true
        })
    }
    SaveUsenamePwdHandle = async () => {
            const result = await api('/api/user/fillUsernameAndPwd',{
                method: 'POST',
                body: {
                    username:this.state.username,
                    password:this.state.password,
                }
            })
            if(result.state.code === 0){
                window.toast(staticText.RESPONSE_MESSAGE.SET_SUCCESS)
                this.setState({
                    showUsenamePwd:false
                })
                setTimeout(() => {
                    window.location.reload()
                }, 500);
                
            }else{
                window.toast(result.state.msg ||staticText.RESPONSE_MESSAGE.SET_FAIL)
            }
    }
    render() {
        // let personInfo = this.state.personInfo
        return (
            <Page title={staticText.PAGE_INFO.PAGE_TITLE} className="person-edit-page page-wrap">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>
                <div className = "header">
                <div className="title">{staticText.PAGE_INFO.PAGE_TITLE}</div>
                <div className="manage" onClick={() => {location.href = '/team-management'}}>{staticText.BUTTON_TEXT.TEAM_EXIT}</div>
                </div>
                
                <div className="head-edit">
                    <div className="left">
                        <img src={this.state.personInfo.headImg} className='head-img' />
                    </div>
                    <div className="right">
                        <div className="create-btn" onClick={this.openFileInput}>{staticText.BUTTON_TEXT.UPLOAD_IMAGE}</div>
                    </div>
                </div>
                {
                    !this.state.userObj.username?
                    <div className = "edit-con">
                    <div className = "after">尚未设置账号密码，请</div><div className = "follow-btn" onClick = {this.UsernamePwdHandle}>{staticText.BUTTON_TEXT.SET_ACCOUNT}</div>
                    </div>
                    :""
                }
                {
                    this.state.showUsenamePwd?
                    <div className = "edit-con">
                    <div className = "before">账号：</div>
                    <input className = "input-edit" value = {this.state.username} onChange = {this.usernameHandle}></input>
                    <br/>
                    <div className = "before">密码：</div>
                    <input className = "input-edit" type = "password" value = {this.state.password} onChange = {this.passwordHandle}></input>
                    <div className = "save-btn" onClick = {this.SaveUsenamePwdHandle}>{staticText.BUTTON_TEXT.SUBMIT}</div>
                    </div>
                    :""
                }
                {
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
                        (!!this.state.userObj.username && !INIT_DATA.isWeixin?
                        <div className="band" onClick={this.unbindHandle}>解绑</div>:"")
                        :
                        <div className="band" onClick={this.openWxLoginHandle}>绑定</div>
                    
                    }
                </div>
                }
                {this.state.userObj.unionid ?
                <div className="edit-con">
                    <div className="before">服务号</div>
                    {!this.state.userObj.openid ? <div className="bind-wx ">未关注</div> : <div className="bind-wx act">已关注</div>}
                    {!this.state.userObj.openid && <div className='after'>需要<div className='follow-btn' onClick={this.openFollowDialogHandle}>关注服务号</div>才能接受讨论消息提醒</div>}   
                </div>:""
                }
                <div className="edit-con">
                    <div className="before">姓名</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                    {this.state.infoCheck.illegalName && <div className='after error'>加入iHCI要求实名</div>}
                </div>

                <div className="edit-con">
                    
                    <div className="before">邮箱</div>
                    {(!this.state.confirmEditMail && this.state.hasMail) && 
                        <div className='mail-present-bar'>
                            <div className='after default-color'>
                                {this.state.personInfo.mail}
                            </div>
                            <div className='edit-btn' onClick={this.editConfirmHangle}>修改邮箱</div>
 
                            <div className='active-info'>
                                {this.state.userObj.isLive ?
                                    <div className='active-info'><div className='iconfont icon-mail green'></div><div className='active-info'>邮箱已激活</div></div>
                                    : <div className='active-info'><div className='iconfont icon-mail yellow'></div><div className='active-info'>邮箱未<div className={this.state.sendMailEnabled ? 'activate-btn-active' : 'activate-btn'} onClick={this.activateMailHandle}>激活</div></div></div>
                                }
                            </div>
                        </div>}
                    {(!this.state.hasMail || this.state.confirmEditMail) && <input type="text" onChange={this.mailInputHandle} className="input-edit" value={this.state.personInfo.mail}/>}
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


                <div className="save-btn" onClick={this.saveHandle}>保存</div>
                {
                    !INIT_DATA.isWeixin&&<div className="save-btn" onClick={this.logOutHandle}>登出</div>
                }
                
                {
                    this.state.showWxLogin && <WxLoginDialog state="bind" closeHandle={this.closeWxLoginHandle}/>
                }

                {
                    this.state.showFollow && <FollowDialog subState = {this.state.userObj.openid?true:false} closeHandle={this.closeFollowDialogHandle}/>
                }

            </Page>
        )
    }
}


