const mongoose = require('mongoose')
const crypto = require('crypto-js');
const conf = require('../conf')

/*
wxUserInfo
{
    "openid": "oAX1fwRD4MfWXbsP5NJdUX4l2kGU",
    "nickname": "Arluber",
    "sex": 1,
    "language": "zh_CN",
    "city": "Guangzhou",
    "province": "Guangdong",
    "country": "CN",
    "headimgurl": "http://thirdwx.qlogo.cn/mmopen/vi_32/kQviaoWtNgHxz8aRwWR9pctqMia8NkohnwuWuHIJ14MtoXSNGibHV9QEskAib9RiaxW1jeJetkHyWVzqtuiacs7emH0g/132",
    "privilege": [],
    "unionid": "oTq_VwNhsB143AYULDVgm7PTQaLI"
}
*/

// teamList : {teamId: teamId, role: role, marked: false}

const userSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    username: { type: String , index: true },
    password: { type: String  },
    personInfo: mongoose.Schema.Types.Mixed,
    teamList: [mongoose.Schema.Types.Mixed],
    openid: String,
    unionid: { type: String, index: true },
    wxUserInfo: mongoose.Schema.Types.Mixed,
    mailCode :String,
    mailLimitTime :String,
    isLive : { type: Boolean, default: false},
    noticeList: [mongoose.Schema.Types.Mixed],
})

