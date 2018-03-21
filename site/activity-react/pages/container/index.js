import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import routerConf from './router'

class App extends React.Component{
    render() {
        return (
            <div>
                <h1>App</h1>
                <ul>
                    <li><Link to="/team">team</Link></li>
                    <li><Link to="/discuss">discuss</Link></li>
                    <li><Link to="/news">news</Link></li>
                </ul>
                {this.props.children}
            </div>
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
            { path: 'team', component: team },
            { path: 'discuss', component: discuss },
            { path: 'news', component: news },
        ]
    }
]

render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));