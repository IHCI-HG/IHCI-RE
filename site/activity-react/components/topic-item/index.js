import * as React from 'react';
import api from '../../utils/api';
import { timeBefore, createMarkup } from '../../utils/util'
import './style.scss'
import fileUploader from '../../utils/file-uploader'

class TopicItem extends React.PureComponent {
    state={
        discussList:[],
        // creator:{
        // headerName:'' ,
        // headImg:''
        // }
    }

    componentDidMount = async() => {
        this.initPageInfo()
        // this.getCreatorName()
    }
    initPageInfo = async () => {
        const result = await api('/api/topic/get', {
            method: 'GET',
            body: {
                topicId: this.props._id
            }
        })
        const discussList = result.data.discussList
        this.setState({
            discussList:discussList
        })
    }
    // getCreatorName = async() => {
    //     const result = await api('/api/getUserInfo', {
    //         method: 'POST',
    //         body: {
    //             userId: this.props.creator._id,
    //         }
    //     })
        
    //     if(result.state.code === 0){
    //         this.setState({
    //             creator:{
    //             headerName: result.data.personInfo.name,
    //             headImg:result.data.personInfo.headImg
    //             }
    //         })
    //     }
    // }
    render() {
        return (
            <div className="topic-item" key={"topic-item-" + this.props._id} >
                <img src={this.props.creator.headImg} alt="" className="head-img" />
                <div className="name">{this.props.creator.name}</div>
                <div className="main">
                    <div className="topic-title">{this.props.title}</div>
                    <p className="text-max-line-1" dangerouslySetInnerHTML={createMarkup(this.props.content)}></p>
                </div>
                {this.props.fileList.length > 0 &&
                    <i className="icon iconfont time">&#xe6dd;</i>
                }
                <div onClick={() => { this.props.locationTo('/discuss/topic/' + this.props._id) }}>评论 {this.state.discussList
                .length}</div>
                <div className="time">{timeBefore(this.props.create_time)}</div>
            
            </div>
        )
    }
}
export default TopicItem