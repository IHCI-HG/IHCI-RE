import * as React from 'react';
import './style.scss'
import api from '../../../utils/api';
import Page from '../../../components/page'
import fileUploader from '../../../utils/file-uploader';

export default class TeamAdmin extends React.Component{
    componentDidMount = async() => {
        
    }

    state = {
        name: '',
        teamImg: 'default.jpg',
        desc: '',
       
    }

    teamNameInputHandle = (e) => {
        this.setState({
            name: e.target.value
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
        const result = await api('/api/team/create', {
            method: 'POST',
            body: {
                teamInfo: {
                    name: this.state.name,
                    teamImg: this.state.teamImg,
                    teamDes: this.state.desc
                }
            }
        })

        if(result.state.code === 0) {
            console.log(result);
            window.toast("创建成功")
            location.href = '/team-admin/' + result.data.teamObj._id
        }
    }
    
    openFileInput = () => {
        this.fileInput.click()
    }

    uploadFileHandle = async (e) => {
        var file = e.target.files[0];
        var newFile = new File([file],this.teamId+file.name)

        var succeeded;
        const uploadResult = fileUploader('', '', newFile)
        await uploadResult.then(function(val) {
            succeeded = 1
        }).catch(function(reason){
            console.log(reason)
            succeeded = 0
        })

        if(succeeded === 0) {
            window.toast("上传图片失败")
            return
        } 

        window.toast("上传图片成功")
        this.setState({
            teamImg: this.teamId+file.name
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
                    <div className="create-btn" onClick={this.openFileInput}> 上传图片 </div>
                    <img className="img-preview" src={window.location.origin+'/img/'+this.state.teamImg}></img>

                    <div className="admin-title-sm">团队说明</div>
                    <textarea type="text" value={this.state.desc} className="admin-tra" onChange={this.teamDescChangeHandle} />

                    <div className="sava-btn" onClick={this.createBtnHandle}>创建</div>

                </div>

            </Page>
        )
    }
}


