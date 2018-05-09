import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import api from '../../utils/api';

import routerConf from './router'
import './style.scss'
import '../../commen/style.scss'

import Team from './team'
import Test from './test'
import TeamAdmin from './team-admin'
import TeamCreate from './team-create'
import Person from './person'
import Discuss from './discuss'
import Topic from './topic'
import Timeline from './timeline'  
import Member from './member'  
import Sign from './sign'

class App extends React.Component{
    state = {
        activeTag : '',
        headImg: '',
    }
    componentDidMount = async() => {
        this.activeTagHandle(this.props.location.pathname)

        this.setHeadImg()
    }

    setHeadImg = async () => {
        const result = await api('/api/getMyInfo')
        if(result.data && result.data.personInfo && result.data.personInfo.headImg) {
            this.setState({
                headImg: result.data.personInfo.headImg
            })
        }
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
                    <div className="person">
                        <Link className='nav-item' activeClassName='nav-item active' to="/person">
                            <img className="head-img" src={this.state.headImg} />
                        </Link>
                    </div>
                </div>
                { this.props.children }
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
            { path: 'team', component: Team },
            { path: 'sign', component: Sign },
            { path: 'team-admin/:id', component: TeamAdmin },
            { path: 'team-create', component: TeamCreate },
            { path: 'person', component: Person },
            { path: 'discuss/:id', component: Discuss },
            { path: 'discuss/topic/:id', component: Topic },
            { path: 'timeline', component: Timeline },
            { path: 'member', component: Member },
        ]
    }
]



render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));