var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

var OSSW = require('ali-oss').Wrapper;
var mongoose = require('mongoose')
var conf = require('../conf')

var file = require('../models/file');

import { getTempSTS } from '../components/oss-utils/oss-utils'
import { mongo } from 'mongoose';
import { resolve } from 'url';

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


const getOssStsToken = async (req, res, next) => {
    try {
        const token = await getTempSTS('session')
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '操作成功' },
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

const getOssClient = async () => {
    const token = await getTempSTS('session')
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


const createFile = async (req, res, next) => {

    const fileInfo = req.body.fileInfo || {} 
    const userId = req.rSession.userId

    try {
        let fileObj = await file.createFile(fileInfo.teamId,fileInfo.dir,fileInfo.fileName,fileInfo.ossKey)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully created file"},
            data: {
                fileObj: fileObj
            }
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "File create failed"},
            data: {},
            info: fileInfo,
        });
    }
}

const createFolder = async (req, res, next) => {
    const folderInfo = req.body.folderInfo || {}
    const userId = req.rSession.userId

    try {
        let folderObj = await file.createFolder(folderInfo.teamId,folderInfo.dir,folderInfo.folderName)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully created folder"},
            data: {
                folderObj: folderObj
            }
        })
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "Folder create failed"},
            data: {},
            info: folderInfo,
        })
    }
}

const getDirFileList = async (req, res, next) => {
    const dirInfo = req.body.dirInfo || {} 
    const userId = req.rSession.userId

    try {

        let fileList = await file.getDirFileList(dirInfo.teamId,dirInfo.dir)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully got list of files"},
            data: {
                fileList: fileList
            }
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "Can't get files"},
            data: {},
            info: dirInfo,
        });
    }
}

const downloadFile = async (req, res, next) => {
    const fileInfo = req.body.fileInfo

    var ossKey = `${fileInfo.teamId}${fileInfo.dir}/${fileInfo.fileName}`

    try {
        const client = new OSSW({
            accessKeyId: conf.ossConf.ossAdminAccessKeyId,
            accessKeySecret: conf.ossConf.ossAdminAccessKeySecret,
            bucket: conf.ossConf.bucket,
            region: conf.ossConf.region
        });
        var result = await client.get(ossKey)
        console.log(result.res.data)
        res.send(result.res.data)

        /*
        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully downloaded file"},
            data: {
                downFile: downFile
            }
        });
        */
    } catch (error) {
        res.send(404)
    }
}

const moveFile = async (req, res, next) => {
    const fileInfo = req.body.fileInfo || {} 
    const userId = req.rSession.userId

    try {
        await file.moveFile(fileInfo.teamId,fileInfo.dir,fileInfo.fileName,fileInfo.tarDir)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully moved file"},
            data: {}
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "File move failed"},
            data: {},
            info: fileInfo,
        });
    }
}

const moveFolder = async (req, res, next) => {
    const folderInfo = req.body.folderInfo || {} 

    try {
        await file.moveFolder(folderInfo.teamId, folderInfo.dir, folderInfo.folderName,folderInfo.tarDir)
        
        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully moved folder"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1, msg: "Folder move failed"},
            data: {},
            info: folderInfo
        })
    }
}

const delFile = async (req, res, next) => {
    const fileInfo = req.body.fileInfo || {}

    try{
        await file.delFile(fileInfo.teamId,fileInfo.dir,fileInfo.fileName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully deleted file"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "File delete failed"},
            data: {},
            info: fileInfo
        })
    }
}

const delFolder = async (req, res, next) => {
    const folderInfo = req.body.folderInfo || {}

    try{
        await file.delFile(folderInfo.teamId,folderInfo.dir,folderInfo.folderName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully deleted folder"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1,msg: "Folder delete failed"},
            data: {},
            info: folderInfo
        })
    }
}


module.exports = [
    ['GET', '/api/getOssStsToken', apiAuth, getOssStsToken],
    ['POST','/api/file/createFile',apiAuth, createFile],
    ['POST','/api/file/createFolder',apiAuth, createFolder],
    ['POST','/api/file/downloadFile',apiAuth, downloadFile],
    ['POST','/api/file/getDirFileList',apiAuth, getDirFileList],
    ['POST','/api/file/moveFile',apiAuth,moveFile], 
    ['POST','/api/file/moveFolder',apiAuth, moveFolder],
    ['POST','/api/file/delFile',apiAuth, delFile],
    ['POST','/api/file/delFolder',apiAuth, delFolder] 
];
