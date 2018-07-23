import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page';
import { locationTo } from '../../../utils/util';

class TeamItem extends React.PureComponent{
    render() {
        return <div className="team-item">

            <div className="left" onClick={() => {this.props.locationTo('/team/' + this.props._id)}}>
                <img className="bg-img" src={this.props.teamImg}></img>
                <div className="img-con"></div>
                <div className="name">{this.props.name}</div>
            </div>
            <div className="right">
                <div className={this.props.marked ? "iconfont icon-collection_fill act" : "iconfont icon-collection"} onClick={() => {this.props.starHandle(this.props._id)}}></div>
                {this.props.managed && <div className="iconfont icon-setup" onClick={() => {this.props.locationTo('/team-admin/' + this.props._id)}}></div>}
                <div className="iconfont icon-empty" onClick={() => {this.props.deleteHandle(this.props._id)}}></div>
            </div>
        </div>
    }
}

export default class Team extends React.Component{
    componentDidMount = async() => {
        this.initTeamList()
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

    starHandle = async (_id) => {

        const teamList = this.state.teamList
        let curMarkState = false
        teamList.map((item) => {
            if(item._id == _id) {
                curMarkState = item.marked
            }
        })

        const result = await api('/api/team/markTeam', {
            method: 'POST',
            body: {
                teamId: _id,
                markState: !curMarkState
            }
        })

        if(result.state.code != 0) {
            window.toast(result.state.msg)
        } else {
            teamList.map((item) => {
                if(item._id == _id) {
                    item.marked = !item.marked
                }
            })
            this.setState({
                teamList: teamList
            })
        }
    }
    deleteHandle = async (_id) =>{
        console.log(_id)
        const result = await api('/api/team/leaveTeam', {
            method: 'POST',
            body: { teamId: _id }
        })
        console.log(result.state.code)
        if(result.state.code == 0 ){
            locationTo('/team')
        }
    }

    locationTo = (url) => {
        location.href = url
    }


    state = {
        teamList: [],
    }
    render() {
        return (
            <Page title="团队 - IHCI" className="team-page">
                <div className="carete" onClick={() => {this.locationTo('/team-create')}}> 创建团队 </div>

                <div className="head" onClick={this.starHandle}>星标团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.marked == true) {
                                return <TeamItem key={'mark-team' + item._id} {...item} locationTo={this.locationTo} starHandle={this.starHandle} deleteHandle={this.deleteHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我管理的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.managed == true) {
                                return <TeamItem key={'manage-team' + item._id} {...item} locationTo={this.locationTo} starHandle={this.starHandle} deleteHandle={this.deleteHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我参与的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            return <TeamItem key={'join-team' + item._id} {...item} locationTo={this.locationTo} starHandle={this.starHandle} deleteHandle={this.deleteHandle} />
                        })
                    }
                </div>
            </Page>
        )
    }
}


