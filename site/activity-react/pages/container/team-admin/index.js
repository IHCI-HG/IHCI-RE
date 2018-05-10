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
        this.setState({
            name: teamObj.name,
            teamImg: teamObj.teamImg,
            desc: teamObj.teamDes,
        })
    }

    state = {
        name: '',
        teamImg: '',
        desc: '',

        memberList: [
            {
                id: 1,
                name: '阿鲁巴大将军',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'creator',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 2,
                name: '阿鲁巴上校',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 3,
                name: '阿鲁巴上尉',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 4,
                name: '阿鲁巴上士',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'member',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
        ],
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
            if(item.id == id) {
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
            if(item.id == id) {
                item.role = role
            }
        })
        this.setState({
            memberList: memberList
        })
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
                            <input type="text" value={`${location.host}/join-team/${this.teamId}`} className="invite-input" />
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

                    <div className="sava-btn">保存设置</div>

                    <div className="admin-title-bg flex"> <span>团队成员管理</span> <span className='add' onClick={this.showAddMemberDialogHandle}>添加成员</span> </div>

                    <div className="member-list">
                        {
                            this.state.memberList.map((item) => {
                                return(
                                    <div className="member-item" key={'member-item-' + item.id}>
                                        <img src={item.headImg} alt="" className="head-img"/>
                                        <span className="name">{item.name}</span>
                                        <span className="phone">{item.phone}</span>
                                        <span className="mail">{item.mail}</span>
                                        <span className="role" onClick={this.showAdminHandle.bind(this, item.id)}>{item.role} {item.showAdmin ? '↑' : '↓'} </span>
                                        {
                                            item.showAdmin && <div className="admin">
                                                <div className="admin-item" onClick={this.setUserRoleHandle.bind(this, item.id, 'admin')}>管理员</div>
                                                <div className="admin-item" onClick={this.setUserRoleHandle.bind(this, item.id, 'member')}>成员</div>
                                                <div className="admin-item" onClick={this.setUserRoleHandle.bind(this, item.id, 'member')}>踢出队伍</div>
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


