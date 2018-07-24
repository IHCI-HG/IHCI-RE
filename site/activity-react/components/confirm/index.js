import * as React from 'react';
import './style.scss'
import api from '../../utils/api'
import Page from '../page'
import { locationTo } from '../../utils/util';


export default class Confirm extends React.Component {
    closeWindow = () => {
        this.props.callbackParent('')
    }
    confirmLeave = async() =>{
        const result = await api('/api/team/leaveTeam', {
            method: 'POST',
            body: { teamId: this.props.teamItem.teamId }
        })
        if(result.state.code == 0 ){
            locationTo('/team-management')
        }
    }

    render() {
        return (
            
                
                    <Page className="move-File">
                    <div className="window" >
                    <div className="outerBox">
                    
                           {this.props.teamItem.role =="creator"?
                           <div>
                           <span className="message">你是创建者,不可以退出团队!!</span>
                           <span className="iconfont icon-close btn-cancel" onClick={this.closeWindow}></span>
                           </div>:
                            <div>
                            <div>
                            <span className="confirm-message">你确定要退出 {this.props.teamItem.teamName}</span>
                            <span className="iconfont icon-close btn-cancel" onClick={this.closeWindow}></span>
                            </div>
                            <br/>
                            <ul className=' message-list'>
                                <li>你无法再查看团队的相关信息</li>
                                <li>你在团队的记录不会被删除</li>
                                <li>你可以请求创建者再把你邀请回该团队</li>
                            </ul>
                            <div className="btn-confirm" onClick={this.confirmLeave}>确定离开</div>
                            </div>
                           }
                           </div>
                        </div>
                            
                    </Page>
               
            
        )
    }
}
