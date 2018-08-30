import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'
import fileUploader from '../../../utils/file-uploader';

export default class TeamCreate extends React.Component{
    componentDidMount = async() => {
        
    }

    state = {
        name: '',
        teamImg: require('../DefaultTeam.jpg'),
        desc: '',
        infoCheck:{
            teamNameEmpty:true
        }
       
    }

    teamNameInputHandle = (e) => {
        const teamName = e.target.value
        var teamNameEmpty = true
        if(teamName){
            teamNameEmpty = false
        }else{
            teamNameEmpty = true
        }
        this.setState({
            name: e.target.value,
            infoCheck:{
                ...this.state.infoCheck,
                teamNameEmpty:teamNameEmpty
            }
        })
    }
    teamImgChangeHandle = (e) => {
        this.setState({
            teamImg: e.target.value
        })
    }
    teamDescChangeHandle = (e) => {
        this.setState({
            desc: e.target.value
        })
    }

    createBtnHandle = async () => {
   
        if(this.state.infoCheck.teamNameEmpty){
            window.toast("团队名称为空")
        }
        const result = await api('/api/team/create', {
            method: 'POST',
            body: {
                    teamName: this.state.name,
                    teamImg: this.state.teamImg,
                    teamDes: this.state.desc
            }
        })

        if(result.state.code === 0) {
            window.toast("创建成功")
            location.href = '/team/'
        }
    }
    
    openFileInput = () => {
        this.fileInput.click()
    }

    uploadFileHandle = async (e) => {
        var file = e.target.files[0];
        
        var arr = file.name.split('.')
        var type = arr.pop()
        if(type != 'jpg' && type != 'jpeg' && type != 'png') {
            window.toast("文件格式必须是JPG，JPEG或PNG")
            return 
        }
 
        var newFile = new File([file],this.teamId+file.name)

        var ossKey = Date.now()+'/'+newFile.name
        var succeeded;
        const uploadResult = fileUploader(newFile,ossKey)
        await uploadResult.then(function(val) {
            succeeded = 1
        }).catch(function(reason){
            succeeded = 0
        })

        if(succeeded === 0) {
            window.toast("上传图片失败")
            return
        } 

        window.toast("上传图片成功")
        this.setState({
            teamImg: window.location.origin+'/img/'+ossKey
        })
    }


    render() {
        return (
            <Page title={"创建团队"} className="team-admin-page">
                <input className='file-input-hidden' type="file" ref={(fileInput) => this.fileInput = fileInput} onChange={this.uploadFileHandle}></input>

                <div className="team-admin-con page-wrap">
                    <div className="admin-title-bg">创建团队</div>

                    <div className="admin-title-sm">团队名称</div>
                    <input type="text" value={this.state.name} className="admin-input" onChange={this.teamNameInputHandle} />

                    <div className="admin-title-sm">团队图片</div>
                    <div className="img-wrap">
                        <div>
                            <img className="img-preview" src={this.state.teamImg}></img>
                        </div>
                        <div className="create-btn" onClick={this.openFileInput}> 上传图片 </div>
                    </div>

                    <div className="admin-title-sm">团队说明</div>
                    <textarea type="text" value={this.state.desc} className="admin-tra" onChange={this.teamDescChangeHandle} placeholder="（选填)" />

                    <div className="sava-btn" onClick={this.createBtnHandle}>创建</div>

                </div>

            </Page>
        )
    }
}


