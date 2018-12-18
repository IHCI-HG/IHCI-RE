import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page'


export default class ActivateMailPage extends React.Component{
    state = {
        noRequest: false,
        hasResult: false,
        result:{},
    }

    componentDidMount = async() => {
        const userId = this.props.location.query.userId
        const mailCode = this.props.location.query.mailCode

        if (!!userId && !!mailCode)
        {
            this.activateRequest(userId, mailCode)
        }
        else{
            this.setState({
                noRequest: true,
            })
        }

        setTimeout(() => {
            location.href = '/'
        }, 5000);
    }

    activateRequest = async (userId, mailCode) =>{
 
        const result = await api('/api/checkCode', {
            method: 'POST',
            body: {
                userId: userId,
                mailCode: mailCode,
            }
        })


        if (!!result)
        {
            this.setState({
                result: result,
                hasResult: true,
            })
        }
        
    }

    render() {
      
        return(
        <Page title='激活邮箱 - IHCI' className="activate-page">
            <div className="nav">
                <div className="max-w-con nav-con">
                    <div className="logo">IHCI(换成图)</div>
                </div>
            </div>
            <div className="banner">
                <div className='h1'>All for the valuable code.</div>
                <div className="banner-con max-w-con">
                    {this.state.noRequest ?
                        <div className='active-msg'>验证链接错误</div>
                        : this.state.hasResult ? <div className='active-msg'>{this.state.result.state.msg}</div>
                            : <div className='active-msg'>正在获取验证结果</div>
                    }
                    <div className='jump-to-home' onClick={()=>{location.href='/'}}>5s 后跳转到主页面，未自动跳转请点此链接</div>
                </div>
            </div>
    
            <div className="footer">
                <div className="footer-list max-w-con">
                    <div className="foot-item">
                        <div className="foot-item-title">IHCI</div>
                        <div href="">关于我们</div>
                    </div>
                    <div className="foot-item">
                        <div className="foot-item-title">分类</div>
                        <div href="">软件工程</div>
                        <div href="">人机交互</div>
                        <div href="">人工智能</div>
                    </div>
                    <div className="foot-item">
                        <div className="foot-item-title">编程课程</div>
                        <div href="">HTML&CSS</div>
                        <div href="">JavaScript</div>
                        <div href="">Python</div>
                    </div>
                    <div className="foot-item">
                        <div className="foot-item-title">资源</div>
                        <div href="">参考链接</div>
                    </div>
                </div>
            </div>
        </Page>)
    }
}
