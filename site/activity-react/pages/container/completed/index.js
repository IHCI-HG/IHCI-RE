import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import { timeParse, formatDate, createMarkup } from '../../../utils/util'
import Page from '../../../components/page'

export default class Completed extends React.Component{
    componentDidMount = async() => {
        await this.initTodoListArr()
        this.initTeamInfo()
    }

    initTodoListArr = async () => {
        // 请求todoListArr数据
        const resp = await api('/api/team/taskList', {
            method: 'POST',
            body: {
                teamId: this.props.params.id
            }
        })
        let todoListArr = this.state.todoListArr
        let unclassifiedList = []
        let unclassified = {}
        let todoList = []
        if (resp.data.taskObj.taskList == undefined) {
            resp.data.taskObj.taskList = []
        }
        resp.data.taskObj.taskList.map((item) => {
            if(item.state === true){
                let todoItem = {}
                todoItem.id = item.id
                todoItem.name = item.title
                todoItem.hasDone = item.state
                todoItem.ddl = item.deadline
                todoItem.completer = item.completer
                todoItem.completeTime = item.completed_time
                todoItem.completeTimeStamp = new Date(todoItem.completeTime).getTime()
                todoItem.completeDate = timeParse(todoItem.completeTimeStamp)
                todoItem.assignee = {
                    id: item.header.headerId
                }
                unclassifiedList.push(todoItem)
            }
        })
        unclassified.name = "清单外任务"
        unclassified.list = unclassifiedList
        if (resp.data.taskObj.tasklistList == undefined) {
            resp.data.taskObj.tasklistList = []
        }
        resp.data.taskObj.tasklistList.map((item) => {
            let todoListItem = {}
            todoListItem.id = item._id
            todoListItem.name = item.name
            todoListItem.list = []
            item.taskList.map((mapTodoItem) => {
                if(mapTodoItem.state === true){
                    let todoItem = {}
                    todoItem.id = mapTodoItem.taskId
                    todoItem.name = mapTodoItem.title
                    todoItem.completer = mapTodoItem.completer
                    todoItem.completeTime = mapTodoItem.completed_time
                    todoItem.completeTimeStamp = new Date(todoItem.completeTime).getTime()
                    todoItem.completeDate = timeParse(todoItem.completeTimeStamp)
                    todoItem.hasDone = mapTodoItem.state
                    todoItem.ddl = mapTodoItem.deadline
                    todoItem.assignee = {
                        id: mapTodoItem.header.headerId
                    }
                    todoListItem.list.push(todoItem)
                }
            })
            todoList.push(todoListItem)
        })
        todoListArr = [unclassified, ...todoList]
        if (resp.state.code === 0) {
            this.setState({ todoListArr },() => {
                this.appendToShowList(this.state.todoListArr,()=>{console.log(this.state.todoListArr)})
            })
        }
        console.log(this.state.todoListArr)
    }

    initTeamInfo = async () => {
        const result = await api('/api/team/info', {
            method: 'POST',
            body: {
                teamId: this.props.params.id
            }
        })
        if (!result.data) {
            window.toast('团队内容加载出错')
        }
        const teamInfo = {}
        teamInfo._id = result.data.teamObj._id
        teamInfo.name = result.data.teamObj.name
        
        const memberList = []
        const memberIDList = []

        result.data.teamObj.memberList.map((item) => { 
            memberIDList.push(item.userId)
        })
        const memberResult = await api('/api/userInfoList', {
            method: 'POST',
            body: { userList: memberIDList }
        })
        memberResult.data.map((item, idx) => {
            memberList.push({
                ...item,
                ...result.data.teamObj.memberList[idx],
                chosen: false,
            })
        })
        this.setState({
            teamInfo: teamInfo,
            memberList: memberList,
        })
    }

    appendToShowList = (list) => {
        let showList = this.state.showList
        if(list.length > 0){
            let timeKeyList = []
            list.map((item,index)=>{
                item.list.map((todo,tIndex)=>{
                    if(timeKeyList.indexOf(todo.completeDate) === -1){
                        let timeKey = todo.completeDate
                        timeKeyList.push(timeKey)
                    }
                })
            })
            timeKeyList.sort(function(a,b){
                return b-a;
            });
            this.setState({timeKeyList:timeKeyList })
        }
    }

    state = {
        newsList: [],
        loadMoreCount:1,
        showList: {
            keyList : [],
        },

        showTeamFilter: false,
        noResult: false,
        noMoreResult: false,
        memberJumped: false,
        teamInfo:{},
        memberList:[],
        todoListArr:[],
        showList: {
            keyList : [],
        },
        timeKeyList: [],
    }



    render() {
        var todoList = this.state.todoListArr
        return (
            <Page title='已完成 - IHCI' className="completed-page">
                <div className="return" onClick={()=>{location.href = '/team/'+ this.props.params.id}}>
                    <div className="teamName">{this.state.teamInfo.name}</div>
                </div>
                <div className="completedlist page-wrap">
                    <div className='title-bar'>
                        <div className='completed-title'>
                            已完成的任务
                        </div>
                    </div>

                    {
                        this.state.timeKeyList.map((timeKey) => {
                            return (
                                <div key={'time-group-' + timeKey}>
                                    <div className="completed-day" >
                                        {/* 时间球 */}
                                        <div className="completed-date">{timeKey[4] + timeKey[5] + '/' + timeKey[6] + timeKey[7]}</div>
                                        <div className="completed-list-item">
                                            {   
                                                todoList.map((item)=>{
                                                    if(item.list.find((todo)=>{return todo.completeDate===timeKey})){
                                                        return(
                                                            <div key={"list"+timeKey+item.id} className="completed-list">
                                                                <div className="completed-list-name">
                                                                    {item.name}
                                                                </div>
                                                                {
                                                                    item.list.map((todo)=>{
                                                                        if(todo.completeDate===timeKey){
                                                                            return(
                                                                                <div key={"task "+todo.id} className="completed-item" onClick={()=>{location.href = '/todo/' + todo.id}}>
                                                                                    <i className="iconfont icon-right"></i>{todo.name}
                                                                                    <div className="completer">{todo.completer.name}</div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    })
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="group-line"></div>
                                </div>
                            )
                        })
                    }

                    {this.state.noResult && <div className='null-info'>无动态</div>}
                    <div className='load-more-bar'>
                        {!this.state.noResult && !this.state.noQuery && !this.state.noMoreResult && <div className="load-more" onClick={this.getMoreTimelineData}>
                            点击加载更多
                        </div>}
                        {this.state.noMoreResult && <div className="no-more-result-alert">没有更多动态！</div>}
                    </div>
                </div>


            </Page>
        )
    }
}
