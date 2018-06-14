var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

var OSSW = require('ali-oss').Wrapper;

var fileDB = mongoose.model('file')

import { getTempSTS } from '../components/oss-utils/oss-utils'
import { mongo } from 'mongoose';
import { resolve } from 'url';

const getOssStsToken = async (req, res, next) => {
    try {
        const token = await getTempSTS('session')
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作成功' },
            data: token
        });
    } catch (error) {
        console.log(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: ''
        });
    }
}

const uploadFile = async (req,res,next) => {

    const fileInfo = req.body.fileInfo || {} 
    const userId = req.rSession.userId

    try {
        let fileObj = await fileDB.createFile(fileInfo.teamId,fileInfo.dir,fileInfo.fileName,fileInfo.ossKey)
        await fileDB.appendFile(fileInfo.teamId,fileInfo.dir,fileObj)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully appended file"},
            data: {
                fileObj: fileObj
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "File append failed"},
            data: {}
        });
    }
}

module.exports = [
    ['GET', '/api/getOssStsToken', apiAuth, getOssStsToken]
    ['POST','/api/uploadFile',apiAuth,uploadFile]
];
