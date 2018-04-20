import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'


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
        ],

        memberList: [
            {
                id: 1,
                name: '阿鲁巴大将军',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'creator',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 2,
                name: '阿鲁巴上校',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 3,
                name: '阿鲁巴上尉',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'admin',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
            {
                id: 4,
                name: '阿鲁巴上士',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                role: 'member',
                phone: '17728282828',
                mail: 'ada@qq.com',
                showAdmin: false,
            },
        ],

    }

    render() {
        return (
            <Page title={"成员 - IHCI"} className="member-page">
                <div className="page-wrap">
                    <div className="teamList">
                        <div className="act team-tag-item">全部</div>
                        <div className="team-tag-item">xx组1</div>
                        <div className="team-tag-item">xx组2</div>
                        <div className="team-tag-item">xx组3</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                        <div className="team-tag-item">xx组4</div>
                    </div>

                    <div className="member-list">
                    {
                        this.state.memberList.map((item) => {
                            return(
                                <div className="member-item" key={'member-item-' + item.id}>
                                    <img src={item.headImg} alt="" className="head-img"/>
                                    <span className="name">{item.name}</span>
                                    <span className="phone">{item.phone}</span>
                                    <span className="mail">{item.mail}</span>
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


