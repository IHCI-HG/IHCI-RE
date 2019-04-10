import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import Page from '../../../components/page';
import { locationTo } from '../../../utils/util';

export default class calendar extends React.Component{

    componentDidMount = async() => {
       
        const userId = await this.getUserId();
        document.domain = '39.108.68.159';
        var ifr = document.getElementById('iframeId');
        document.getElementById('iframeId').onload=function(){
        document.getElementById('iframeId').contentWindow.postMessage(userId,"*");}
      
    }

    state = {
        userId:''
    }
    getUserId = async () => {
       let resId = document.cookie.replace(/(?:(?:^|.*;\s*)rsessionid\s*\=\s*([^;]*).*$)|^.*$/, "$1");
       return (resId ? resId:false);

    }

    render() {
        return (
            <Page title="日历 - IHCI" className="calendar-page">
                <div className="page-wrap">
                    <div className="main">
                        <iframe id="iframeId"  className="iframeTest" src="http://39.108.68.159:5001/"   ></iframe>
                    </div>
                </div>
            </Page>
        )
    }
}


