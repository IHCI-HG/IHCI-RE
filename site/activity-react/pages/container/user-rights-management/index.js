import React from 'react';
import ReactDOM from 'react-dom';



export default class UserRights extends React.Component {

  constructor() {
    super();
    this.state = {
        iFrameHeight: '0px',
        teamId:''
    }
}
componentDidMount(){
    console.log('come in')
    console.log(this.props.params)
    const teamId = this.props.params.teamId
    const actor = this.props.params.actor
    this.setState({
        teamId:teamId
    })
    if(!teamId){
        document.getElementById("my-iframe-id").src=`http://localhost:3000/${actor}`
    }else{
        document.getElementById("my-iframe-id").src=`http://localhost:3000/${actor}/${teamId}`
    }
  
}



  render() {
    return (
	  <iframe 
                id="my-iframe-id"
                onLoad={() => {
                    const obj = ReactDOM.findDOMNode(this);
                    this.setState({
                        "iFrameHeight":  obj.contentWindow.document.body.scrollHeight + 'px'
                    });
                }} 
                ref="iframe" 
                src="http://localhost:3000/" 
                width="100%" 
                // height= {ReactDOM.findDOMNode(this).contentWindow.document.body.scrollHeight+ 'px'}
				height="1700px"
				scrolling="no" 
                frameBorder="0"
            />
    );
  }
}
