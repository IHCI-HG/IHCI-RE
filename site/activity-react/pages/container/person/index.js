import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'
import WxLoginDialog from '../../../components/wx-login-dialog'
import fileUploader from '../../../utils/file-uploader';

export default class Team extends React.Component{
    componentDidMount = async() => {
        this.personInfo = {}
        console.log(INIT_DATA);

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
        userObj: {},
        personInfo: {
            // name: '阿鲁巴大将军',
            // headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
            // phone: '17728282828',
            // mail: 'ada@qq.com',
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
    nameInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                name: e.target.value
            }
        })
    }
    phoneInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                phone: e.target.value
            }
        })
    }
    mailInputHandle = (e) => {
        this.setState({
            personInfo: {
                ...this.state.personInfo,
                mail: e.target.value
            }
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


    saveHandle = async () => {
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
    
    openFileInput = () => {
        this.fileInput.click()
    }
    
    uploadFileHandle = async (e) => {

        var file = e.target.files[0];

        var arr = file.name.split('.')

        var type = arr.pop()
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

    
    render() {
        let personInfo = this.state.personInfo
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
                    

                    <div>需要关注服务号才能接受讨论消息提醒</div>


                </div>

                <div className="edit-con">
                    <div className="before">名字</div>
                    <input type="text" onChange={this.nameInputHandle} className="input-edit"  value={personInfo.name}/>
                </div>

                <div className="edit-con">
                    <div className="before">邮箱</div>
                    <input type="text" onChange={this.mailInputHandle} className="input-edit" value={personInfo.mail}/>
                </div>

                <div className="edit-con">
                    <div className="before">手机</div>
                    <input type="text" onChange={this.phoneInputHandle} className="input-edit" value={personInfo.phone}/>
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
            </Page>
        )
    }
}


