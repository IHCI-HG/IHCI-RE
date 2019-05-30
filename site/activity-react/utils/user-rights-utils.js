import api from './api';
const permissionJudgeList = async function(teamId) {
    console.log(teamId)
    const result = await api('/api/permissionJudgeList', {
        method: 'POST',
        body: {
            teamId: teamId
        }
    });
    console.log(result)
    const permissionList = result.data.permissionList
    console.log(permissionList)
    return permissionList;

};

const isOpenUserRightServiceResult = async function(teamId) {
    const result = await api('/api/is-open-user-right-service',{
        method:'POST',
        body:{
            teamId: teamId
        }
    })
    console.log(result)
    return result.state.code === 0 ? true : false
}

export { permissionJudgeList };
export { isOpenUserRightServiceResult };