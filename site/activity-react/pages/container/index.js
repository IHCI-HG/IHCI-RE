import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import api from '../../utils/api';

import routerConf from './router'
import './style.scss'
import '../../commen/style.scss'
import Team from './team'
import ActivateMail from './activate-mail'
import TeamJoin from './team-join'
import WxCode from './wxcode'
import WxChoose from './wx-choose'
import IhciJoin from './ihci-join';
import PwdReset from './password-reset'

class App extends React.Component{
    state = {
        activeTag : '',
        menuName: '',
        menuEmail: '',

        headImg: require('./DefaultImage.jpg'),
        infoImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1529474819406&di=267791f485fba8aa30e0adc8f0eede6b&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fb8014a90f603738d6c070f19b81bb051f819ecb8.jpg',
        personInfo: {
            teamList: []
        },

        display: 'none',
        menuSetBgColor: '',
        menuModifyBgColor:'',
        menuCreateBgColor: '',
        menuQuitBgColor: '',

        showRemindCount: '',
        
    }



    handleMouseOut = this.handleMouseOut.bind(this);
    handleMouseOver = this.handleMouseOver.bind(this);
    handleSetMouseOver = this.handleSetMouseOver.bind(this);
    handleSetMouseOut = this.handleSetMouseOut.bind(this);
    handleModifyMouseOut = this.handleModifyMouseOut.bind(this);
    handleModifyMouseOver = this.handleModifyMouseOver.bind(this);
    handleCreateMouseOver = this.handleCreateMouseOver.bind(this);
    handleCreateMouseOut = this.handleCreateMouseOut.bind(this);
    handleQuitMouseOver = this.handleQuitMouseOver.bind(this);
    handleQuitMouseOut = this.handleQuitMouseOut.bind(this);

    initUnreadList = async () => {
        const result = await api('/api/user/showUnreadList', {
            method: 'POST',
            body:{}
        })
        this.setState({
          showRemindCount: result.data.length
        })
    }



    handleMouseOver() {
        this.setState({
            display:'block',
        })
    }
    handleMouseOut() {
        this.setState({
            display:'none',
        });
    }
    handleSetMouseOver() {
        this.setState({
            menuSetBgColor: '#ccc'
        })
    }
    handleSetMouseOut() {
        this.setState({
            menuSetBgColor: 'whitesmoke'
        })
    }
    handleModifyMouseOver() {
        this.setState({
            menuModifyBgColor: '#ccc'
        })
    }
    handleModifyMouseOut() {
        this.setState({
            menuModifyBgColor: 'whitesmoke'
        })
    }
    handleCreateMouseOver() {
        this.setState({
            menuCreateBgColor: '#ccc'
        })
    }
    handleCreateMouseOut() {
        this.setState({
            menuCreateBgColor: 'whitesmoke'
        })
    }
    handleQuitMouseOver() {
        this.setState({
            menuQuitBgColor: '#ccc'
        })
    }
    handleQuitMouseOut() {
        this.setState({
            menuQuitBgColor: 'whitesmoke'
        })
    }



    componentWillMount = async() => {
        this.setHeadImg()
    }
    componentDidMount = async() => {
        this.activeTagHandle(this.props.location.pathname)
  
        await this.initUnreadList()
    }

    setHeadImg = async () => {
        const result = await api('/api/getMyInfo',{
            method: 'POST',
            body: {}
        })
        if(result.data.userObj && result.data.userObj.personInfo && result.data.userObj.personInfo.headImg) {
            this.setState({
                headImg: result.data.userObj.personInfo.headImg,
                menuName: result.data.userObj.personInfo.name,
                menuEmail: result.data.userObj.personInfo.mail,
                personInfo: {
                    ...result.data.userObj,
                    ...result.data.userObj.personInfo,
                },
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
        // if (!this.state.personInfo.mail){
        //     return false
        // }
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
            location.href = toUrl
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
    locationTo = (url) => {
        location.href = url
    }
    logOutHandle = async () => {
        const result = await api('/api/logout', {
            method: 'POST',
            body: {
                ...this.state.personInfo
            }
        })

        if(result.state.code === 0) {
            location.href = '/'
        }

    } 

    render() {
        return (
            <div>
                <div className='main-nav'>
                    {/* 头像-菜单栏 */}
                    <div className="menu" style={{display:this.state.display}} 
                    onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
                        <div className="menuArrow" ></div>{/* 菜单箭头 */}
                        <div className="menuHeader" >
                            <div>{this.state.menuName}<small><i className="iconfont icon-people"></i></small></div>
                            <div>{this.state.menuEmail}</div>
                        </div>
                        <div className="menuSet" onClick={this.routerHandle.bind(this, '/person')} 
                        style={{backgroundColor:this.state.menuSetBgColor}}
                        onMouseOver={this.handleSetMouseOver} onMouseOut={this.handleSetMouseOut}>个人设置</div>
                        <div className="modifyPassword" onClick={this.routerHandle.bind(this,'/modify-password')}
                        style={{backgroundColor:this.state.menuModifyBgColor}}
                        onMouseOver={this.handleModifyMouseOver} onMouseOut={this.handleModifyMouseOut}>修改密码</div>
                        <div className="menuCreate" onClick={() => {this.locationTo('/team-create')}} 
                        style={{backgroundColor:this.state.menuCreateBgColor}}
                        onMouseOver={this.handleCreateMouseOver} onMouseOut={this.handleCreateMouseOut}>+创建团队</div>
                        <div className="menuQuit" onClick={this.logOutHandle} 
                        style={{backgroundColor:this.state.menuQuitBgColor}}
                        onMouseOver={this.handleQuitMouseOver} onMouseOut={this.handleQuitMouseOut}>退出</div>
                    </div>

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

                        <div className='nav-item' 
                        onClick={this.routerHandle.bind(this, '/person')}
                        onMouseOver={this.handleMouseOver} 
                        onMouseLeave={this.handleMouseOut}
                        >                           
                            <img className="head-img" src={this.state.headImg} />                               
                        </div>          
                   
                        <div className='remind'>
                            <div className={this.state.showRemindCount > 0 ? 'shake' : ''}>
                            <span className='iconfont icon-remind'  onClick={this.routerHandle.bind(this, '/inform')}></span>                           
                            {
                                this.state.showRemindCount > 0 
                                && 
                                <span className="redPoint" onClick={this.routerHandle.bind(this, '/inform')} >{this.state.showRemindCount}</span>
                            }   
                            </div>
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
    },
    {
        path: '/team-join/:id',
        component: TeamJoin 
    },
    {
        path: '/wxcode',
        component: WxCode 
    },
    {
        path: '/wx-choose',
        component: WxChoose 
    },
    {
        path: '/ihci-join',
        component: IhciJoin
    },
    {
        path: '/password-reset',
        component: PwdReset
    }
]

render(<Router routes={routeConfig} history={browserHistory}/>, document.getElementById('app'));
