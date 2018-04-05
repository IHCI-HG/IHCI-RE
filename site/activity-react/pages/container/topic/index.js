import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';

export default class Topic extends React.Component{
    componentDidMount = async() => {
        // console.log(INIT_DATA);
        // this.teamListInit()
    }

    // starHandle = async (id) => {
    //     const result = await api('/api/base/sys-time', {
    //         method: 'GET',
    //         body: {}
    //     })
    // }

    state = {
      
    }

    // teamListInit = () => {
    //     const teamList = []
    //     this.state.teamList.map((item) => { 
    //         item.active = this.props.params.id == item.id
    //         teamList.push(item)
    //     })
    //     this.setState({
    //         teamList: teamList,
    //         shownTeam: teamList,
    //     })
    // }

    // teamFilterHandle = () => {
    //     this.setState({
    //         showTeamFilter: !this.state.showTeamFilter
    //     })
    // }

    // searchInputHandle = (e) => {
    //     this.setState({
    //         searchInput: e.target.value
    //     })

    //     const showTeamList = []
    //     var partten = new RegExp(e.target.value)
    //     this.state.teamList.map((item) => {
    //         if(partten.test(item.name)) {
    //             showTeamList.push(item)
    //         }
    //     })
    //     this.setState({
    //         shownTeam: showTeamList
    //     })
    // }

    render() {
        return (
            <div className="discuss-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >讨论</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"团队名字"}</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"讨论主题"}</span>
                </div>

                <div className="topic-con">
                    <div className="topic-subject-con">
                        <div className="head-img"></div>
                        div
                    </div>

                </div>

            </div>
        )
    }
}


