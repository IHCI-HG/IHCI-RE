import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import api from '../../utils/api';

import routerConf from './router'
import './style.scss'
import '../../commen/style.scss'

import Test from './test'
import TestEditor from './test-editor'

import Team from './team'
import TeamAdmin from './team-admin'
import TeamJoin from './team-join'
import TeamCreate from './team-create'
import Person from './person'
import Discuss from './discuss'
import Topic from './topic'
import Timeline from './timeline'  
import Member from './member'  
import Sign from './sign'
import SearchResult from './search'

class App extends React.Component{
    state = {
        activeTag : '',
        headImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnregyyDrMvhEDpfC4wFetzykulWRVMGF-jp7RXIIqZ5ffEdawIA',
        personInfo: {
            teamList: []
        },
        searchText : '',
    }
    componentWillMount = async() => { 
        this.setHeadImg()
    }
    componentDidMount = async() => {
        this.activeTagHandle(this.props.location.pathname)
    }

    setHeadImg = async () => {
        const result = await api('/api/getMyInfo')
        if(result.data && result.data.personInfo && result.data.personInfo.headImg) {
            this.setState({
                headImg: result.data.personInfo.headImg,
                personInfo: {
                    ...result.data,
                    ...result.data.personInfo,
                }
            })
        }
    }

    handleSearchTextChange = (e) =>{
        this.setState({
            searchText : e.target.value
        })
    }

    handleSearchRequest = (e) => {
        location.href = '/search' + (this.state.searchText? '?text=' + this.state.searchText : '') 
        e.preventDefault();
    }

    routerHandle = (toUrl) => {
        this.activeTagHandle(toUrl)
        this.props.router.push(toUrl)
    }

    // 处理路由变化的时候高亮的tag
    activeTagHandle = (url) => {
        if(/team/.test(url)) {
            this.setState({activeTag: 'team'})
        }
        if(/discuss/.test(url)) {
            this.setState({activeTag: 'team'})
        }
        if(/member/.test(url)) {
            this.setState({activeTag: 'member'})
        }
        if(/timeline/.test(url)) {
            this.setState({activeTag: 'timeline'})
        }
        if(/search/.test(url)) {
            this.setState({activeTag: 'search'})
        }
    }

    render() {
        return (
            <div>
                <div className='main-nav'>
                    <div className="left">
                        <div className="logo">这是LOGO</div>
                        <div className="nav-list">
                            <span className={this.state.activeTag == 'team' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/team')}>团队</span>
                            <span className={this.state.activeTag == 'timeline' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/timeline')}>动态</span>
                            <span className={this.state.activeTag == 'member' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/member')}>成员</span>
                        </div>
                    </div>
                    <div className='search-bar'>
                        <form className="searchBox" onSubmit={this.handleSearchRequest}>
                            <input className='searchInput' type="text" onChange={this.handleSearchTextChange} placeholder="type in keywords to search"/>
                            <span className="iconfont icon-search" onClick={this.handleSearchRequest}></span>
                        </form>
                        {/* <span className="iconfont icon-search" onClick={this.testHandle.bind(this, '/search', 'test', '5b208f7283ea922626e46793')}></span> */}
                    
                    </div>
                    <div className="person">
                        <Link className='nav-item' activeClassName='nav-item active' to="/person">
                            <img className="head-img" src={this.state.headImg} />
                        </Link>
                    </div>
                </div>
                { this.props.children && React.cloneElement(this.props.children, {personInfo: this.state.personInfo}) }
            </div>
        )
    }
}

const routeConfig = [
    {
        path: '/',
        component: App,
        indexRoute: { component: Team },
        childRoutes: [
            { path: 'test', component: Test },
            { path: 'test-editor', component: TestEditor },
            { path: 'team', component: Team },
            { path: 'team-admin/:id', component: TeamAdmin },
            { path: 'team-join/:id', component: TeamJoin },
            { path: 'sign', component: Sign },
            { path: 'team-create', component: TeamCreate },
            { path: 'person', component: Person },
            { path: 'discuss/:id', component: Discuss },
            { path: 'discuss/topic/:id', component: Topic },
            { path: 'timeline', component: Timeline },
            { path: 'member', component: Member },
            { path: 'search', component: SearchResult },
        ]
    }
]



render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));