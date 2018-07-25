import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';
import Confirm from '../../../components/confirm'
var ReactDOM = require('react-dom')

export default class TeanManagement extends React.Component{
    state = {
        teamList:[],
        confirm: document.createElement('div'),
    }
    componentDidMount = async() => {
        this.getTeamList()
    }
    getTeamList  = async() => {
        
        const result = await api('/api/getMyInfo', {
            method: 'GET',
            body: {}
        })
        const teamList = result.data.teamList
        this.setState({
            teamList: teamList
        })
    }
    leaveTeamHandle = (teamItem) =>{
        ReactDOM.render(<Confirm teamItem={teamItem} callbackParent={this.onChildChanged}/>, this.state.confirm)
        document.getElementById('app').appendChild(this.state.confirm)
    }
    onChildChanged = () => {
        document.getElementById('app').removeChild(this.state.confirm)
    }
 
    
    render() {
        return (
            <Page title="我的团队管理" className="management-page">
                <div className="page-wrap">  
                <h2>所有团队</h2>      
                <br/>        
                    <div className="teamList">
                    {
                        this.state.teamList.map((item)=>{
                           return(
                               <div className="team-item" key={'team-item-'+item.teamId}>
                               <img className="team-img"src= {item.teamImg}/>
                               <div className="teamName">{item.teamName}</div>
                               <button className="leaveTeam"onClick={()=>{this.leaveTeamHandle(item)}}>退出团队</button>
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

