import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'

export default class Team extends React.Component{
    componentDidMount = async() => {

    }

    // starHandle = async (id) => {
    //     const result = await api('/api/base/sys-time', {
    //         method: 'GET',
    //         body: {}
    //     })
    //     if(result) {
    //         const teamList = this.state.teamList
    //         teamList.map((item) => {
    //             if(item.id == id) {
    //                 item.marked = !item.marked
    //             }
    //         })
    //         this.setState({
    //             teamList: teamList
    //         })
    //     }
    // }

    state = {
        isLogin: true
    }
    
    render() {
        return (
            <Page title={"接受邀请"} className="person-edit-page page-wrap">

            </Page>
        )
    }
}


