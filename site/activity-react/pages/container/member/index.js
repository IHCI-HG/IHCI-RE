import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'



export default class News extends React.Component{
    componentDidMount = async() => {
        console.log(INIT_DATA);

    }
    starHandle = async (id) => {
        const result = await api('/api/base/sys-time', {
            method: 'GET',
            body: {}
        })
    }

    state = {
        teamList: [
            {
                teamName: 'xx团队1',
                memberList: [],
            }
        ]
    }

    


    render() {
        return (
            <div className="member-page">
                <div className="teamList">
                    <div className="act team-tag-item">全部</div>
                    <div className="act team-tag-item">全部</div>
                </div>

                <div className="member-list">
                1
                </div>
            </div>
        )
    }
}


