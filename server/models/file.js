const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')
const Schema = mongoose.Schema

/*
    文件对象
*/
const fileSchema = new Schema({
    create_time: { type: String, default : Date.now()},
    last_modify_time: { type: String, default : Date.now()},
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
    path为/aaa
*/
const folderSchema = new Schema({
    create_time: { type: String, default : Date.now()},
    last_modify_time: { type: String, default : Date.now()},
    fileList: [{
        fileType: {type: String, enum: ['file', 'folder']},
        _id: {type: Schema.Types.ObjectId}, // 根据fileType字段，可能是file对象也可能是folder对象
        name: String,
        OssKey: String, // 如果是folder该字段就为null
        last_modify_time: String,
    }],
    team: {type: Schema.Types.ObjectId, ref: 'team', index: true},
    folderName: String,
    dir: String, // 文件夹所在目录, 对team唯一, 由dirFileExist方法约束
    path: String
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
    updateTime: function(teamId, dir, fileName) {
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            fileName: fileName
        },{
            last_modify_time: Date.now()
        }).exec()
    },
    updateName: function(teamId, dir, fileName,tarFileName) {
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            fileName: fileName,
        },{
            fileName: tarFileName,
            last_modify_time: Date.now(),
        }).exec()
    },
}
folderSchema.statics = {
    modifyDir: function(teamId, dir, folderName, tarDir) {
        var path;
        if(tarDir == '/') path = tarDir+folderName;
        else path = tarDir+'/'+folderName;
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        },{
            dir: tarDir,
            path: path
        }).exec()
    },
    findByDir: function(teamId, dir, folderName) {
        return this.findOne({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        })
    },
    createFolder: function(teamId, dir, folderName) {
        var path;
        if(dir == '/') path = dir+folderName;
        else path = dir+'/'+folderName;
        return this.create({
            folderName: folderName,
            fileList: [],
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            path: path
        })
    },
    appendFile: async function(teamId, dir, fileObj) {
        return this.update(
            {team: mongoose.Types.ObjectId(teamId), path: dir},
            { $push: { fileList : {
                fileType: 'file',
                _id: fileObj._id,
                name: fileObj.fileName,
                OssKey: fileObj.OssKey,
                last_modify_time: Date.now(),
            }}}
        ).exec()
    },
    delFolderByDir: function(teamId, dir, folderName) {
        return this.remove({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        }).exec()
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
            {team: mongoose.Types.ObjectId(teamId), path: dir},
            { $pull: { fileList : {
                name: fileName
            }}}
        ).exec()
    },

    appendFolder: async function(teamId, dir, folderObj) {
        return this.update(
            {team: mongoose.Types.ObjectId(teamId), path: dir},
            { $push: { fileList : {
                fileType: 'folder',
                _id: folderObj._id,
                name: folderObj.folderName,
                OssKey: null,
                last_modify_time: Date.now(),
            }}}
        ).exec()
    },
    updateTime: async function(teamId, dir, folderName) {
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        },{
            last_modify_time: Date.now(),
        }).exec()
    },
    updateName: async function(teamId, dir, folderName,tarName) {
        var path;
        if(dir == '/') path = dir+tarName;
        else path = dir+'/'+tarName;
        return this.update({
            team: mongoose.Types.ObjectId(teamId),
            dir: dir,
            folderName: folderName
        },{
            path: path,
            folderName: tarName,
            last_modify_time: Date.now(),
        }).exec()
    },
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
        path: dir
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
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: dir
    }).exec()
    return folderObj.fileList
}

const createFile = async function(teamId, dir, fileName, ossKey) {
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: dir
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
        path: dir
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
    await folderDB.appendFolder(teamId, dir, folderObj)

    return folderObj
}

const delFile = async function(teamId, dir, fileName) {
    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: dir
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
        path: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    const tarFolderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: tarDir
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
    await folderDB.appendFile(teamId, tarDir, fileObj)
    await folderDB.dropFile(teamId, dir, fileName)
    await fileDB.updateTime(teamId, tarDir, fileName)

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

    //TODO: fix bugs here
 
    const tarDirFileNameExist = await dirFileExist(teamId, tarDir, folderName)
    if(tarDirFileNameExist) {
        throw '目标目录存在同名文件'
    }

    const folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: dir
    }).exec()
    if(!folderObj) {
        throw '目录不存在'
    }

    const tarFolderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        path: tarDir
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

    await folderDB.modifyDir(teamId, dir, folderName, tarDir)
    await folderDB.appendFolder(teamId, tarDir, folderObj)
    await folderDB.dropFile(teamId, dir, folderName)
    await folderDB.updateTime(teamId, tarDir, folderName)

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
            var path;
            if(dir == '/') path = dir+folderName;
            else path = dir+'/'+folderName;
            delFolder(teamId, path, item.name)
        }
        if(item.fileType == 'file') {
            fileDB.delFileById(item._id)
        }
    })

    folderDB.delFolderByDir(teamId, dir, folderName)
    await folderDB.dropFile(teamId, dir, folderName)
}

/**
 * Change file name to tarName
 * 
 * @param {any} teamId 
 * @param {any} dir 
 * @param {any} fileName 
 * @param {any} tarName
 */
const updateFileName = async function(teamId, dir, fileName, tarName) {
    const tarDirFileNameExist = await dirFileExist(teamId, dir, tarName)
    if(tarDirFileNameExist) {
        throw '目标目录存在同名文件'
    }

    var fileObj = await fileDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        fileName: fileName,
    })
    console.log(fileObj)
    if(!fileObj) {
        throw '文件不存在'
    }

    await folderDB.dropFile(teamId, dir, fileName)
    await fileDB.updateName(teamId, dir, fileName, tarName)

    fileObj = await fileDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        fileName: tarName,
    })
    if(!fileObj) {
        throw '修改后文件不存在'
    }

    await folderDB.appendFile(teamId, dir, fileObj)
}

/**
 * Change folder name to tarName
 * 
 * @param {any} teamId 
 * @param {any} dir 
 * @param {any} fileName 
 * @param {any} tarName
 */
const updateFolderName = async function(teamId, dir, folderName, tarName) {
    const tarDirFileNameExist = await dirFileExist(teamId, dir, tarName)
    if(tarDirFileNameExist) {
        throw '目标目录存在同名文件'
    }

    var folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        folderName: folderName,
    })
    if(!folderObj) {
        throw '文件夹不存在'
    }

    await folderDB.dropFile(teamId, dir, folderName)
    await folderDB.updateName(teamId, dir, folderName, tarName)
    
    folderObj = await folderDB.findOne({
        team: mongoose.Types.ObjectId(teamId),
        dir: dir,
        folderName: tarName,
    })
    if(!folderObj) {
        throw '修改后文件夹不存在'
    }

    await folderDB.appendFolder(teamId, dir, folderObj)
}

exports.createFile = createFile;
exports.createFolder = createFolder;
exports.getDirFileList = getDirFileList;
exports.moveFile = moveFile;
exports.moveFolder = moveFolder;
exports.delFile = delFile;
exports.delFolder = delFolder;
exports.updateFileName = updateFileName;
exports.updateFolderName = updateFolderName;