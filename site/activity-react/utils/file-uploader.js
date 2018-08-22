
// var OSSW = require('ali-oss').Wrapper;
// 阿里云sdk太大了，700多k严重影响云上网页的访问速度，所以改成从cdn直接加载这个sdk

import api from './api'
if(window.OSS) {
    var OSSW = OSS.Wrapper;
}

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
        method: 'POST',
        body: {}
    })
    const token = result.data

    if(!OSSW) {
        if(window.toast) {
            window.toast("网络错误")
        }
        return
    }

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

// dir 必须以 '/' 开头 或者为 ''（空字符串,表示根目录）
const fileUploader = async (file, ossKey) => {
    const client = await getOssClient()

    let checkpoint, fileName, uploadId;
    var result = await client.multipartUpload(ossKey, file, {
        checkpoint: checkpoint,
        progress: async function (p, cpt) {
            window.bar(p)
            // options.onProgress(p);
            if (cpt !== undefined) {
                // console.log(cpt.fileSize)
                checkpoint = cpt;
                fileName = cpt.name;
                uploadId = cpt.uploadId;
            }
            return Promise.resolve();
        },
    });


    if (result.res.status == 200) { 
        console.log("文件上传成功");
    } else {
        console.error(result);
    }

    return result

    // window.ffff = file

    // if (window.File && window.FileReader && window.FileList && window.Blob) {
    //     var result = await client.multipartUpload(ossKey, file);
    // } else {
    //     alert('您使用的浏览器不支持文件上传，请使用chrom浏览器或者国产浏览器的极速模式');
    // }


}   

export default fileUploader