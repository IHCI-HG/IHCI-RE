import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';

class TeamItem extends React.PureComponent{
    render() {
        return <div className="team-item">
            <div className="left">
                <img className="bg-img" src={this.props.teamImg}></img>
                <div className="name">{this.props.name}</div>
            </div>
            <div className="right">
                <div className={this.props.marked ? "star act" : "star"} onClick={() => {this.props.starHandle(this.props.id)}}>星</div>
                {this.props.managed && <div className="admin">管</div>}
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

    state = {
        teamList: [
            {
                id: 1,
                name: 'xx团队1',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522401625&di=bcc173556f4ce40a5b92ff96402a053b&imgtype=jpg&er=1&src=http%3A%2F%2Fwx3.sinaimg.cn%2Forj360%2F7fa53ff0gy1fc1phl41r6j20hs0hsmxn.jpg',
                managed: true,
                marked: true,
            },
            {
                id: 2,
                name: 'xx团队2',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1521806667274&di=83a0c0298250d65456e31d0eb86415eb&imgtype=0&src=http%3A%2F%2Fuploads.oh100.com%2Fallimg%2F1707%2F125-1FG4150320.jpg',
                managed: true,
                marked: false,
            },
            {
                id: 3,
                name: 'xx团队3',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1521806667274&di=83a0c0298250d65456e31d0eb86415eb&imgtype=0&src=http%3A%2F%2Fuploads.oh100.com%2Fallimg%2F1707%2F125-1FG4150320.jpg',
                managed: true,
                marked: false,
            },
            {
                id: 4,
                name: 'xx团队4',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1521806667274&di=83a0c0298250d65456e31d0eb86415eb&imgtype=0&src=http%3A%2F%2Fuploads.oh100.com%2Fallimg%2F1707%2F125-1FG4150320.jpg',
                managed: false,
                marked: false,
            },
            {
                id: 5,
                name: 'xx团队5',
                teamImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1521806667274&di=83a0c0298250d65456e31d0eb86415eb&imgtype=0&src=http%3A%2F%2Fuploads.oh100.com%2Fallimg%2F1707%2F125-1FG4150320.jpg',
                managed: false,
                marked: true,
            },
        ]
    }
    render() {
        return (
            <div className="team-con">
                <div className="head" onClick={this.starHandle}>星标团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.marked == true) {
                                return <TeamItem {...item} starHandle={this.starHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我管理的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            if(item.managed == true) {
                                return <TeamItem {...item} starHandle={this.starHandle}/>
                            }
                        })
                    }
                </div>

                <div className="head">我参与的团队</div>
                <div className="team-list">
                    {   
                        this.state.teamList.map((item) => {
                            return <TeamItem {...item} starHandle={this.starHandle}/>
                        })
                    }
                </div>
            </div>
        )
    }
}


