import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'
import ReadBox from '../../container/readBox'

const newInformItemNum = 5
const moreInformItemNum = 3

class InformItem extends React.PureComponent{

    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
        'CREATE_TASK': '创建任务：',
        'EDIT_TOPIC': '修改了讨论: ',
        'EDIT_REPLY': '编辑了回复: ',
    }
    changeReadState = async () => {
        const queryNoticeId = this.props.noticeId
        let rState = true
        //this.state.queryUserId = userId?userId:'i dont get'
            const result = await api('/api/user/readNotice', {
                method: 'POST',
                body:{
                  noticeId: queryNoticeId? queryNoticeId: '',
                  readState: rState
                  //userId: queryUserId? queryUserId: ''
                }
            })
            // console.log(result)

            this.setState( () => {
              if (this.props.type == 'CREATE_TOPIC')
                this.props.locationTo('/discuss/topic/' + this.props.topicId)
              if (this.props.type == 'REPLY_TOPIC')
                this.props.locationTo('/discuss/topic/' + this.props.topicId)            
              if (this.props.type == 'CREATE_TASK')
                this.props.locationTo('/todo/' + this.props.noticeId)
              if(this.props.type == 'EDIT_TOPIC')
              this.props.locationTo('/discuss/topic/' + this.props.topicId)
              if(this.props.type == 'EDIT_REPLY')
              this.props.locationTo('/discuss/topic/' + this.props.topicId)
            })

    }
    render(){

            return (
                <div className='infs-item-wrap' key={"infs-item-wrap-" + this.props._id} onClick={() => {this.changeReadState()}}>
                <div className="date">{formatDate(this.props.create_time, 'MM月dd日')}</div>
                  <img src={this.props.creator.headImg} alt="" className="head-img" />

                  <div className='news-con'>
                      <div className="des-line">
                          <span className="name">{this.props.creator.name}</span>
                          <span className="type">{this.typeMap[this.props.type]}</span>
                          <span className="topic">{this.props.noticeTitle}</span>
                      </div>
                      <div className="BraftEditor-container">
                        <div className="content public-DraftEditor-content BraftEditor-content"  dangerouslySetInnerHTML={{__html: this.props.noticeContent}}>{}</div>
                      </div>                   
                  </div>
                </div>
          )
        
        }
}
export default class Infs extends React.Component{

    state = {
        unreadList: [],
        isreadList: [],

        activeTag: 'unread',
        readState:'',
        lastStamp:'',
        //下拉更多
        noResult: false,
        noMoreResult: false,
    }
   
      componentDidMount = async() => {

        await this.initUnreadList()
      }

      locationTo = (url) => {
          this.props.router.push(url)
      }

      
      getMoreUnreadData = async () => {
        const lastStamp = this.state.lastStamp
        const result = await api('/api/user/showUnreadList', {
            method: 'POST',
            body:{
                timeStamp: lastStamp? lastStamp: '',
            }
      })
      console.log(lastStamp)
      console.log(result)
      const unreadlist = result.data
      this.appendUnreadList(unreadlist)
      }

      appendUnreadList = (list) =>{
        if(!list||list.length === 0){
          this.setState({
            noMoreResult:true
          })
          return 
        }
        const unreadList = this.state.unreadList
        console.log(unreadList)
        var flag = false
        for(let i=0;i<list.length;i++){
            flag = false
            for(let j=0;j<unreadList.length;j++){
                if(list[i].teamId === unreadList[j].teamId){
                    unreadList[j].unreadArray.push(list[i])
                    flag = true
                    break
                }
            }
            if(flag === false){
                unreadList.push({
                    teamId:list[i].teamId,
                    unreadArray:[list[i]]
                })
            }
        }
        this.setState({
            unreadList:unreadList,
            lastStamp: list[list.length - 1].create_time
        })

        
    }

      appendIsReadList = (list) =>{
        if(!list||list.length === 0){
            noMoreResult = true
            return 
          }
          const isreadList  = this.state.isreadList
          var flag = false
          for(let i=0;i<list.length;i++){
              flag = false
              for(let j=0;j<isreadList.length;j++){
                  if(list[i].teamId === isreadList[j].teamId){
                      isreadList[j].isreadArray.push(list[i])
                      flag = true
                      break
                  }
              }
              if(flag === false){
                isreadList.push({
                      teamId:list[i].teamId,
                      isreadArray:[list[i]]
                  })
              }
          }
      }

