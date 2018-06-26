import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate } from '../../../utils/util'
import Page from '../../../components/page'

class InformItem extends React.PureComponent{
    typeMap = {
        'CREATE_TOPIC': '创建了讨论：',
        'REPLY_TOPIC': '回复了讨论：',
    }

    render(){
      switch (this.props.type){
        case 'CREATE_TOPIC':
            return (
                <div className='infs-item-wrap'>
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
        case 'REPLY_TOPIC':
            return (
                <div className='infs-item-wrap'>
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
      componentDidMount = async() => {
          await this.initInformData()
        //  this.initTeamList()
      }

      initInformData = async () => {
          const queryTopicId = this.props.location.query.topicId

          const result = await api('/api/topic/addTopicReader', {
              method: 'POST',
              body: queryTopicId ? {
                  topicId: queryTopicId
              } : {}
          })
          this.setState({
              infsList: result.data
          }, () => {
              this.appendToShowList(this.state.infsList)
          })

      }

  //    initTeamList = () => {
  //        this.setState({
  //            shownTeam: this.props.personInfo && this.props.personInfo.teamList || [],
    //      })
  //    }

      appendToShowList = (list) => {
          let showList = this.state.showList

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
          console.log(showList);
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

      render() {
          const showList = this.state.showList
          return (
              <Page className="infs-page">

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
                                                              return <InformItem key={'timeline-' + item._id} {...item}/>
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
