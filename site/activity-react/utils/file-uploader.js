var OSSW = require('ali-oss').Wrapper;
import api from './api'

// 上传
// try {
//     const token = await getTempSTS('sss')

//     const client = new OSSW({
//         region: 'oss-cn-shenzhen',
//         accessKeyId: token.AccessKeyId,
//         secure: false,
//         accessKeySecret: token.AccessKeySecret,
//         stsToken: token.SecurityToken,
//         bucket: 'arluber',
//     });
//     var result = await client.put('object-key-' + new Date().getTime(), '/data/logs/access.log');
//     resProcessor.jsonp(req, res, {
//         state: { code: 1, msg: '操作成功' },
//         data: result
//     });
// } catch (error) {
//     console.log(error);
//     resProcessor.jsonp(req, res, {
//         state: { code: 1, msg: '操作失败' },
//         data: ''
//     });
// }

// 上传文件命名
function reName() {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var res = '';
    for (var i = 0; i < 8; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    res += '-';
    for (var i = 0; i < 4; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    res += '-';
    for (var i = 0; i < 4; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    res += '-' + (new Date).getTime() + '-';
    for (var i = 0; i < 12; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    return res;
}

const getOssClient = async () => {
    const result = await api('/api/getOssStsToken', {
        method: 'GET',
        body: {}
    })
    const token = result.data
    console.log('token', token);

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


const fileUploader = async (teamId, dir, file) => {
    if(typeof teamId != 'string' || typeof dir != 'string' || typeof file.name != 'string') {
        return '参数错误'
    }

    const client = await getOssClient()

    const ossKey = `${teamId}${dir}${file.name}`

    var result = await client.put(ossKey, file);
    return result
}   

export default fileUploader