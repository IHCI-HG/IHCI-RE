const axios = require('axios')

//这里更改为权限管理服务部署的地址
const userRightsService = 'http://localhost:8081/'

const request =  async function(api,params){
    var result = await axios.post(userRightsService+api,params)
    return result
}
module.exports = {
    request
}