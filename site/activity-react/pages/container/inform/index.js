import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

//import { Router, Route, Link, browserHistory } from 'react-router'
//import routerConf from '../router'
//import Test from '../../test'
//import TestEditor from '../../test-editor'
class InformItem extends React.PureComponent{
    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
    }

    render(){
      switch (this.props.type){
        case 'CREATE_TOPIC':
            return (
                <div className='infs-item-wrap' key={"infs-item-wrap-" + this.props._id} onClick={() => {this.props.locationTo('/discuss/topic/' + this.props.content._id)}}>
                <div className="date">{formatDate(this.props.create_time, 'MM月dd日')}</div>
                  <img src={this.props.creator.headImg} alt="" className="head-img" />

                  <div className='news-con'>
                      <div className="des-line">
                          <span className="name">{this.props.creator.name}</span>
                          <span className="type">{this.typeMap[this.props.type]}</span>
                          <span className="topic">{this.props.content.title}</span>
                      </div>

                      <div className="content">{this.props.content.content}</div>
                  </div>


                </div>
          )
        case 'REPLY_TOPIC':
            return (
                <div className='infs-item-wrap' key={"infs-item-wrap-" + this.props._id} onClick={() => {this.props.locationTo('/discuss/topic/' + this.props.content.topicId)}}>
                    <div className="date">{formatDate(this.props.create_time, 'MM月dd日')}</div>
                    <img src={this.props.creator.headImg} alt="" className="head-img" />

                    <div className="infs-con">
                        <div className="des-line">
                            <span className="name">{this.props.creator.name}</span>
                            <span className="type">{this.typeMap[this.props.type]}</span>
                            <span className="topic">{this.props.content.title}</span>
                        </div>

                        <div className="content">{this.props.content.content}</div>
                    </div>


                </div>
              )
              break;
          default:
              return ''
      }
    }
}
export default class Infs extends React.Component{
      componentWillMount = async() => {

      }
      componentDidMount = async() => {

        await this.initUnreadList()
        console.log(this.state.unreadList)
      }

      loadMoreHandle = () => {
          this.setState({
              index: this.state.index + 10
          })
      }

      appendToShowList = (list) => {
          let showList = this.state.showList
          console.log(list)
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
          console.log(showList)
          this.setState({
              showList: showList
          })
      }
      typeMap = {
          'CREATE_TOPIC': '创建了讨论：',
          'REPLY_TOPIC': '回复了讨论：',
      }
      state = {
          // type: create, reply
          unreadList: [],
          isreadList: [],
          index: 0,
          activeTag: 'unread',
          showList: {
              keyList : [],
          },
          readState:''
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
                  isreadList: readlist
              }, () =>{
                this.appendToShowList(readlist)
              })
              console.log(result)
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
                unreadList: result.data
            }, () =>{
              this.appendToShowList(this.state.unreadList)
            })
            console.log(this.state.unreadList)
        }

    toReadHandle = (readState) => {
          if (readState=="unread")
              this.initUnreadList()
          else this.initIsreadList()
          this.setState({
              activeTag: readState,
              index: 0
          })
      }
//<StateChoseItem key={'state' + this.readState} routerTo={this.routerTo} />
//<div className="readStateChosen">
//<div onClick={() => {location.href = '/inform?readState=unread'; this.getUnreadInform}} locationTo={this.locationTo}>
  //  <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'}>未读</div>
//</div>
//<div onClick={() => {location.href = '/inform?readState=isread'; this.getIsreadInform}} locationTo={this.locationTo}>
  //  <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'}>已读</div>
//</div>
//</div>
      render() {
        const showList = this.state.showList
          return (
              <Page className="infs-page">
              <div className="readStateChosen">
                  <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"unread")}>未读</div>
                  <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'} onClick={this.toReadHandle.bind(this,"isread")}>已读</div>
              </div>
                      {

                          showList.keyList.map((timeKey) => {
                              return (
                                  <div className="infs-day" key={'time-group-' + timeKey}>
                                    {
                                          showList[timeKey].teamKeyList.map((teamKey) => {
                                              return (
                                                  <div key={'group-line-' + timeKey + teamKey}>
                                                      {/* 分组线 */}
                                                      <div className="group-line">{showList[timeKey][teamKey].teamName}</div>
                                                      {
                                                          showList[timeKey][teamKey].infsList.map((item) => {
                                                              return (
                                                                <InformItem locationTo={this.locationTo} key={'timeline-' + item._id} {...item}/>
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

                      <div className="load-more" style={{display: this.state.showList.length > (this.state.index + 10) ? 'block' : 'none'}} onClick={() => {this.loadMoreHandle}}>点击加载更多</div>
              </Page>
          )
      }
  }
