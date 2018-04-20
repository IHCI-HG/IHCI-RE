import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'
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
        createDiscussChosen: false,

        topicObj: {
            editStatus: false,
            topicId: 1,
            creater: {
                id: 1,
                name: '阿鲁巴大将军',
                headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                phone: '17728282828',
                mail: 'ada@qq.com',
            },
            name: '这是一条讨论的name1',
            content: '这是讨论的主体内容',
            time: 1515384000000,
        },

        topicNameInput: '这是一条讨论的name1',
        topicContentInput: '这是讨论的主体内容',



        discussList: [
            {
                editStatus: false,
                creater: {
                    id: 1,
                    name: '阿鲁巴大将军',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '17728282828',
                    mail: 'ada@qq.com',
                },
                content: '这是一条回复',
                time: 1515384000000,
            }
        ]   
    }


    topicNameInput = (e) => {
        this.setState({
            topicNameInput: e.target.value
        })
    }
    topicContentHandle = (e) => {
        this.setState({
            topicContentInput: e.target.value
        })
    }

    topicChangeSaveHandle = () => {
        this.setState({
            topicObj: {
                ...this.state.topicObj,
                name: this.state.topicNameInput,
                content: this.state.topicContentInput,
                editStatus: false,
            }
        })
    }

    render() {
        return (
            <Page className="topic-page">
                <div className="sp-nav">
                    <span className='to-team' onClick={() => { this.props.router.push('/team') }} >讨论</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"团队名字"}</span>
                    >
                    <span onClick={this.teamFilterHandle}>{"讨论主题"}</span>
                </div>

                <div className="topic-con">

                    {
                        this.state.topicObj.editStatus ? <div className="topic-subject-edit">
                                <input type="text" onChange={this.topicNameInput} value={this.state.topicNameInput} className="topic-title"/>
                                <textarea className='topic-content' onChange={this.topicContentHandle}  value={this.state.topicContentInput}></textarea>

                                <div className="button-warp">
                                    <div className="save-btn" onClick={this.topicChangeSaveHandle}>保存</div>
                                    <div className="cancel-btn" onClick={() => {this.setState({topicObj: {...this.state.topicObj, editStatus: false}})}}>取消</div>
                                </div>
                            </div> 
                        :
                            <div className="topic-subject-con">
                                <div className="topic-title">{this.state.topicObj.name}</div>
                                <div className="flex">
                                    <div className="head-img"></div>
                                    <div className="topic-main">
                                        <div className="head-wrap">
                                            <div className="left">
                                                <span className="name">阿鲁巴大将军</span>
                                                <span className="time">11月20日</span>
                                            </div>
                                            <div className="right">
                                                <span className="edit" onClick={() => {this.setState({topicObj: {...this.state.topicObj, editStatus: true}})}}>编辑</span>
                                                <span className="edit">删除</span>
                                            </div>
                                        </div>
                                        {/* <div className="content" dangerouslySetInnerHTML={{__html: this.state.topicObj.content}}><pre>{this.state.topicObj.content}</pre></div> */}
                                        <div className="content"><pre>{this.state.topicObj.content}</pre></div>
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

            </Page>
        )
    }
}


