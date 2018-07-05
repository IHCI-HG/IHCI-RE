import * as React from 'react';
import './style.scss'

import api from '../../../utils/api';
import fileUploader from '../../../utils/file-uploader';
import Page from '../../../components/page'

import ProjectChosenList from '../../../components/project-chose-list'

export default class BackUp extends React.Component{
    state =  {
        fileList: [],
    }

    state =  {
        chosenFile: {}
    }

    componentDidMount = async() => {
    }
    
    openFileInput = () => {
        this.fileInput.click()
    }

    handleChange = (e) => {
        console.log(e.target.files[0]);
        this.setState({
            chosenFile: e.target.files[0]
        })
        fileUploader('teamxxx', '/aa', e.target.files[0])
    }

    projectChoseHandle = (tarId) => {
        const projectList = this.state.projectList
        projectList.map((item) => {
            if(item._id == tarId) {
                item.chosen = !item.chosen
            }
        })
        this.setState({projectList})
    }

    state = {
        projectList: [
            {
                _id: 11,
                name: 'project',
                chosen: false,
            },
        ],
    }

    constructor(props) {  
        super(props);  
        this.state = {value: []};  
        this.handleChange = this.handleChange.bind(this);  
    }  

    handleChange(event) {  
        let item = event.target.value;  
        let items = this.state.value.slice();  
        let index = items.indexOf(item);  
        index === -1 ? items.push(item) : items.splice(index, 1);  
        this.setState({value: items});  
    }  

    render(){
        return(
            <Page title="数据备份" className='backup'>

            <div className="title-item">
            <input type="checkbox" />
            <h1 className="title">数据备份</h1>
            <h3 className="discrible">你可以给团队数据创建备份，下载到本地硬盘，永久保存。</h3>
            </div>

            <div className="title-backup">  
                    选择你需要备份的项目<br/>  
                    <ProjectChosenList choseHandle={this.projectChoseHandle} projectList={this.state.projectList}/>
                    {/* <label className="choose"><input type="checkbox" name="proj1" value="proj1"  
                                  onChange={this.handleChange}/> proj1 </label><br/>  
                    <label className="choose"><input type="checkbox" name="proj2" value="proj2"  
                                  onChange={this.handleChange}/> proj2 </label><br/>  
                    <label className="choose"><input type="checkbox" name="proj3" value="proj3"  
                                  onChange={this.handleChange}/> proj3 </label><br/>  
                    <div>Chosen : {this.state.value.join('-')}</div>   */}
            </div>


            <div className="title-backupdate">  
                    选择你需要备份的日历<br/>
                    
                                {/* <div className="check-box">
                                    {item.chosen ? <span className='iconfont icon-right'> </span> : <span className='iconfont icon-right hidden'> </span>}
                                </div>
                                <span>{item.name}</span> */}
                            
                    {/* <label className="choose"><input type="checkbox" name="d" value="d"  
                                  onChange={this.handleChange}/>day1</label><br/>  
                    <label className="choose"><input type="checkbox" name="d" value="d"  
                                  onChange={this.handleChange}/>day2</label><br/>  
                    <label className="choose"><input type="checkbox" name="a" value="a"  
                                  onChange={this.handleChange}/>day3</label><br/>   */}
                    {/* <div>Chosen : {this.state.value.join('-')}</div>   */}
            </div>


                <button className="button2" onClick={()=>{console.log('button clicked');}}>  确认备份  
                </button>
                <div className="backupinfo">
                    <h1 className="title">历史备份信息</h1>
                    <h3 className="discrible">上次备份时间是</h3>
                </div>
                

            </Page>
           
            )   
            
    }
    

}
// ReactDOM.render(
//     <CheckBox/>,
// document.getElementById('root')

//     );




