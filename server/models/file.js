const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')
const Schema = mongoose.Schema

/*
    文件对象
*/
const fileSchema = new Schema({
    create_time: { type: String, default : Date.now},
    ossKey: String,
    fileName: String,
    team: {type: Schema.Types.ObjectId, ref: 'team', index: true},
    dir: String, // 文件所在目录,对team唯一, 由dirValidate方法约束
})


/*
    文件夹对象
    dir对象的 dir字段不包含自身
    根目录为/ 
    例如在根目录下有一个叫aaa的文件夹，则aaa文件夹对象的目录依旧为/
*/
const folderSchema = new Schema({
    create_time: { type: String, default : Date.now},
    fileList: [{
        fileType: {type: String, enum: ['file', 'folder']},
        _id: {type: Schema.Types.ObjectId}, // 根据fileType字段，可能是file对象也可能是folder对象
        name: String,
        OssKey: String, // 如果是folder该字段就为null
    }],
    team: {type: Schema.Types.ObjectId, ref: 'team', index: true},
    folderName: String,
    dir: String, // 文件夹所在目录, 对team唯一, 由dirFileExist方法约束
})


fileSchema.statics = {
    createFile: async function(teamId, dir, fileName, ossKey) {
        return this.create({
            ossKey: ossKey,
            fileName: fileName,
            team: mongoose.Types.ObjectId(teamId),
            dir: dir
        })
    },
    delFileByDir: function(teamId, dir, fileName) {
        return this.remove({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            fileName: fileName
        }).exec()
    },
    delFileById: function(fileId) {
        return this.remove({
            _id: mongoose.Types.ObjectId(fileId)
        }).exec()
    },
    modifyDir: function(teamId, dir, fileName, tarDir) {
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            fileName: fileName
        },{
            dir: tarDir
        }).exec()
    },
}
folderSchema.statics = {
    findByDir: function(teamId, dir, folderName) {
        return this.findOne({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        })
    },
    createFolder: function(teamId, dir, folderName) {
        return this.create({
            folderName: folderName,
            fileList: [],
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
        })
    },
    appendFile: async function(teamId, dir, fileObj) {
        return this.update(
            {team: mongoose.Types.ObjectId(teamId), dir: dir},
            { $push: { fileList : {
                fileType: 'file',
                _id: fileObj._id,
                name: fileObj.fileName,
                OssKey: fileObj.OssKey
            }}}
        ).exec()
    },

    /**
     * 删除file或者folder都是dropFile这个方法
     * 
     * @param {any} teamId 
     * @param {any} dir 
     * @param {any} fileName 
     * @returns 
     */
    dropFile: async function(teamId, dir, fileName) {
        return this.update(
            {team: mongoose.Types.ObjectId(teamId), dir: dir},
            { $pull: { fileList : {
                fileName: fileName
            }}}
        ).exec()
    },

    appendFolder: (teamId, dir, folderObj) => {
        return this.update(
            {team: mongoose.Types.ObjectId(teamId), dir: dir},
            { $push: { fileList : {
                fileType: 'folder',
                fileId: folderObj._id,
                fileName: folderObj.folderName,
                OssKey: null
            }}}
        ).exec()
    }
}

const fileDB = mongoose.model('file', fileSchema);
const folderDB = mongoose.model('folder', folderSchema);

/**
 * 检测在特定目录下，该文件名是否存在
 * 
 * @param {String | ObjectId} teamId 
 * @param {String} dir 
 * @param {String} fileName 
 * @returns {Boolean} 
 */
const dirFileExist = async function (teamId, dir, fileName) {
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()

    if(!folderObj) {
        throw '目录不存在'
    }
    
    let exist = false
    folderObj.fileList.map((item) => {
        if(item.name == fileName) {
            exist = true
        } 
    })
    return exist
}

const getDirFileList = async function(teamId, dir) {
    const folderObj = await folderObj.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()
    return folderObj.fileList
}

