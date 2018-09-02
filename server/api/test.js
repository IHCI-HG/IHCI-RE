var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

var OSSW = require('ali-oss').Wrapper;
var fs = require('fs')
var path = require('path')

import { 
    web_codeToAccessToken, 
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
} from '../components/wx-utils/wx-utils'

import { getTempSTS } from '../components/oss-utils/oss-utils'

const test = async (req, res, next) => {

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

    try {
        const token = await getTempSTS('session')
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作成功' },
            data: token
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: ''
        });
    }

}


module.exports = [
    ['GET', '/api/test', test],

];
