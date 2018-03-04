import * as React from 'react';
import { render } from 'react-dom';
import { autobind } from 'core-decorators';

import Page from '../../components/page';

import api, { IApiOptions, IApiResult } from '../../utils/api';
import * as ui from '../../utils/ui';

import './style.scss'
import { loading } from '../../utils/ui';

@autobind
export default class Complaint extends React.Component<{}, {}> {

    state = {
        page: 'list-page', // list-page, success-page

        list: [
            {
                content: '欺诈（未开课，内容虚假等）',
                active: false,
            },
            {
                content: '色情',
                active: false,
            },
            {
                content: '诱导行为',
                active: false,
            },
            {
                content: '不实信息',
                active: false,
            },
            {
                content: '违法犯罪',
                active: false,
            },
            {
                content: '骚扰',
                active: false,
            },
            {
                content: '侵权',
                active: false,
            },
            {
                content: '其他',
                active: false,
            }
        ]
    }

    onClick() {
        this.setState({ 
            page: 'success-page'
        });
    }

    onBack() {
        window.history.back();
    }

    render () {
        return <Page title='投诉'>
            {
                this.state.page === 'list-page' ?
                    <>
                    <header className='head-title'>请选择投诉原因</header>
                    <section className="complaint-list">
                        <ul>
                            {
                                this.state.list.map((item, index) => (
                                    <li key={`item-${index}`}
                                        onClick={ this.onClick }>
                                        { item.content }
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    </>
                    :
                    <section className="success-page">
                        提交成功。

                        <span className="back-btn" onClick={ this.onBack }>返回</span>
                    </section>
            }
        </Page>
    }
}

render(<Complaint />, document.getElementById('app'));