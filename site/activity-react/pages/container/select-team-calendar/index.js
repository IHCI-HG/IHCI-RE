import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page';

export default class selectTeam extends React.Component{

    state = {
        teamInfo:[],
        teamCard:[],
    };

    skipToCalendar = this.skipToCalendar.bind(this);
    pageInit = this.pageInit.bind(this);
    componentDidMount = async() => {
        this.pageDataInit();
    };

    pageDataInit = async() => {
        const result = await api('/api/getMyInfo',{
            method: 'POST',
            body: {}
        });
        const MemberInfo = (result.state.code === 0) ? result.data.userObj.teamList:[];
        if(MemberInfo.length !== 0){
            this.setState({
                teamInfo:MemberInfo,
            },this.pageInit);
        }
    };

    pageInit(){
        const teamCard = [];
        if (this.state.teamInfo.length !== 0){
            for (let i = 0; i < this.state.teamInfo.length; i++){
                teamCard.push(
                    <div className="teamCardBoard" key={`teamCard${i}`} onClick={() => {this.skipToCalendar(this.state.teamInfo[i].teamId);}}>
                        <div className="teamCardBackground">
                            <div className="teamCardContent">
                                <div>
                                    <img src={this.state.teamInfo[i].teamImg}/>
                                </div>
                                <p>{this.state.teamInfo[i].teamName}</p>
                            </div>
                        </div>
                    </div>
                );
            }
        }
        this.setState({
            teamCard,
        });
    }

    skipToCalendar(teamId){
        location.href = '/calendar/'+ teamId;
    }

    render() {
        return (
            <Page title="日历 - IHCI" className="calendar-page">
                <div className="page-wrap">
                    <div className="main">
                        <div className="teamCardTitle">选择团队:</div>
                        <div className="teamCardShow">{this.state.teamCard}</div>
                    </div>
                </div>
            </Page>
        )
    }
}


