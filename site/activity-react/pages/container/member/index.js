import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

// class TeamItem extends React.PureComponent{
//     render(){
       
//     }
// }
export default class News extends React.Component{
    componentDidMount = async() => {
        await this.initTeamList()
        await this.initMemberData()          //cccccccccccccccccgit

    }
    initTeamList = async () => {
        const result = await api('/api/getMyInfo', {
            method: 'GET',
            body: {}
        })
        const teamList = result.data.teamList
        const teamIdList = []
        teamList.map((item) => {
            teamIdList.push(item.teamId)
        })

        const listResult = await api('/api/team/infoList', {
            method: 'POST',
            body: {
                teamIdList: teamIdList
            }
        })
        const teamInfoList = listResult.data

        teamList.map((item, idx) => {
            teamList[idx] = {
                ...item,
                ...teamInfoList[idx],
                managed: (item.role == 'creator' || item.role == 'admin')
            }
        })

        this.setState({
            teamList: teamList
        })
    }
    initMemberData = async()=>{
        const queryTeamId = this.props.location.query.teamId
        const result = await api('/api/member',{
            method: 'POST',
            body: queryTeamId ? {
                 teamId: queryTeamId
            } : {}
        })
        this.setState({
            memberList: result.data
        })
        console.log("我是:",this.state.memberList)
    }
    
    locationTo = (url) => {
        location.href = url
    }
    state = {
        // teamList: [
        //     {
        //         teamName: 'xx团队1',
        //         memberList: [],
        //     }
        // ],
        
        teamList: [],
        memberList: []
        //     {
        //         id: 1,
        //         name: '阿鲁巴大将军',
        //         headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
        //         role: 'creator',
        //         phone: '17728282828',
        //         mail: 'ada@qq.com',
        //         showAdmin: false,
        //     },


    }

    render() {
        return (
            <Page title={"成员 - IHCI"} className="member-page">
                <div className="page-wrap">
                    <div className="teamList">
                        <div className="act team-tag-item" onClick={()=>{this.locationTo('/member')}}>全部</div>
                        {
                            this.state.teamList.map((item)=> {
                                return(
                                    <div className="act team-tag-item" onClick={()=>{this.locationTo('/member?teamId='+ item._id)}}> 
                                    <div className="name">{item.name}</div>
                                    </div>       
                                )
                            })
                        }
                    </div>

                    <div className="member-list">
                    {
                        this.state.memberList.map((item) => {
                            return(
                                <div className="member-item" key={"member-list-" + item._id} onClick={()=>this.locationTo('/timeline?userId='+ item._id)} >
                                    <img src={item.personInfo.headImg} alt="" className="head-img"/>
                                    <span className="name">{item.personInfo.name}</span>
                                    <span className="phone">{item.personInfo.phone}</span>
                                    <span className="mail">{item.personInfo.mail}</span>
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


