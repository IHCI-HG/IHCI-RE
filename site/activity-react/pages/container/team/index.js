import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'

class TeamItem extends React.PureComponent{
    render() {
        return <div className="team-item">
            <div className="left" onClick={() => {this.props.locationTo('/discuss/' + this.props.id)}}>
                <img className="bg-img" src={this.props.teamImg}></img>
                <div className="img-con"></div>
                <div className="name">{this.props.name}</div>
            </div>
            <div className="right">
                <div className={this.props.marked ? "iconfont icon-collection_fill act" : "iconfont icon-collection"} onClick={() => {this.props.starHandle(this.props.id)}}></div>
                {this.props.managed && <div className="iconfont icon-setup" onClick={() => {this.props.locationTo('/team-admin/' + this.props.id)}}></div>}
            </div>
        </div>
    }
}

export default class Team extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA);
    }

    starHandle = async (id) => {
        const result = await api('/api/base/sys-time', {
            method: 'GET',
            body: {}
        })
        if(result) {
            const teamList = this.state.teamList
            teamList.map((item) => {
                if(item.id == id) {
                    item.marked = !item.marked
                }
            })
            this.setState({
                teamList: teamList
            })
        }
    }

    locationTo = (url) => {
        this.props.router.push(url)
    }


    state = {
        teamList: [
            {
                id: 1,
                name: '青少年编程项目组',
                teamImg: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=471192784,4234473862&fm=27&gp=0.jpg',
                managed: true,
                marked: true,
            },
            {
                id: 2,
                name: 'IHCI平台搭建项目组',
                teamImg: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1938658724,934922317&fm=27&gp=0.jpg',
                managed: true,
                marked: false,
            },
            {
                id: 3,
                name: '智能儿童床项目组',
                teamImg: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1782589578,2528203182&fm=27&gp=0.jpg',
                managed: true,
                marked: false,
            },
            {
                id: 4,
                name: '2018毕业设计项目组',
                teamImg: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3820981196,3985389795&fm=27&gp=0.jpg',
                managed: false,
                marked: false,
            },
            {
                id: 5,
                name: '人工智能&深度学习学习项目组',
                teamImg: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1764029602,681735033&fm=27&gp=0.jpg',
                managed: false,
                marked: true,
            },
        ],

        
    }
    render() {
        return (
            <Page title="团队 - IHCI" className="team-page">
                <div className="carete" onClick={() => {this.locationTo('/team-admin/111')}}> 创建团队 </div>

                <div className="head" onClick={this.starHandle}>星标团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.marked == true) {
                                return <TeamItem {...item} locationTo={this.locationTo} starHandle={this.starHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我管理的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.managed == true) {
                                return <TeamItem {...item} locationTo={this.locationTo} starHandle={this.starHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我参与的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            return <TeamItem {...item} locationTo={this.locationTo} starHandle={this.starHandle}/>
                        })
                    }
                </div>
            </Page>
        )
    }
}


