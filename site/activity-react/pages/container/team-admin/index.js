import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'

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
        const teamObj = result.data
        this.teamInfo = teamObj
        this.setState({
            name: teamObj.name,
            teamImg: teamObj.teamImg,
            desc: teamObj.teamDes,

        })

        const memberList = []
        const memberIDList = []
        result.data.memberList.map((item) => {
            memberIDList.push(item.userId)
        })

        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })

        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.memberList[idx],
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
        showAddMemberDialog: false
    }

    teamNameInputHandle = (e) => {
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
        console.log(role);
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

        console.log("ssssssssssss");

        const memberResult = await api('/api/team/kikMember', {
            method: 'POST',
            body: { memberId: id, teamId: this.teamId }
        })

        window.toast(memberResult.state.msg)

        if(memberResult.state.code == 0) {
            location.href = location.href
        }
    }

    saveBtnHandle = async () => {
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
            console.log(result);
            window.toast("设置成功")
            location.href = '/discuss/' + this.teamId
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

    render() {
        return (
            <Page title={"团队设置"} className="team-admin-page">

                {
                    this.state.showAddMemberDialog && <div className="add-member-dialog-bg" onClick={this.hideAddMemberDialogHandle}>
                        <div className="add-member-dialog">
                            <div className="close">X</div>
                            <div className="des">将下面的公共邀请链接通发送给需要邀请的人</div>
                            <input type="text" value={`${location.host}/team-join/${this.teamId}`} className="invite-input" />
                        </div>
                    </div>
                } 

                <div className="team-admin-con page-wrap">
                    <div className="admin-title-bg">团队设置</div>

                    <div className="admin-title-sm">团队名称</div>
                    <input type="text" value={this.state.name} className="admin-input" onChange={this.teamNameInputHandle} />

                    <div className="admin-title-sm">团队图片</div>
                    <div className="input-warp">
                        <div className="input-help">请输入图片URL，建议图片比例为16：9</div>
                        <input type="text" value={this.state.teamImg} className="admin-input" onChange={this.teamImgChangeHandle} />
                    </div>
                    <img className="img-preview" src={this.state.teamImg}></img>

                    <div className="admin-title-sm">团队说明</div>
                    <textarea type="text" value={this.state.desc} className="admin-tra" onChange={this.teamDescChangeHandle} />

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


