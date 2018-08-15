import * as React from 'react';
import './style.scss'

//onClick={() => {this.props.choseHandle(item._id)}}
class ReadBox extends React.Component{
    render() {
            const type = this.props.type
            const item = this.props.item

                        return (
                            <div key={"read-box-"+ item} className="read-box-item"  onClick={() => {this.props.choseHandle(item)}}>
                                <div className="check-box">
                                    {item.readState ? <span className='iconfont icon-right'> </span> : <span className='iconfont icon-right hidden'> </span>}
                                </div>
                            </div>
                        )
            }
}

export default ReadBox