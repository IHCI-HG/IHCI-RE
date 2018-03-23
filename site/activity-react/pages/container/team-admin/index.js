import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';

class AdminTeamItem extends React.PureComponent{
    render() {
        return(
            <div className="admin-team-item">
                <div className="team-img"></div>
                <div className="team-name">{this.props.name}</div>
                {this.props.active && <span className="check">√</span>}
            </div>
        )
    }
}


export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        // this.props.params.id
        this.teamFilter()
    }

    state = {
        searchInput: '',
        showTeamFilter: false,
        teamList: [
            {
                id: 1,
                name: 'xx团队1',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: true,
                marked: true,
            },
            {
                id: 2,
                name: 'xx团队2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                teamImg: 'https://developers.google.com/machine-learning/crash-course/images/landing-icon-sliders.svg?hl=zh-cn',
                desc: '这是第一个团队',
                managed: true,
                marked: false,
            },
            {
                id: 3,
                name: 'xx团队3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: true,
                marked: false,
            },
            {
                id: 4,
                name: 'xx团队4',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: false,
                marked: false,
            },
            {
                id: 5,
                name: 'xx团队5',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                desc: '这是第一个团队',
                managed: false,
                marked: true,
            },
        ],
        shownTeam: [],
        currentTeam: {},
        memberList: [
            {
                id: 1,
                name: '阿鲁巴大将军',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'creator',
                phone: '17728282828',
                mail: 'ada@qq.com'
            },
            {
                id: 2,
                name: '阿鲁巴上校',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com'
            },
            {
                id: 3,
                name: '阿鲁巴上尉',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com'
            },
            {
                id: 4,
                name: '阿鲁巴上士',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'member',
                phone: '17728282828',
                mail: 'ada@qq.com'
            },
        ],
    }

    // 过滤掉没有管理权限的团队
    // 初始化选取状态
    teamFilter = () => {
        const teamList = []
        let currentTeam = {}
        this.state.teamList.map((item) => { 
            if(item.managed) {
                item.active = this.props.params.id == item.id
                teamList.push(item)
                if(this.props.params.id == item.id) {
                    currentTeam = item
                }
            }
        })
        this.setState({
            teamList: teamList,
            shownTeam: teamList,
            currentTeam: currentTeam
        })
    }

    searchInputHandle = (e) => {
        this.setState({
            searchInput: e.target.value
        })

        const showTeamList = []
        var partten = new RegExp(e.target.value)
        this.state.teamList.map((item) => {
            if(partten.test(item.name)) {
                showTeamList.push(item)
            }
        })
        this.setState({
            shownTeam: showTeamList
        })
    }

    teamFilterHandle = () => {
        this.setState({
            showTeamFilter: !this.state.showTeamFilter
        })
    }

    teamNameInputHandle = (e) => {
        const currentTeamItem = this.state.currentTeam
        currentTeamItem.name = e.target.value
        this.setState({
            currentTeamItem: currentTeamItem
        })
    }
    teamImgChangeHandle = (e) => {
        const currentTeamItem = this.state.currentTeam
        currentTeamItem.teamImg = e.target.value
        this.setState({
            currentTeamItem: currentTeamItem
        })
    }
    teamDescChangeHandle = (e) => {
        const currentTeamItem = this.state.currentTeam
        currentTeamItem.desc = e.target.value
        this.setState({
            currentTeamItem: currentTeamItem
        })
    }

    render() {
        return (
            <div className="team-admin-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => {this.props.router.push('/team')}} >团队</span>
                     > 
                    <span onClick={this.teamFilterHandle}>{this.state.currentTeam.name} {this.state.showTeamFilter ? '↑' : '↓'} </span> </div>
                
                {
                    this.state.showTeamFilter && <div className="team-list">
                        <input type="text" className="search" onChange={this.searchInputHandle} />
                        <div className="head">星标团队</div>
                        {
                            this.state.shownTeam.map((item) => {
                                if (item.marked) {
                                    return (
                                        <AdminTeamItem key={'mark-team-' + item.id} {...item} />
                                    )
                                }
                            })
                        }
                        <div className="head">所有团队</div>
                        {
                            this.state.shownTeam.map((item) => {
                                return (
                                    <AdminTeamItem key={'team-' + item.id} {...item} />
                                )
                            })
                        }
                    </div>
                }

                <div className="team-admin-con">
                    <div className="admin-title-bg">团队设置</div>

                    <div className="admin-title-sm">团队名称</div>
                    <input type="text" value={this.state.currentTeam.name} className="admin-input" onChange={this.teamNameInputHandle} />

                    <div className="admin-title-sm">团队图片</div>
                    <div className="input-warp">
                        <div className="input-help">请输入图片URL，建议图片比例为16：9</div>
                        <input type="text" value={this.state.currentTeam.teamImg} className="admin-input" onChange={this.teamImgChangeHandle} />
                    </div>
                    <img className="img-preview" src={this.state.currentTeam.teamImg}></img>

                    <div className="admin-title-sm">团队说明</div>
                    <textarea type="text" value={this.state.currentTeam.desc} className="admin-tra" onChange={this.teamDescChangeHandle} />

                    <div className="sava-btn">保存设置</div>

                    <div className="cut-off"></div>

                    <div className="admin-title-bg">团队成员管理</div>

                    <div className="member-list">
                        {
                            this.state.memberList.map((item) => {
                                return(
                                    <div className="member-item"></div>
                                )
                            })
                        }
                        
                    </div>

                </div>
            </div>
        )
    }
}


