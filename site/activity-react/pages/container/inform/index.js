import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

//import { Router, Route, Link, browserHistory } from 'react-router'
//import routerConf from '../router'
//import Test from '../../test'
//import TestEditor from '../../test-editor'

class StateChoseItem extends React.PureComponent{

  state={
    activeTag:'unread',
    showList: {
        keyList : [],
    },

  }
  componentDidMount = () => {
      this.activeTagHandle(this.props.pathname)
  }
  //routerHandle = (toUrl) => {
  //    this.activeTagHandle(toUrl)
      //this.props.router.push(toUrl)
  //}
  //console.log(this.props.pathname)
  activeTagHandle = (url) => {
    if(/inform?readState=unread/.test(url)){
      this.setState({activeTag: 'unread'});
      //this.getUnreadInform()
    }
    if(/inform?eradState=isread/.test(url)){
      this.setState({activeTag: 'isread'});
      //this.getIsreadInform()
    }
    //const theUrl=getQueryStringArgs();
    console.log(this)
    //location.href = '/inform?readState='+this.state.activeTag
  }

  render(){
    //this.setUnread; location.href = '/inform?readState=' + this.state.activeTag; this.getUnreadInform
//<div onClick={() => {this.routerHandle.bind(this, '/inform?readState=isread'); location.href = '/inform?readState=' + this.state.activeTag}}>
//    <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'}>已读</div>
//</div>
    return(
      <div className="readStateChosen">
      <div onClick={() => {this.props.locationTo('/inform?readState=unread')}}>
          <div className={this.state.activeTag == 'unread'?'read-tag-item act':'read-tag-item'}>未读</div>
      </div>
      <div onClick={() => {this.props.locationTo('/inform?readState=isread')}}>
          <div className={this.state.activeTag == 'isread'?'read-tag-item act':'read-tag-item'}>已读</div>
      </div>
      </div>

    )
  }
}

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
      await this.activeTagHandle(this.props.pathname)
      }
      componentDidMount = async() => {
        this.teamId = this.props.params.id
          //await this.initInformData()
          await this.getUnreadInform()
      }

      locationTo = (url) => {
          this.props.router.push(url)
      }

      initInformData = async () => {
          const queryTeamId = this.props.location.query.teamId

          const result = await api('/api/timeline/getTimeline', {
              method: 'POST',
              body: queryTeamId ? {
                  teamId: queryTeamId
              } : {}
          })
          this.setState({
              infsList: result.data
          }, () => {
              this.appendToShowList(this.state.infsList)
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
          activeTag:'isread',
          infsList: [],
          showList: {
              keyList : [],
          },
    //      showTeamFilter: false,
    //      teamList: [],
      }
    //  teamFilterHandle = () => {
      //    this.setState({
        //      teamList: this.props.personInfo.teamList,
          //    showTeamFilter: !this.state.showTeamFilter
        //  })
    //  }

    //routerHandle = (toUrl) => {
    //    this.activeTagHandle(toUrl)
        //this.props.router.push(toUrl)
    //}
    //console.log(this.props.pathname)
    getUnreadInform = async () => {

      const result = await api('/api/timeline/getTimeline', {
          method: 'POST',
          body: {

          }
      })
      this.setState({
        showList: {
            keyList : [],
        },
          infsList: result.data
      }, () => {
          this.appendToShowList(this.state.infsList)
      })
    }

    getIsreadInform = async () => {
      const result = await api('/api/timeline/getTimeline', {
        methods: 'POST',
        body: {

        }
      })
      this.setState({
        showList: {
            keyList : [],
        },
        infslist: result.data
      }, () => {
        this.appendToShowList(this.state.infsList)
      })
    }

    activeTagHandle = (url) => {
      if(/inform?readState=unread/.test(url)){
        this.setState({activeTag: 'unread'});
        //this.getUnreadInform()
      }
      if(/inform?eradState=isread/.test(url)){
        this.setState({activeTag: 'isread'});
        //this.getIsreadInform()
      }
      //location.href = '/inform?readState='+this.state.activeTag
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
              <StateChoseItem key={'state' + this.readState} locationTo={this.locationTo} />
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

                      <div className="load-more" onClick={() => {}}>点击加载更多</div>
              </Page>
          )
      }
  }