userSchema.statics = {
    createWxUser: async function(unionid){
        const result = await this.findOne({unionid:unionid}).exec()
        if(result){
            return null
        } else{
           
            return this.create({
                unionid:unionid
            })
        }
    },
    createUser: async function(username, password, userInfo = {}) {
        if(username === null){
            var result = await this.findOne({unionid:userInfo.unionid}).exec()
        }
        else{
            var result = await this.findOne({username: username}).exec()
        }
        if(result) {
            return null
        } else {
            return this.create({
                ...userInfo,
                username: username,
                // password: crypto.createHmac('sha1', conf.salt).update(password).digest('hex'),
                password: password?crypto.SHA256(password).toString():null
            })
        }
    },
    authJudge: async function(un, pw) {
        const result = await this.findOne({username: un}).exec()
        if(result) {
            return result.password == pw ? result : null
        } else {
            return null
        }
    },
    findByUserId: async function(userId) {
        const result = await this.findById(userId)
        return result
    },
    baseInfoById: async function(userId) {
        const result = await this.findById(userId)
        result.personInfo._id = result._id
        return result.personInfo
    },
    findByUnionId: async function(unionid) {
        const result = await this.findOne({unionid: unionid}).exec()
        return result
    },
    findByOpenId: async function(openid) {
        const result = await this.findOne({openid: openid}).exec()
        return result
    },
    findByUsername: async function(username) {
        const result = await this.findOne({username: username}).exec()
        return result
    },
    updateUser: async function(userId, userObj) {
        const result = await this.findByIdAndUpdate(userId, userObj, () => {})
        return result
    },
    updatePassword:async function(username,password){
        const result = await this.findOneAndUpdate({username:username},{password:password},()=>{})
        return result
    },
    updateUserByUid: async function(unionid, userObj) {
        const result = await this.findOneAndUpdate({unionid: unionid}, userObj, () => {})
        return result
    },
    personInfoList: async function(userIdList){
        const queryList = []
        userIdList.length && userIdList.map((item) => {
            queryList.push({_id: item})
        })
        if(queryList && queryList.length) {
            return this.find({$or: queryList}, {personInfo: 1, isLive: 1}).exec()
        } else {
            return []
        }
    },
    openidList: async function(userIdList) {
        const queryList = []
        userIdList.length && userIdList.map((item) => {
            queryList.push({_id: item})
        })
        if(queryList && queryList.length) {
            return this.find({$or: queryList}, {openid: 1}).exec()
        } else {
            return []
        }
    },
    delUserById: async function(_id){
        const result = await this.remove({ _id: _id }).exec()
        return result
    },


    // team 操作相关
    addTeam: async function(userId, teamObj, role) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    teamList: {
                        teamId: teamObj._id.toString(),
                        role: role,
                        marked: false,
                        teamName: teamObj.name,
                        teamImg: teamObj.teamImg,
                        teamDes: teamObj.teamDes,
                    }
                }
            }
        ).exec()
    },
    updateTeam: async function(userId, teamObj) {
        teamId = teamObj._id.toString()
        return this.update(
            { _id: userId, "teamList.teamId": teamId },
            {
                $set: {
                    "teamList.$.teamName": teamObj.name,
                    "teamList.$.teamImg": teamObj.teamImg,
                    "teamList.$.teamDes": teamObj.teamDes,
                }
            },
        ).exec()
    },
    delTeam: async function(userId, teamId) {
        return this.update(
            {_id: userId},
            { $pull: { teamList: {teamId: teamId}}}
        ).exec()
    },
    markTeam: async function(userId, teamId, markState) {
        teamId = teamId.toString()
        return this.update(
            {_id: userId, "teamList.teamId": teamId},
            {$set: {"teamList.$.marked": markState}},
        ).exec()
    },

    

    changeTeamRole: async function(userId, teamId, role) {
        return this.update(
            {_id: userId, "teamList.teamId": teamId},
            {$set: { "teamList.$.role": role}},
        ).exec()
    },


    //所有的通知
    addCreateNotice: async function(userId, Obj, teamName,type) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    noticeList: {
                        create_time: Obj.create_time,
                        noticeId: mongoose.Types.ObjectId(),
                        topicId:Obj._id.toString(),
                        teamId: Obj.team?Obj.team:Obj.teamId,
                        teamName: teamName,
                        creator: Obj.creator,
                        noticeTitle: Obj.title,
                        noticeContent: Obj.content,
                        type: type,
                        readState: false,
                    }
                }
            }
        ).exec()
    },

    addReplyNotice: async function(userId, discussObj, teamName) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    noticeList: {
                        create_time: discussObj.create_time,
                        noticeId: mongoose.Types.ObjectId(),
                        discussId:discussObj._id.toString(),
                        teamId: discussObj.teamId,
                        teamName: teamName,
                        topicId: discussObj.topicId,
                        creator: discussObj.creator,
                        noticeTitle: discussObj.title,
                        noticeContent: discussObj.content,
                        type: "REPLY_TOPIC",
                        readState: false,
                    }
                }
            }
        ).exec()
    },
    addEditTopicNotice: async function(userId, topicObj, teamName) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    noticeList: {
                        create_time: topicObj.create_time,
                        noticeId: mongoose.Types.ObjectId(),
                        topicId:topicObj._id.toString(),
                        teamId: topicObj.team,
                        teamName: teamName,
                        creator: topicObj.creator,
                        noticeTitle: topicObj.title,
                        noticeContent: topicObj.content,
                        type: "EDIT_TOPIC",
                        readState: false,
                    }
                }
            }
        ).exec()
    },
    addEditReplyNotice: async function(userId, discussObj, teamName) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    noticeList: {
                        create_time: discussObj.create_time,
                        noticeId: mongoose.Types.ObjectId(),
                        discussId:discussObj._id.toString(),
                        teamId: discussObj.teamId,
                        teamName: teamName,
                        topicId: discussObj.topicId,
                        creator: discussObj.creator,
                        noticeTitle: discussObj.title,
                        noticeContent: discussObj.content,
                        type: "EDIT_REPLY",
                        readState: false,
                    }
                }
            }
        ).exec()
    },

    editNotice: async function(userId, Obj, teamName, type) {
        return this.update(
            { _id: userId },
            {
                $addToSet: {
                    noticeList: {
                        create_time: Obj.create_time,
                        noticeId: mongoose.Types.ObjectId(),
                        topicId:Obj._id.toString(),
                        teamId: Obj.team?Obj.team:Obj.teamId,
                        teamName: teamName,
                        creator: Obj.creator,
                        noticeTitle: Obj.title,
                        noticeContent: Obj.content,
                        type: type,
                        readState: false,
                    }
                }
            }
        ).exec()
    },
    

    readNotice: async function(userId, noticeId, readState) {
        const notice = mongoose.Types.ObjectId(noticeId)
        return this.update(
            {_id: userId, "noticeList.noticeId": notice},
            {$set: {"noticeList.$.readState": readState}},
            {new: true}
        ).exec()
    },
    
    

    

}

mongoose.model('user', userSchema);
