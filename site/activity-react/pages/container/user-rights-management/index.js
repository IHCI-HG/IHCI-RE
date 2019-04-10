import React from 'react';
import ReactDOM from 'react-dom';
// import { Row, Col, Icon, Button, Layout, Menu, Card } from 'antd';


export default class Index extends React.Component {

  constructor() {
    super();
    this.state = {
        iFrameHeight: '0px'
    }
}
componentDidMount(){
	// var iframeWindow = document.getElementById('my-iframe-id').contentWindow;
	// iframeWindow.addEventListener('load',function(){
	// 	var doc = iframe.contentDocument || iframe.contentWindow.document;
	// 	var target = doc.getElementById('my-target-id');
	// 	target.innerHTML = 'fount it'
	// })
	// console.log( document.getElementById('my-iframe-id').contentWindow)
}



  render() {
    return (
	  <iframe 
				id="my-iframe-id"
                // style={{width:'100%', height:this.state.iFrameHeight, overflow:'visible'}}
                onLoad={() => {
                    const obj = ReactDOM.findDOMNode(this);
                    this.setState({
                        "iFrameHeight":  obj.contentWindow.document.body.scrollHeight + 'px'
                    });
                }} 
                ref="iframe" 
                src="http://www.baidu.com" 
                width="100%" 
                // height= {ReactDOM.findDOMNode(this).contentWindow.document.body.scrollHeight+ 'px'}
				height="1700px"
				scrolling="no" 
                frameBorder="0"
            />
    );
  }
}
