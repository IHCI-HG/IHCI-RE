import * as React from 'react';
import './style.scss'
import Page from '../../../components/page'

export default class Wxcode extends React.Component{
    render() {
        return(
            <Page title='IHCI' className="main-page">
                <div className='wx-login-dialog'>
                    <img src={require('./sample-qr.png')}/>
                    <p className="text">关注公众号，加入IHCI平台</p>
                </div>
            </Page>
        )
    }
}
