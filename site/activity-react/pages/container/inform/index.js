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
        //???
        showList: {
            keyList : [],
        },
        readState:'',
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
      const unreadlist = result.data
      this.setState({
          unreadList: unreadlist
        }, () =>{
          this.appendToShowList(unreadlist)
        })
        if(result.data.length<moreInformItemNum){
          this.setState({
            noMoreResult: true
            
          })
        }
      }

      getMoreIsreadData = async () => {
        const lastStamp = this.state.lastStamp
        const result = await api('/api/user/showReadList', {
            method: 'POST',
            body:{
              timeStamp: lastStamp? lastStamp: '',
            }
        })
        const readlist = result.data
        this.setState({
            isreadList: readlist
        }, () =>{
            this.appendToShowList(readlist)
        })
        if(result.data.length<moreInformItemNum){
          this.setState({
            noMoreResult: true
          })
        }
      }

      appendToShowList = (list) => {
          let showList = this.state.showList
          var listLength = list.length
          if(listLength > 0){
            list.map((item) => {
              var timeKey = timeParse(item.create_time)
              if(!showList[timeKey]) {
                  showList.keyList.push(timeKey)
                  showList[timeKey] = {}
                  showList[timeKey].teamKeyList = []
              }
              if(!showList[timeKey][item.teamId]) {
                  showList[timeKey].teamKeyList.push(item.teamId)
                  showList[timeKey][item.teamId] = {}
                  showList[timeKey][item.teamId].teamName = item.teamName
                  showList[timeKey][item.teamId].infsList = []
              }
              showList[timeKey][item.teamId].infsList.push(item)
          })
            this.setState({
              showList: showList,
              lastStamp: list[listLength - 1].create_time,
            })
        } else if (showList.keyList.length ==0){
          this.setState({
            noResult: true,
          })
        }else{
          this.setState({
            noMoreResult: true,
          })
        }
        //   console.log(showList)

      }
      typeMap = {
          'CREATE_TOPIC': '创建了讨论：',
          'REPLY_TOPIC': '回复了讨论：',
          'EDIT_TOPIC': '修改了讨论：',
          'EDIT_REPLY': '编辑了回复: ',
      }
     
      initIsreadList = async () => {

              const result = await api('/api/user/showReadList', {
                  method: 'POST',
                  body:{}
              })

              const readlist = result.data
              this.setState({
                showList: {
                    keyList : [],
                },
                  isreadList: readlist,
                  noResult: false,
                  noMoreResult: false,
              }, () =>{
                this.appendToShowList(this.state.isreadList)
              })
          }



      initUnreadList = async () => {
            const result = await api('/api/user/showUnreadList', {
                method: 'POST',
                body:{}
            })
            this.setState({
              showList: {
                  keyList : [],
              },
                unreadList: result.data,
                noResult: false,
                noMoreResult: false,
            }, () =>{
              this.appendToShowList(this.state.unreadList)
            })
            // if(result.data.length<newInformItemNum){
            //   this.setState({
            //     noMoreResult: true
            //   })
            // }
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
        const showList = this.state.showList
        const userId = this.props.personInfo._id

        // console.log(this.state)
          return (
            <Page className="infs-page">
            <div className='page-wrap'>
                <div className="readStateChosen">
                    <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"unread")}>未读</div>
                    <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"isread")}>已读</div>
                    <div className='read-tag-item'>标记为已读</div>
                </div>
                        {

                            showList.keyList.map((timeKey) => {
                                return (
                                    <div className="infs-day" key={'time-group-' + timeKey}>
                                        {
                                            showList[timeKey].teamKeyList.map((teamKey) => {
                                                // console.log(showList[timeKey][teamKey].teamName)
                                                //choseHandle={this.memberChoseHandle}
                                                return (
                                                    <div className="group-div" key={'group-line-' + timeKey + teamKey}>
                                                        {/* 分组线 */}
                                                        <div className="group-box"><ReadBox choseHandle={this.groupInfoRead} item={teamKey}/></div>
                                                        <div className="group-line">{showList[timeKey][teamKey].teamName}</div>
                                                        {
                                                            showList[timeKey][teamKey].infsList.map((item) => {
                                                                // console.log(item)
                                                                return (
                                                                    <div className="item-div" key={item.noticeId}>
                                                                    <div className="item-box"><ReadBox choseHandle={this.changeReadState} item={item}/></div>
                                                                    <InformItem locationTo={this.locationTo} key={'inform-' + item.noticeId} {...item} onClick={() => {}}/>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
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