      getMoreIsreadData = async () => {
        const result = await api('/api/user/showReadList', {
            method: 'POST',
            body:{
              timeStamp: '',
            }
        })
        const isreadList = result.data
        this.setState({
            isreadList: this.state.isreadList.concat(isreadList)
        })
        if(result.data.length<moreInformItemNum){
          this.setState({
            noMoreResult: true
          })
        }
      }

      typeMap = {
          'CREATE_TOPIC': '创建了讨论：',
          'REPLY_TOPIC': '回复了讨论：',
          'CREATE_TASK': '创建任务',
          'EDIT_TOPIC': '修改了讨论：',
          'EDIT_REPLY': '编辑了回复: ',
      }
     
      initIsreadList = async () => {

              const result = await api('/api/user/showReadList', {
                  method: 'POST',
                  body:{}
              })
              console.log(result.data)
              this.setState({
                  isreadList: result.data
              })
          }



      initUnreadList = async () => {
            const result = await api('/api/user/showUnreadList', {
                method: 'POST',
                body:{}
            })
            const unreadList = result.data
            const teamList = []
            var flag
            for(let i=0;i<unreadList.length;i++){
                flag = false
                if(teamList.length==0){
                teamList.push(unreadList[i].teamId)
                }else{
                    for(let j=0;j<teamList.length;j++){
                        if(teamList[j]===unreadList[i].teamId){
                            flag = true
                            break
                        }
                    }
                    if(flag === false){
                        teamList.push(unreadList[i].teamId)
                    }
                }
            }
            console.log(teamList)
            const teamUnreadObj = []
            for(let i=0;i<teamList.length;i++){
                var unreadArray = unreadList.filter(function(item){
                    if(item.teamId === teamList[i]){
                        return true
                    }
                })

                teamUnreadObj.push({
                    teamId : teamList[i],
                    unreadArray
                })
                
            }
            console.log(teamUnreadObj)

            this.setState({
                unreadList: teamUnreadObj,
                lastStamp:unreadList[unreadList.length-1].create_time
            })
            
        }

    getMoreHandle = (actTag) => {
        console.log(actTag)
          if (actTag == "unread")
              this.getMoreUnreadData()
          else this.getMoreIsreadData()
    }

    toReadHandle = (readState) => {
          if (readState=="unread")
              this.initUnreadList()
          else this.initIsreadList()
          this.setState({
              activeTag: readState,

          })

      }
 
changeReadState = async (item) => {
    const queryNoticeId = item.noticeId
    let rState = true
    //this.state.queryUserId = userId?userId:'i dont get'
        const result = await api('/api/user/readNotice', {
            method: 'POST',
            body:{
              noticeId: queryNoticeId? queryNoticeId: '',
              readState: rState
              //userId: queryUserId? queryUserId: ''
            }
        })

}
groupInfoRead = (id) =>{
    console.log(id)
}
      render() {
        const unreadList = this.state.unreadList
        const isreadList = this.state.isreadList
        const userId = this.props.personInfo._id
        console.log('unreadList',unreadList)
        console.log('isreadList',isreadList)

          return (
            <Page className="infs-page">
            <div className='page-wrap'>
                <div className="readStateChosen">
                    <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"unread")}>未读</div>
                    <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"isread")}>已读</div>
                    <div className='read-tag-item'>标记为已读</div>
                </div>
                    {this.state.activeTag == 'unread'?
                    unreadList.map((team) => {
                                return (
                                    <div className="infs-day" key={'time-group-' + team.teamId}>  
                                                    
                                        <div className="group-box"><ReadBox choseHandle={this.groupInfoRead} item={team.id}/></div>
                                        <div className="group-line">{team.unreadArray[0].teamName}</div>
                                        {
                                        team.unreadArray.map((item)=>{
                                            return(
                                            <div className="item-div" key={item.noticeId}>
                                            <div className="item-box"><ReadBox choseHandle={this.changeReadState} item={item}/></div>
                                            <InformItem locationTo={this.locationTo} key={'inform-' + item.noticeId} {...item} onClick={() => {}}/>
                                            </div>
                                            )
                                        })
                                        
                                        }                    
                                </div>)                       
                    }):<div>bye</div>}

                        {this.state.noResult && <div className='null-info'>无通知</div>}
                        <div className='load-more-bar'>
                            {!this.state.noResult && !this.state.noMoreResult && <div className="load-more" onClick={this.getMoreHandle.bind(this,this.state.activeTag)}>
                                点击加载更多
                            </div>}
                            {this.state.noMoreResult && <div className="no-more-result-alert">没有更多通知！</div>}
                        </div>
                      </div>
              </Page>
          )
      }
  }
