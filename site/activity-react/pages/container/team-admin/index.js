import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'
import fileUploader from '../../../utils/file-uploader';
import {create} from '../../../../../server/components/uuid/uuid'

export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        this.teamId = this.props.params.id
        this.initTeamInfo(this.teamId)
    }

    initTeamInfo = async (teamId) => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: teamId
            }
        })
        const teamObj = result.data.teamObj
        this.teamInfo = teamObj
        this.setState({
            name: teamObj.name,
            teamImg: teamObj.teamImg,
            desc: teamObj.teamDes,

        })

        const memberList = []
        const memberIDList = []
        result.data.teamObj.memberList.map((item) => {
            memberIDList.push(item.userId)
        })

        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })
        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.teamObj.memberList[idx],
                showAdmin: false
            })
        })

        this.setState({
            memberList: memberList
        })
    }

    state = {
        name: '',
        teamImg: '',
        desc: '',

        memberList: [],
        showAddMemberDialog: false,

        infoCheck:{
            illegalName: false,

        }

    }

    isName = (name) => {
        const reg = /^[\u4E00-\u9FA5A-Za-z]{1}[\u4E00-\u9FA5A-Za-z0-9_\-]{0,11}$/;
        return reg.test(name);
    }
    teamNameInputHandle = (e) => {
        const name = e.target.value
        var illegalName = false
        if (!this.isName(name)){
            illegalName = true
        }
        this.setState({    
            name: name,
            infoCheck: {
                ...this.state.infoCheck,
                illegalName: illegalName,
            },    
        })

        this.setState({
            name: e.target.value
        })
    }
    teamImgChangeHandle = (e) => {
        this.setState({
            teamImg: e.target.value
        })
    }
    teamDescChangeHandle = (e) => {
        this.setState({
            desc: e.target.value
        })
    }

    showAdminHandle = (id) => {
        const memberList = this.state.memberList
        memberList.map((item) => {
            if(item._id == id) {
                item.showAdmin = !item.showAdmin
            }
        })
        this.setState({
            memberList: memberList
        })
    } 

    setUserRoleHandle = (id, role) => {
   
        const memberList = this.state.memberList
        memberList.map((item) => {
            if(item._id == id) {
                item.role = role
            }
        })
        this.setState({
            memberList: memberList
        })
    }

    kikMember = async (id) => {
        if(id == this.props.personInfo._id) {
            window.toast('你无法踢出自己!')
            return
        }
        let isCreator = false
        this.teamInfo.memberList.map((item) => {
            if(item.userId == id && item.role == 'creator') {
                let isCreator = true
            } 
        })
        if(isCreator) {
            window.toast('无法踢出创建者')
            return 
        }

        const memberResult = await api('/api/team/kikMember', {
            method: 'POST',
            body: { memberId: id, teamId: this.teamId }
        })

        window.toast(memberResult.state.msg)

        if(memberResult.state.code == 0) {
            location.href = location.href
        }
    }

    infoCheckIllegal = () =>{
        var infoCheck = {
            illegalName: false,
        }
        if (!this.isName(this.state.name)){
            infoCheck.illegalName = true
        }
        this.setState({
            infoCheck: infoCheck,
        })
        for(var key in infoCheck)
        {
            if (infoCheck[key])
                return true
        }
        return false
    }

    saveBtnHandle = async () => {
        var infoCheckIllegal = this.infoCheckIllegal()

        if (infoCheckIllegal){
            window.toast("设置失败，请检查格式")
            return
        }
        const result = await api('/api/team/modifyTeamInfo', {
            method: 'POST',
            body: {
                teamId: this.teamId,
                teamInfo: {
                    name: this.state.name,
                    teamImg: this.state.teamImg,
                    teamDes: this.state.desc
                }
            }
        })

        if(result.state.code === 0) {
           
            window.toast("设置成功")
            setTimeout(location.href = '/team/' + this.teamId,10000)
        }
    } 

    showAddMemberDialogHandle = () => {
        this.setState({showAddMemberDialog: true})
    }
    hideAddMemberDialogHandle = (e) => {
        if(e.target.className == 'add-member-dialog-bg' || e.target.className == 'close') {
            this.setState({showAddMemberDialog: false})
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
        var nameParts = file.name.split('.')
        var ossKey = this.teamId + '/' + create() + '.' + nameParts[nameParts.length-1]
        var newFile = new File([file],ossKey)
        var succeeded;
        const uploadResult = fileUploader(newFile,ossKey)
        await uploadResult.then(function(val) {
            succeeded = 1
        }).catch(function(reason){
       
            succeeded = 0
        })

        if(succeeded === 0) {
            window.toast("上传图片失败")
            return
        } 

        window.toast("上传图片成功")
        this.setState({
            teamImg: window.location.origin+'/img/'+ossKey
        })
    }
    copyHandle = () => {
        var copyVal = document.getElementById("copyVal");
        copyVal.select();
        try{
            if(document.execCommand('copy', false, null)){
             
                window.toast('复制成功');
            }
            else{
                window.toast('复制失败');
          
            }
            
        }catch(err){
                console.error(err);
        }
    } 
    


    render() {
        return (
            <Page title={"团队设置"} className="team-admin-page">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>
                {
                    this.state.showAddMemberDialog && <div className="add-member-dialog-bg" onClick={this.hideAddMemberDialogHandle}>
                        <div className="add-member-dialog">
                            <div><img className="close" type="button" src={require('../team-admin/icon_close.png')} alt=""/></div>
                            <div className="des">将下面的公共邀请链接发送给需要邀请的人</div>
                            <input type="text" id="copyVal" readOnly value={`${location.host}/team-join/${this.teamId}`} className="invite-input" />
                            <button className="copyBtn" onClick={this.copyHandle}>点击复制到剪贴板</button>
                        </div>
                    </div>
                } 

                <div className="team-admin-con page-wrap">
                    <div className="admin-title-bg">团队设置</div>
                    

                    <div className="admin-title-sm">团队名称</div>
                    <input type="text" value={this.state.name} className="admin-input" onChange={this.teamNameInputHandle} />
                    {this.state.infoCheck.illegalName && <div className="after error">名字以不超过12个的英文、汉字、数字、下划线与短横构成</div>}

                    <div className="admin-title-sm">团队图片</div>
                    <div className="img-wrap">
                        <div>
                            <img className="img-preview" src={this.state.teamImg}></img>
                        </div>
                        <div className="create-btn" onClick={this.openFileInput}> 上传图片 </div>
                    </div>

                    <div className="admin-title-sm">团队说明</div>
                    <textarea type="text" value={this.state.desc} className="admin-tra" onChange={this.teamDescChangeHandle} placeholder="(选填)" />

                    <div className="sava-btn" onClick={this.saveBtnHandle}>保存设置</div>

                    <div className="admin-title-bg flex"> <span>团队成员管理</span> <span className='add' onClick={this.showAddMemberDialogHandle}>添加成员</span> </div>

                    <div className="member-list">
                        {
                            this.state.memberList.map((item) => {
                                return(
                                    <div className="member-item" key={'member-item-' + item._id}>
                                        <img src={item.headImg} alt="" className="head-img"/>
                                        <span className="name">{item.name}</span>
                                        <span className="phone">{item.phone}</span>
                                        <span className="mail">{item.mail}</span>
                                        <span className="role" onClick={this.showAdminHandle.bind(this, item._id)}>{item.role} {item.showAdmin ? '↑' : '↓'} </span>
                                        {
                                            item.showAdmin && <div className="admin">
                                                {/* <div className="admin-item" onClick={this.setUserRoleHandle.bind(this, item._id, 'admin')}>管理员</div>*}
                                                <div className="admin-item" onClick={this.setUserRoleHandle.bind(this, item._id, 'member')}>成员</div>*/}
                                                <div className="admin-item" onClick={this.kikMember.bind(this, item._id)}>踢出队伍</div>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

            </Page>
        )
    }
}


