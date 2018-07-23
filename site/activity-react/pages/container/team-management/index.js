import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
import api from '../../../utils/api';

export default class TeanManagement extends React.Component{
    state = {
        teamList:[],
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
 
    
    render() {
        return (
            <Page title="我的团队管理" className="management-page">
                <div className="page-wrap">  
                <h1>所有团队</h1>              
                    <div className="teamList">
                    {
                        this.state.teamList.map((item)=>{
                           return(
                               <div className="team-item" key={'team-item-'+item.teamId}>
                               <img src= {item.teamImg}/>
                               <span className="teamName">{item.teamName}</span>
                               <button className="delete"onClick={()=>{}}>退出团队</button>
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


