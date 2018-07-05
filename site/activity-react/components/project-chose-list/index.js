import * as React from 'react';
import './style.scss'


export default class ProjectChosenList extends React.Component{
    render() {
        return( 
            <div className={`project-chosen-list ${this.props.className || ''}`}>
                {
                    this.props.projectList.map((item) => {
                        return (
                            <div key={"project-item-" + item._id} className="project-chosen-item" onClick={() => {this.props.choseHandle(item._id)}}>
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
}5