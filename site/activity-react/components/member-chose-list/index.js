import * as React from 'react';
import './style.scss'


class MemberChosenList extends React.Component{
    state = {
        all: '',
    }

    handleClickAll = () => {
        if (this.state.all){
            this.setState({
                all: false
            })
            for (var i = 0; i < this.props.memberList.length; i++) {
                this.props.memberList[i].chosen = false;
            }    
        }
        else {
            this.setState({
                all: true
            })
            // console.log("member:   " + this.props.memberList[1].chosen)
            // console.log("len: "+ this.props.memberList.length)
            for (var i = 0; i < this.props.memberList.length; i++) {
                this.props.memberList[i].chosen = true
            }
        }
    }

    render() {
        
        return(
            <div className={`member-chosen-list ${this.props.className || ''}`}>
                <div className="member-chosen-item" onClick={this.handleClickAll.bind(this)}>
                    <div className="check-box">
                        {
                            this.state.all 
                            ? <span className='iconfont icon-right'></span> 
                            : <span className='iconfont icon-right hidden'></span>
                        }
                    </div>
                    <span>全选</span>
                </div>
                {
                    this.props.memberList.map((item) => {
                        return (
                            <div key={"member-item-" + item._id} className="member-chosen-item" onClick={() => {this.props.choseHandle(item._id)}}>
                                <div className="check-box">
                                    {item.chosen ? <span className='iconfont icon-right'> </span> : <span className='iconfont icon-right hidden'> </span>}
                                </div>
                                <span>{item.name}</span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default MemberChosenList