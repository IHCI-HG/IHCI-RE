import * as React from 'react';
import './style.scss'

// state = {
//     className: 'custom-class',
//     memberList: [
//         {
//             id: 11,
//             name: 'String',
//             chosen: true,
//         },
//         {
//             id: 22,
//             name: 'String',
//             chosen: true,
//         },
//         {
//             id: 33,
//             name: 'String',
//             chosen: true,
//         },
//         {
//             id: 44,
//             name: 'String',
//             chosen: true,
//         },
//     ],
//     choseHandle: (id) => {
//         // 自行处理外部chosen状态 
//     }
// }

// memberChoseHandle = (tarId) => {
//     const memberList = this.state.memberList
//     memberList.map((item) => {
//         if(item.id == tarId) {
//             item.chosen = !item.chosen
//         }
//     })
//     this.setState({memberList})
// }

class MemberChosenList extends React.Component{
    render() {
        return(
            <div className={`member-chosen-list ${this.props.className || ''}`}>
                {
                    this.props.memberList.map((item) => {
                        return (
                            <div key={"member-item-" + item.id} className="member-chosen-item" onClick={() => {this.props.choseHandle(item.id)}}>
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