var OSSW = require('ali-oss').Wrapper;
var STS = OSSW.STS;
var conf = require('../../conf')

import fetch from 'isomorphic-fetch';

/**
 * 获取阿里云oss临时授权访问STS对象
 * 
 * @param {any} code 
 * @returns 
 */
const getTempSTS = async function(session) {
    // todo 增加redis缓存

    var sts = new STS({
        accessKeyId: conf.ossConf.accessKeyId,
        accessKeySecret: conf.ossConf.accessKeySecret
    });
    const roleArn = conf.ossConf.roleArn
    const policy = {
        "Statement": [
            {
                "Action": "oss:*",
                "Effect": "Allow",
                "Resource": "*"
            }
        ],
        "Version": "1"
    }

    var token = await sts.assumeRole(roleArn, policy, 3600, session)
    token.credentials.region = conf.ossConf.region
    token.credentials.bucket = conf.ossConf.bucket

    return token.credentials
}

/**
 * 阿里云内容上传
 * 
 * @param {any} code 
 * @returns 
 */
const ossUpDate = async function(session) {
    // todo 增加redis缓存

    var sts = new STS({
        accessKeyId: conf.ossConf.accessKeyId,
        accessKeySecret: conf.ossConf.accessKeySecret
    });
    const roleArn = conf.ossConf.roleArn
    const policy = {
        "Statement": [
            {
                "Action": "oss:*",
                "Effect": "Allow",
                "Resource": "*"
            }
        ],
        "Version": "1"
    }

    var token = await sts.assumeRole(roleArn, policy, 3600, session)
    token.credentials.region = conf.ossConf.region
    token.credentials.bucket = conf.ossConf.bucket

    return token.credentials
}

module.exports.getTempSTS = getTempSTS

