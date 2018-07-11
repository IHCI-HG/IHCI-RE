import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import api from '../../utils/api';

import routerConf from './router'
import './style.scss'
import '../../commen/style.scss'
import Team from './team'
import ActivateMail from './activate-mail'

class App extends React.Component{
    state = {
        activeTag : '',
        headImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnregyyDrMvhEDpfC4wFetzykulWRVMGF-jp7RXIIqZ5ffEdawIA',
        infoImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1529474819406&di=267791f485fba8aa30e0adc8f0eede6b&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fb8014a90f603738d6c070f19b81bb051f819ecb8.jpg',
        personInfo: {
            teamList: []
        },
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
        if (!(/team-join/.test(this.props.location.pathname)) && !this.infoAllFilled()){
            window.toast("请先完成资料填写")
        }
    }

    infoAllFilled = () => {
        if (!this.state.personInfo.name){
            return false
        }
        if (!this.state.personInfo.mail){
            return false
        }
        if (!this.state.personInfo.phone){
            return false
        }
        return true
    }

    handleSearchTextChange = (e) =>{
        var searchInputText =  e.target.value
        var length = searchInputText.length
        if (length > 42)
            searchInputText = searchInputText.substring(0,42)

        this.setState({
            searchText : searchInputText
        })
    }

    handleSearchRequest = (e) => {
        location.href = '/search' + (this.state.searchText? '?text=' + this.state.searchText : '')
        e.preventDefault();
    }

    routerHandle = (toUrl) => {
        if (this.infoAllFilled())
        {
            this.activeTagHandle(toUrl)
            this.props.router.push(toUrl)
        }
        else{
            this.props.router.push('/person')
            window.toast("请先完成资料填写")
        }

    }

    // 处理路由变化的时候高亮的tag
    activeTagHandle = (url) => {
        if(/team/.test(url)) {
            this.setState({activeTag: 'team'})
        }
        else if(/discuss/.test(url)) {
            this.setState({activeTag: 'team'})
        }
        else if(/member/.test(url)) {
            this.setState({activeTag: 'member'})
        }
        else if(/timeline/.test(url)) {
            this.setState({activeTag: 'timeline'})
        }
        else{
            this.setState({activeTag: ''})
        }
        // if(/inform/.test(url)) {
        //     this.setState({activeTag: ''})
        // }
        // if(/person/.test(url)) {
        //     this.setState({active})
        // }
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
                        <div className='search-bar'>
                            <form className="searchBox" onSubmit={this.handleSearchRequest}>
                                <span className="iconfont icon-search" onClick={()=>{this.searchInputr.focus()}}></span>
                                <input className='searchInput' ref={(input) => { this.searchInputr = input; }} type="text" onChange={this.handleSearchTextChange} placeholder="搜索"/>
                            </form>
                        </div>
                        <Link className='nav-item' activeClassName='nav-item active' to="/person">
                            <img className="head-img" src={this.state.headImg} />
                        </Link>
                        <div className='remind'>
                            <span className='iconfont icon-remind' onClick={this.routerHandle.bind(this, '/inform')}></span>
                        </div>
                    </div>

                </div>
                { this.props.children && React.cloneElement(this.props.children, {personInfo: this.state.personInfo, activeTagHandle: this.activeTagHandle.bind(this)}) }
            </div>
        )
    }
}

const routeConfig = [
    {
        path: '/',
        component: App,
        indexRoute: { component: Team },
        childRoutes: routerConf
    },{
        path: '/activate',
        component: ActivateMail,
    }
]

render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));
