import * as React from 'react';
import Modal from '../../../components/modal';

export default class Hello extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => Modal.confirm({
          title: 'Demo',
          content: 'Hello world!',
          okText: '确认',
          cancelText: '取消',
          onOk: () => console.log('ok'),
          onCancel: () => console.log('cancel')
        })}>click me!</button>
      </div>
    );
  }
}