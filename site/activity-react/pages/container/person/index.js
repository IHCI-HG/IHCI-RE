import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'
import fileUploader from '../../../utils/file-uploader';
import FollowDialog from '../../../components/follow-dialog'

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
                    headImg: INIT_DATA.userObj && INIT_DATA.userObj.wxUserInfo && INIT_DATA.userObj.wxUserInfo.headimgurl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnregyyDrMvhEDpfC4wFetzykulWRVMGF-jp7RXIIqZ5ffEdawIA',
                },
                originPersonInfo: INIT_DATA.userObj.personInfo || {
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
                ...this.state.originPersonInfo,
                headImg: INIT_DATA.userObj.wxUserInfo.headimgurl
            })
        }

        if(this.props.location.query.alreadyBind) {
            window.toast("该微信号已经绑定")
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

        loginBlock:'',
        username:'',
        password:'',
        createUsername: '',
        createPassword: '',
        createConfirmPassword:'',
        infoCheck:{
            createUsernameEmpty: true,
            createPasswordEmpty:true,
            createConfirmPasswordEmpty: true,
            usernameEmpty:true,
            passwordEmpty:true
        },
    }

    setTologinHandle = () => {
        this.setState({
          loginBlock:"login"
        });
    }
    setTosignUpHandle = () => {
        this.setState({
            loginBlock:"signUp"
        });
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
            window.toast("用户名为空")
            return
        }
        if(this.state.infoCheck.passwordEmpty){
            window.toast("密码为空")
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
        if(result.state.code === 0) {
            window.toast("注册成功")
            setTimeout(() => {
                location.href = '/person'
            }, 300);
        }
        else{
            window.toast(result.state.msg || "注册失败")
        }
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
            window.toast("设置失败，请检查格式")
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
                window.toast("设置成功")
            }
            setTimeout(() => {
                location.href = '/team'
            }, 500);
        } else {
            window.toast("设置失败，请稍后再试")
        }
        if(!INIT_DATA.userObj.personInfo){
            const result = await api('/api/manual', {
                method: 'POST',
                body: {
                    mailAccount: this.state.personInfo.mail,
                }
            })
    
            if(result.state.code === 0) {
                window.toast("设置成功，已发送使用说明邮件，请检查邮箱")
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
            window.toast("解绑失败")
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
            window.toast("文件格式必须是JPG，JPEG或PNG")
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
            window.toast("上传图片失败")
            return
        } 

        window.toast("上传图片成功")
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
            window.toast("请不要重复提交激活请求，请等待60s后再尝试发送")
            return
        }

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
        } else {
            window.toast("激活邮件发送失败，请稍后再试")
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
    
    render() {
        // let personInfo = this.state.personInfo
        return (
            <Page title={"个人设置"} className="person-edit-page page-wrap">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>
                <div className="title">个人设置</div>

                <div className="head-edit">
                    <div className="left">
                        <img src={this.state.personInfo.headImg} className='head-img' />
                    </div>
                    <div className="right">
                        <div className="create-btn" onClick={this.openFileInput}> 上传图片 </div>
                    </div>
                </div>
                
                {
                    !!this.state.userObj.username?
                    <div className="edit-con"> 
                       <div className = "login" onClick={this.setTologinHandle}>绑定已有平台账号</div>
                       <div className = "signUp" onClick={this.setTosignUpHandle}>注册平台账号</div>
                    </div>
                       :"" 
                }
                {
                    this.state.loginBlock === "login"?
                    <div className="loginBlock">
                    <div className ="login-desc">Enter username: </div>
                    <input classNmae="login-input" value={this.state.userObj.username} onChange={this.usernameHandle}></input>
                    <div className ="login-desc">Enter password: </div>
                    <input classNmae="login-input" type="password" value={this.state.userObj.password} onChange={this.passwordHandle}></input>
                    <div className="login-btn" onClick={this.loginHandle}>LoginAndBind</div>
                    </div>
                    :""
                }
                {
                    this.state.loginBlock === "signUp"?
                    <div className="signBlock">
                    <div className="login-desc">Your username: </div>
                    <input className="login-input" value={this.state.createUsername} onChange={this.createUsernameHandle}></input>
                    <div className = "login-desc">Your password: </div>
                    <input className="login-input" type="password" value={this.state.createPassword} onChange={this.createPasswordHandle}></input>
                    <div className="login-desc">Confirm Password: </div>
                    <input className="login-input" type="password" value={this.state.createConfirmPassword} onChange={this.createConfirmPasswordHandle}></input>
                    <div className="login-btn" onClick={this.signUpHandle}>SighUpAndBind</div>
                    </div>
                    :""
                }
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

                    {!!!this.state.userObj.subState && <div className='after'>需要<div className='follow-btn' onClick={this.openFollowDialogHandle}>关注服务号</div>才能接受讨论消息提醒</div>}



                </div>

                <div className="edit-con">
                    <div className="before">名字</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={this.state.personInfo.name}/>
                    {this.state.infoCheck.illegalName && <div className='after error'>名字以不超过12个的英文、汉字、数字、下划线与短横构成，并以中文或英文开头</div>}
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
                <div className="save-btn" onClick={this.logOutHandle}>登出</div>
                <div className="save-btn" onClick={()=>{location.href = '/team-management'}}>团队管理</div>
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


