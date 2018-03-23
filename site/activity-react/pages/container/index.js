import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import routerConf from './router'
import './style.scss'
import Page from '../../components/page'

import Team from './team'
import TeamAdmin from './team-admin'
import TeamEdit from './team-edit'

class App extends React.Component{
    state = {
        activeTag : ''
    }
    componentDidMount = async() => {
        this.activeTagHandle(this.props.location.pathname)
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
            this.setState({activeTag: 'discuss'})
        }
        if(/news/.test(url)) {
            this.setState({activeTag: 'news'})
        }
    }

    render() {
        return (
            <Page>
                <nav className='main-nav'>
                    <div className="left">
                        <div className="logo">这是LOGO</div>
                        <div className="nav-list">
                            <span className={this.state.activeTag == 'team' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/team')}>team</span>
                            <span className={this.state.activeTag == 'discuss' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/discuss')}>discuss</span>
                            <span className={this.state.activeTag == 'news' ? 'nav-item active' : 'nav-item'} onClick={this.routerHandle.bind(this, '/news')}>news</span>
                        </div>
                    </div>
                    <div className="person">
                        <Link className='nav-item' activeClassName='nav-item active' to="/person">
                            <div className="head-img"></div>
                        </Link>
                    </div>
                </nav>
                {this.props.children}
            </Page>
        )
    }
}

class team extends React.Component{
    render() {
        return <h3>team</h3>
    }
}
class discuss extends React.Component{
    render() {
        return <h3>discuss</h3>
    }
}
class news extends React.Component{
    render() {
        return <h3>news</h3>
    }
}



const routeConfig = [
    {
        path: '/',
        component: App,
        // indexRoute: { component: team },
        childRoutes: [
            { path: 'team', component: Team },
            { path: 'team-admin/:id', component: TeamAdmin },
            { path: 'team-edit/:id', component: TeamEdit },

            { path: 'discuss', component: discuss },
            { path: 'news', component: news },
        ]
    }
]

render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));