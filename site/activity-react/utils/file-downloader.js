var OSSW = require('ali-oss').Wrapper;
import api from './api'

const getOssClient = async () => {
    const result = await api('/api/getOssStsToken', {
        method: 'GET',
        body: {}
    })
    const token = result.data

    const client = new OSSW({
        region: token.region,
        accessKeyId: token.AccessKeyId,
        secure: false,
        accessKeySecret: token.AccessKeySecret,
        stsToken: token.SecurityToken,
        bucket: token.bucket,
    });
    return client
}


const fileDownloader = async (teamId, dir, fileName) => {

    if(typeof teamId != 'string' || typeof dir != 'string' || typeof fileName != 'string') {
        throw '参数错误'

        return '参数错误'
    }

    if (!(dir === '' || (dir[0] === '/' && dir !== '/')))  {
        throw '目录参数错误'

        return '目录参数错误'
    }

    const client = await getOssClient()

    const ossKey = `${teamId}${dir}/${fileName}`

    //Buffer
    var result = await client.get(ossKey);

    return result
}   

export default fileDownloader = fileDownloader