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

        unreadLastStamp:'',
        isreadLastStamp:'',

        unreadNoMoreResult: false,
        isreadNoMoreResult: false,
        

        activeTag: 'unread',
        readState:'',
        
        
        unreadNoResult: false,
        isreadNoResult: false
    }
   
      componentDidMount = async() => {

        await this.initUnreadList()
      }

      locationTo = (url) => {
          this.props.router.push(url)
      }

      
      getMoreUnreadData = async () => {
        const unreadLastStamp = this.state.unreadLastStamp
        const result = await api('/api/user/showUnreadList', {
            method: 'POST',
            body:{
                timeStamp: unreadLastStamp? unreadLastStamp: '',
            }
      })
      const unreadlist = result.data
      this.appendUnreadList(unreadlist)
      }
      appendIsreadList = (list) =>{
        if(!list||list.length === 0){
            this.setState({
              isreadNoMoreResult:true
            })
            return 
          }
          const isreadList = this.state.isreadList
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
          this.setState({
              isreadList:isreadList,
              isreadLastStamp: list[list.length - 1].create_time
          })
  
      }
      appendUnreadList = (list) =>{
        if(!list||list.length === 0){
          this.setState({
            unreadNoMoreResult:true
          })
          return 
        }
        const unreadList = this.state.unreadList
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
            unreadLastStamp: list[list.length - 1].create_time
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
        const isreadLastStamp = this.state.isreadLastStamp
        
        const result = await api('/api/user/showReadList', {
            method: 'POST',
            body:{
                timeStamp: isreadLastStamp? isreadLastStamp: '',
            }
        })
        const isreadlist = result.data
        this.appendIsreadList(isreadlist)
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
              
              const isreadList = result.data
              console.log(isreadList)
              if(!isreadList||isreadList.length === 0){
                this.setState({
                    isreadNoResult:true
                })                
                return
            }
              const teamList = []
              var flag
              for(let i=0;i<isreadList.length;i++){
                  flag = false
                  if(teamList.length==0){
                  teamList.push(isreadList[i].teamId)
                  }else{
                      for(let j=0;j<teamList.length;j++){
                          if(teamList[j]===isreadList[i].teamId){
                              flag = true
                              break
                          }
                      }
                      if(flag === false){
                          teamList.push(isreadList[i].teamId)
                      }
                  }
              }
  
              const teamUnreadObj = []
              for(let i=0;i<teamList.length;i++){
                  var isreadArray = isreadList.filter(function(item){
                      if(item.teamId === teamList[i]){
                          return true
                      }
                  })
  
                  teamUnreadObj.push({
                      teamId : teamList[i],
                      isreadArray,
                      readState:true
                  })
                  
              }
  
  
              this.setState({
                  isreadList: teamUnreadObj,
                  isreadLastStamp:isreadList[isreadList.length-1].create_time
              })
          }



      initUnreadList = async () => {
            const result = await api('/api/user/showUnreadList', {
                method: 'POST',
                body:{}
            })
            const unreadList = result.data
            if(!unreadList||unreadList.length === 0){
                this.setState({
                    unreadNoResult:true
                })
                return
            }
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

            const teamUnreadObj = []
            for(let i=0;i<teamList.length;i++){
                var unreadArray = unreadList.filter(function(item){
                    if(item.teamId === teamList[i]){
                        return true
                    }
                })

                teamUnreadObj.push({
                    teamId : teamList[i],
                    unreadArray,
                    readState:false
                })
                
            }


            this.setState({
                unreadList: teamUnreadObj,
                unreadLastStamp : unreadList[unreadList.length-1].create_time
            })
            
        }

    getMoreHandle = (actTag) => {

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

groupInfoRead = (item) =>{
    const unreadList = this.state.unreadList
    for(let i=0;i<unreadList.length;i++){
        if(unreadList[i].teamId === item.teamId){
            unreadList[i].readState = !unreadList[i].readState 
            for(let j=0;j<unreadList[i].unreadArray.length;j++){
                unreadList[i].unreadArray[j].readState = unreadList[i].readState
            }
            break
        }
    }
    this.setState({
        unreadList:unreadList
    })
}
itemInfoRead = (item) =>{

    const unreadList = this.state.unreadList

    

    for(let i=0;i<unreadList.length;i++){
        if(unreadList[i].teamId === item.teamId){
            
            for(let j=0;j<unreadList[i].unreadArray.length;j++){
                if(unreadList[i].unreadArray[j].noticeId === item.noticeId){
                    unreadList[i].unreadArray[j].readState = !unreadList[i].unreadArray[j].readState
                    break
                }
            }
            break
        }
    }

    for(let i=0;i<unreadList.length;i++){  
        var flag = true        
            for(let j=0;j<unreadList[i].unreadArray.length;j++){

                if(unreadList[i].unreadArray[j].readState === false){
                    flag = false
                    break
                }
            }
            unreadList[i].readState = flag  
           
        }
    

    this.setState({
        unreadList:unreadList
    })
}
markToRead = async() =>{
    var unreadList = this.state.unreadList
    const isReadNoticeArray = []
 
    for(let i=0;i<unreadList.length;i++){
        for(let j=unreadList[i].unreadArray.length-1;j>=0;j--){
            if(unreadList[i].unreadArray[j].readState === true){
                isReadNoticeArray.push(unreadList[i].unreadArray[j].noticeId)
                unreadList[i].unreadArray.splice(j,1)
            }
        }
        
    }
    this.setState({
        unreadList:unreadList
    })

    const result = await api('/api/user/readNoticeArray', {
        method: 'POST',
        body:{
          isReadNoticeArray: isReadNoticeArray,
        }
    })
    
    
}

      render() {
        const unreadList = this.state.unreadList
        const isreadList = this.state.isreadList
        console.log(isreadList)
        const userId = this.props.personInfo._id

          return (
            <Page className="infs-page">
            <div className='page-wrap'>
                <div className="readStateChosen">
                    <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"unread")}>未读</div>
                    <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"isread")}>已读</div>
                    <div className='read-tag-item' onClick={this.markToRead}>标记为已读</div>
                </div>
                    {this.state.activeTag == 'unread'?
                    unreadList.map((team) => {
                                if(team.unreadArray[0]){

                                return (
                                    
                                    <div className="infs-day" key={'time-group-' + team.teamId}>  
                                                    
                                        <div className="group-box"><ReadBox type='group' choseHandle={this.groupInfoRead} item={team}/></div>
                                        <div className="group-line">{team.unreadArray[0].teamName}</div>
                                        {
                                        team.unreadArray.map((item)=>{
                                            return(
                                            <div className="item-div" key={item.noticeId}>
                                            <div className="item-box"><ReadBox  type='item' choseHandle={this.itemInfoRead} item={item}/></div>
                                            <InformItem locationTo={this.locationTo} key={'inform-' + item.noticeId} {...item} onClick={() => {}}/>
                                            </div>
                                            )
                                        })
                                        
                                        }                    
                                </div>)                       
                    }}):
                    isreadList.map((team) => {
                        if(team.isreadArray[0]){
                            return(
                        <div className="infs-day" key={'time-group-' + team.teamId}>  
                        
                            <div className="group-line">{team.isreadArray[0].teamName}</div>
                            {
                            team.isreadArray.map((item)=>{
                                return(
                                <div className="item-div" key={item.noticeId}>
                                <InformItem locationTo={this.locationTo} key={'inform-' + item.noticeId} {...item} />
                                </div>
                                )
                            })
                            
                            }                    
                    </div>
                      )}})
                    }

                       
                        {this.state.activeTag == 'unread'?
                        <div className='load-more-bar'>
                        {this.state.unreadNoResult && <div className='null-info'>无通知</div>}
                        {!this.state.unreadNoResult && !this.state.unreadNoMoreResult && <div className="load-more" onClick={this.getMoreHandle.bind(this,this.state.activeTag)}>
                            点击加载更多
                        </div>}
                        {this.state.unreadNoMoreResult && <div className="no-more-result-alert">没有更多通知！</div>}
                    </div>:
                        <div className='load-more-bar'>
                        {this.state.isreadNoResult && <div className='null-info'>无通知</div>}
                        {!this.state.isreadNoResult && !this.state.isreadNoMoreResult && <div className="load-more" onClick={this.getMoreHandle.bind(this,this.state.activeTag)}>
                            点击加载更多
                        </div>}
                        {this.state.isreadNoMoreResult && <div className="no-more-result-alert">没有更多通知！</div>}
                    </div>}
                        
                      </div>
              </Page>
          )
      }
  }
