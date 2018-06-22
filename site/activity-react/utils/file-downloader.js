var OSSW = require('ali-oss').Wrapper;
import api from './api'

const fileDownloader = async (teamId, dir, fileName) => {

    if(typeof teamId != 'string' || typeof dir != 'string' || typeof file.name != 'string') {
        throw '参数错误'

        return '参数错误'
    }

    if (!(dir === '' || (dir[0] === '/' && dir !== '/')))  {
        throw '目录参数错误'

        return '目录参数错误'
    }

    const client = await getOssClient()

    const ossKey = `${teamId}${dir}/${file.name}`

    //Buffer
    var result = await client.get(ossKey);

    return result
}   

module.exports.fileDownloader = fileDownloader