import * as React from 'react';
import './style.scss'


class MemberChosenList extends React.Component{
    render() {
        return(
            <div className={`member-chosen-list ${this.props.className || ''}`}>
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