const createFile = async function(teamId, dir, fileName, ossKey) {
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    let exist = false
    folderObj.fileList.map((item) => {
        if(item.name == fileName) {
            exist = false
        } 
    })
    if(exist) {
        throw '文件名已存在'
    }

    const fileObj = await fileDB.createFile(teamId, dir, fileName, ossKey)
    await folderDB.appendFile(teamId, dir, fileObj)
    return fileObj
}

const createFolder = async function(teamId, dir, folderName) {
    let folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    let exist = false
    folderObj.fileList.map((item) => {
        if(item.name == folderName) {
            exist = false
        } 
    })
    if(exist) {
        throw '文件名已存在'
    }

    folderObj = await folderDB.createFolder(teamId, dir, folderName)
    await folderDB.appendFile(teamId, dir, folderObj)

    return folderObj
}

const delFile = async function(teamId, dir, fileName) {
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()

    if(!folderObj) {
        throw '目录不存在'
    }

    const fileObj = await fileDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        fileName: fileName,
    })
    if(!fileObj) {
        throw '文件不存在'
    }

    const result = await fileDB.delFileByDir(teamId, dir, fileName)
    await folderDB.dropFile(teamId, dir, fileName)

    return result
}

/**
 * 移动文件到tarDir目录下
 * 
 * @param {any} teamId 
 * @param {any} dir 
 * @param {any} fileName 
 * @param {any} tarDir 
 * @returns 
 */
const moveFile = async function(teamId, dir, fileName, tarDir) {
    const tarDirFileNameExist = await dirFileExist(teamId, tarDir, fileName)
    if(tarDirFileNameExist) {
        throw '目标目录存在同名文件'
    }

    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    const tarFolderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: tarDir
    }).exec()
    if(!folderObj) {
        throw '目标目录不存在'
    }    

    const fileObj = await fileDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        fileName: fileName,
    })
    if(!fileObj) {
        throw '文件不存在'
    }

    await fileDB.modifyDir(teamId, dir, fileName, tarDir)
    await folderDB.dropFile(teamId, dir, fileName)
    await folderDB.appendFile(teamId, tarDir, fileName)

    return true
}
/**
 * 移动文件夹到tarDir目录下
 * 
 * @param {any} teamId 
 * @param {any} dir 
 * @param {any} fileName 
 * @param {any} tarDir 
 * @returns 
 */
const moveFolder = async function(teamId, dir, folderName, tarDir) {
    const tarDirFileNameExist = await dirFileExist(teamId, tarDir, folderName)
    if(tarDirFileNameExist) {
        throw '目标目录存在同名文件'
    }

    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    const tarFolderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: tarDir
    }).exec()
    if(!folderObj) {
        throw '目标目录不存在'
    }    

    folderObj.fileList.map((item) => {
        if(item.fileType == 'file') {
            moveFile(teamId, dir + '/' + folderName, item.fileName, tarDir + '/' + folderName)
        } 
        if(item.fileType == 'folder') {
            moveFolder(teamId, dir + '/' + folderName, item.fileName, tarDir + '/' + folderName)
        }
    })

    // todo 完成操作
    // await folderDB.modifyDir(teamId, dir, fileName, tarDir)
    // await folderDB.dropFile(teamId, dir, fileName)
    // await folderDB.appendFile(teamId, tarDir, fileName)

    return true
}

/**
 * 迭代遍历删除目录下所有内容
 * 
 * @param {any} teamId 
 * @param {any} dir 
 * @param {any} folderName 
 */
const delFolder = async function(teamId, dir, folderName) {
    const folderObj = await folderDB.findByDir(teamId, dir, folderName)
    if(!folderObj) {
        throw '文件夹不存在'
    }

    folderObj.fileList.map((item) => {
        if(item.fileType == 'folder') {
            delFolder(teamId, dir + '/' + folderName, item.fileName)
        }
        if(item.fileType == 'file') {
            fileDB.delFileById(item._id)
        }
    })

    folderDB.delFileByDir(teamId, dir, folderName)
}

exports.createFile = createFile;
exports.getDirFileList = getDirFileList;