var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

var OSSW = require('ali-oss').Wrapper;
var mongoose = require('mongoose')

var file = require('../models/file');

import { getTempSTS } from '../components/oss-utils/oss-utils'
import { mongo } from 'mongoose';
import { resolve } from 'url';
import { responsePathAsArray } from 'graphql';

import{
    isMember,
    isAdmin,
    isCreator
}from '../middleware/auth-judge/auth-judge'

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
            state: { code: 1000, msg: '操作失败' },
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
    const teamId = req.body.teamId
    const dir = req.body.dir
    const fileName = req.body.fileName
    const ossKey = req.body.ossKey
    const size = req.body.size
    if(!teamId||!dir||!fileName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let fileObj = await file.createFile(teamId,dir,fileName,ossKey,size)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully created file"},
            data: {
                fileObj: fileObj
            }
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg:'操作失败' },
            data: {},
            info: fileInfo,
        });
    }
}

const createFolder = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const folderName = req.body.folderName
    if(!teamId||!dir||!folderName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let folderObj = await file.createFolder(teamId,dir,folderName)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully created folder"},
            data: {
                folderObj: folderObj
            }
        })
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg:'操作失败' },
            data: {},
            info: folderInfo,
        })
    }
}

const getDirFileList = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const userId = req.rSession.userId

    try {

        let fileList = await file.getDirFileList(teamId,dir)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully got list of files"},
            data: {
                fileList: fileList
            }
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg:'操作失败' },
            data: {},
            info: dirInfo,
        });
    }
}

const downloadFile = async (req, res, next) => {
    // const fileInfo = req.body.fileInfo

    // var ossKey = `${fileInfo.teamId}${fileInfo.dir}/${fileInfo.fileName}`

    // try {
    //     const client = new OSSW({
    //         accessKeyId: conf.ossConf.ossAdminAccessKeyId,
    //         accessKeySecret: conf.ossConf.ossAdminAccessKeySecret,
    //         bucket: conf.ossConf.bucket,
    //         region: conf.ossConf.region
    //     });
    //     var result = await client.get(ossKey)
    //     console.log(result.res.data)
    //     res.send(result.res.data)

    //     /*
    //     resProcessor.jsonp(req, res, {
    //         state: {code: 0,msg: "Successfully downloaded file"},
    //         data: {
    //             downFile: downFile
    //         }
    //     });
    //     */
    // } catch (error) {
    //     res.send(404)
    // }
}

const moveFile = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const fileName = req.body.fileName
    const tarDir = req.body.tarDir
    if(!teamId||!dir||!fileName||!tarDir) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        await file.moveFile(teamId,dir,fileName,tarDir)

        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully moved file"},
            data: {}
        });
    } catch (error) {
        console.log(error)
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg:'操作失败' },
            data: {},
            info: fileInfo,
        });
    }
}

const moveFolder = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const folderName = req.body.folderName
    const tarDir = req.body.tarDir
    if(!teamId||!dir||!folderName||!tarDir) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        await file.moveFolder(teamId, dir, folderName, tarDir)
        
        resProcessor.jsonp(req, res, {
            state: {code: 0,msg: "Successfully moved folder"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000, msg:'操作失败' },
            data: {},
            info: folderInfo
        })
    }
}

const delFile = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const fileName = req.body.fileName
    if(!teamId||!dir||!fileName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try{
        await file.delFile(teamId,dir,fileName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully deleted file"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg: '操作失败' },
            data: {},
            info: fileInfo
        })
    }
}

const delFolder = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const folderName = req.body.folderName
    if(!teamId||!dir||!folderName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try{
        await file.delFolder(teamId,dir,folderName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully deleted folder"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000,msg:'操作失败' },
            data: {},
            info: folderInfo
        })
    }
}

const updateFileName = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const fileName = req.body.fileName
    const tarName = req.body.tarName
    if(!teamId||!dir||!fileName||!tarName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        await file.updateFileName(teamId, dir, fileName, tarName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully updated name"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000, msg:'操作失败' },
            data: {},
        })
    }
}
const updateFolderName = async (req, res, next) => {
    const teamId = req.body.teamId
    const dir = req.body.dir
    const folderName = req.body.folderName
    const tarName = req.body.tarName
    if(!teamId||!dir||!folderName||!tarName) {
        resProcessor.jsonp(req, res, {
            state: { code: 3000, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        await file.updateFolderName(teamId, dir, folderName, tarName)

        resProcessor.jsonp(req, res, {
            state: {code: 0, msg: "Successfully updated name"},
            data: {}
        });
    } catch (error) {
        console.log(error) 
        resProcessor.jsonp(req, res, {
            state: {code: 1000, msg:'操作失败' },
            data: {},
        })
    }
}


module.exports = [
    ['POST', '/api/getOssStsToken', apiAuth, isMember, getOssStsToken],
    ['POST','/api/file/createFile',apiAuth, isMember, createFile],
    ['POST','/api/file/createFolder',apiAuth, isMember, createFolder],
    ['POST','/api/file/downloadFile',apiAuth, isMember, downloadFile],
    ['POST','/api/file/getDirFileList',apiAuth, isMember, getDirFileList],
    ['POST','/api/file/moveFile',apiAuth, isMember, moveFile], 
    ['POST','/api/file/moveFolder',apiAuth, isMember, moveFolder],
    ['POST','/api/file/delFile',apiAuth, isMember, delFile],
    ['POST','/api/file/delFolder',apiAuth, isMember, delFolder],
    ['POST','/api/file/updateFileName',apiAuth, isMember, updateFileName],
    ['POST','/api/file/updateFolderName',apiAuth, isMember, updateFolderName],
];
