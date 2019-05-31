import * as React from 'react';
import './style.scss'
import { iframeUrl } from '../../../utils/iframeUrlConfig'
import api from '../../../utils/api';
import Page from '../../../components/page';
import { locationTo } from '../../../utils/util';

export default class calendar extends React.Component{

    componentDidMount = async() => {
        //加载IHCIcookie参数
        const userId = await this.getUserId();
        const teamId = this.props.params.teamId;
        const sendInfo = {
            userId: userId,
            teamId: teamId,
        };
        //获取iframe对象
        var ifr = document.getElementById('iframeId');
        //iframe加载完成时发送信息
        document.getElementById('iframeId').onload = () =>{
            window.addEventListener('message', (e) => {
                ifr.style.height = e.data + 'px';
            });
            //postMessage发送userId
            document.getElementById('iframeId').contentWindow.postMessage(sendInfo,"*");}

    }

    getUserId = async () => {
       //正则匹配IHCIcookie，若为空返回false
       let resId = document.cookie.replace(/(?:(?:^|.*;\s*)rsessionid\s*\=\s*([^;]*).*$)|^.*$/, "$1");
       return resId ? resId : false;

    }

    render() {
        return (
            <Page title="日历 - IHCI" className="calendar-page">
                <div className="page-wrap">
                    <div className="main">
                        <iframe id="iframeId"  frameBorder='0' className="iframeTest" src={iframeUrl}   ></iframe>
                        <div className="clearFloat"></div>
                    </div>
                </div>
            </Page>
        )
    }
}


