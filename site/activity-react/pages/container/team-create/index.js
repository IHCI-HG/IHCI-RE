import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'

export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        
    }

    state = {
        name: '',
        teamImg: 'https://developers.google.com/machine-learning/crash-course/images/landing-icon-sliders.svg',
        desc: '',
       
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

    createBtnHandle = async () => {
        const result = await api('/api/team/create', {
            method: 'POST',
            body: {
                teamInfo: {
                    name: this.state.name,
                    teamImg: this.state.teamImg,
                    teamDes: this.state.desc
                }
            }
        })

        if(result.state.code === 0) {
            console.log(result);
            window.toast("创建成功")
            location.href = '/team-admin/' + result.data.teamObj._id
        }
    } 


    render() {
        return (
            <Page title={"创建团队"} className="team-admin-page">

                <div className="team-admin-con page-wrap">
                    <div className="admin-title-bg">创建团队</div>

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

                    <div className="sava-btn" onClick={this.createBtnHandle}>创建</div>

                </div>

            </Page>
        )
    }
}


