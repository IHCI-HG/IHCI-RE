import * as React from 'react';
import { render } from 'react-dom';
import { autobind } from 'core-decorators';

import Page from '../../components/page';

import api, { IApiOptions, IApiResult } from '../../utils/api';
import * as ui from '../../utils/ui';

// import './style.scss'
import { loading } from '../../utils/ui';

export default class Complaint extends React.Component {

    state = {

    }

    data = {

    }

    onClick() {
        this.setState({ 
            page: 'success-page'
        });
    }

    onBack() {
        window.history.back();
    }

    componentDidMount = () => {
        this.data = window.INIT_DATA
    }

    render () {
        return <Page title='投诉'>
                        ssssss
        </Page>
    }
}

render(<Complaint />, document.getElementById('app'));