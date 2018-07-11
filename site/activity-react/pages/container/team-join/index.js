import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'

export default class TeamJoin extends React.Component{
    componentDidMount = async() => {
        if(INIT_DATA.login) {
            this.setState({
                login: true
            })
        }
        if(INIT_DATA.teamObj) {
            this.setState({
                teamObj: INIT_DATA.teamObj
            })
        }

    }

    state = {
        login: false,
        teamObj: {},
    }

    joinBtnHandle = async () => {
        const result = await api('/api/team/join', {
            method: 'POST',
            body: {
                teamId: this.state.teamObj._id
            }
        })
        window.toast(result.state.msg)
        
        setTimeout(() => {
            if(result.state.code == 0) {
                location.href = "/team/" + this.state.teamObj._id
            }
        }, 400);

    }

    render() {
        return (
            <Page title={"加入团队"} className="join-team">
                {
                    this.state.login ? 
                        <div className='btn' onClick={this.joinBtnHandle}> 点击加入团队{this.state.teamObj.name} </div> 
                    : 
                        <div> 请先注册或登录 </div>
                }

            </Page>
        )
    }
}


