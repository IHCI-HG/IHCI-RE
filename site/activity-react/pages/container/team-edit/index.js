import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';

class TeamItem extends React.PureComponent{
    render() {
        return <div className="team-item">
            <div className="left">
                <div className="bg-img"></div>
                <div className="name">{this.props.name}</div>
            </div>
            <div className="right">
                <div className={this.props.marked ? "star act" : "star"} onClick={() => {this.props.starHandle(this.props.id)}}>星</div>
                {this.props.managed && <div className="admin">编</div>}
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
                managed: true,
                marked: true,
            },
            {
                id: 2,
                name: 'xx团队2',
                managed: true,
                marked: false,
            },
            {
                id: 3,
                name: 'xx团队3',
                managed: true,
                marked: false,
            },
            {
                id: 4,
                name: 'xx团队4',
                managed: false,
                marked: false,
            },
            {
                id: 5,
                name: 'xx团队5',
                managed: false,
                marked: true,
            },
        ]
    }
    render() {
        return (
            <div className="team-con">
            team-edit
            {this.props.params.id}
            </div>
        )
    }
}


