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
        editTopic: false,
        createDiscussChosen: false,

        
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
            <div className="topic-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >讨论</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"团队名字"}</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"讨论主题"}</span>
                </div>

                <div className="topic-con">

                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <input type="text" className="topic-title"/>
                                <textarea className='topic-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con">
                                <div className="topic-title">这是讨论的主题名字</div>
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }

                    <div className="div-line"></div>


                    <div className="topic-list">
                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <textarea className='discuss-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con discuss-con">
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }
                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <textarea className='discuss-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con discuss-con">
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }
                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <textarea className='discuss-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con discuss-con">
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }
                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <textarea className='discuss-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con discuss-con">
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }
                    {
                        this.state.editTopic ? <div className="topic-subject-edit">
                                <textarea className='discuss-content'></textarea>

                                <div className="button-warp" onClick={() => {this.setState({editTopic: false})}}>
                                    <div className="save-btn">保存</div>
                                    <div className="cancel-btn">取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con discuss-con">
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={()=>{this.setState({editTopic: true})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        <div className="content">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</div>
                                    </div>
                                </div>
                            </div>
                    }

                    <div className="topic-subject-con discuss-con">
                        <div className="flex">
                            <div className="head-img"></div>
                            <div className="topic-main">
                                {
                                    this.state.createDiscussChosen ?
                                        <div className='topic-subject-edit no-pading'>
                                            <textarea className='discuss-content'></textarea>
                                            <div className="button-warp" onClick={() => { this.setState({ createDiscussChosen: false }) }}>
                                                <div className="save-btn">发表</div>
                                                <div className="cancel-btn">取消</div>
                                            </div>
                                        </div>
                                        : 
                                        <div className='topic-subject-edit no-pading'>
                                            <input placeholder={"点击发表评论"} type="text" onClick={() => {this.setState({createDiscussChosen: true})}} className="topic-title"/>
                                        </div>
                                }   
                            </div>
                        </div>
                    </div>

                    </div>


                </div>

            </div>
        )
    }
}


