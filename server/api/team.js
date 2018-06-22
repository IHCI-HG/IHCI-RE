var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

import { 
    web_codeToAccessToken, 
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
    applyIntoTeam,
    admitIntoTeam
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')
var topicDB = mongoose.model('topic')


const creatTeam = async (req, res, next) => {
    const teamInfo = req.body.teamInfo || {}
    const userId = req.rSession.userId

    if(!teamInfo.name || !teamInfo.teamImg || !teamInfo.teamDes) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return 
    }

    try {
        let teamObj = await teamDB.createTeam(teamInfo.name, teamInfo.teamImg, teamInfo.teamDes)
        await teamDB.addMember(teamObj._id, userId, 'creator')
        await userDB.addTeam(userId, teamObj, 'creator')
        teamObj = await teamDB.findByTeamId(teamObj._id)
         
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '创建成功' },
            data: {
                teamObj: teamObj
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const joinTeam = async (req, res, next) => {
    const teamId = req.body.teamId
    const userId = req.rSession.userId

    if(!teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        // 检验是否已经加入该团队
        let isJoined = false
        teamObj.memberList.map((item) => {
            if(item.userId === userId) {
                isJoined = true
            }
        })
        if(isJoined) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '您已在团队中' },
                data: {}
            });
            return
        }

        //提交申请
        // let userObj = userDB.baseInfoById(userId);
        // applyIntoTeam(teamObj.memberList,userObj);


        await teamDB.addMember(teamId, userId, 'member')
        await userDB.addTeam(userId, teamObj, 'member')
        teamObj = await teamDB.findByTeamId(teamId)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '加入成功' },
            data: {
                teamObj: teamObj
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const modifyMemberRole = async (req, res, next) => {
    const body = req.body
    const userId = req.rSession.userId
    const teamId = body.teamId 

    if(!body.teamId || !body.userId || !body.role) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj || !teamObj.memberList) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        let myRole = null
        teamObj.memberList.map((item) => {
            if(item.userId == userId) {
                myRole = item.role
            }
        })

        if(!myRole) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '你不并在这个团队里面'},
                data: {}
            });
            return
        }

        if(myRole == "member") {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '成员没有管理权限'},
                data: {}
            });
            return
        }

        if(role == "creator") {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '不能设置创建者'},
                data: {}
            });
            return
        }

        await teamDB.changeMemberRole(teamId, userId, body.role)
        await userDB.modifyTeamRole(userId, teamId, body.role)
        teamObj = await teamDB.findByTeamId(teamId)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '修改成功' },
            data: {
                teamObj: teamObj
            }
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const modifyTeamInfo = async (req, res, next) => {
    const teamId = req.body.teamId
    const teamInfo = req.body.teamInfo
    const userId = req.rSession.userId 

    /* teamInfo

        name: name, 
        teamImg: imgUrl,
        teamDes: des,
    */

    if(!teamInfo || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        const result = await teamDB.updateTeam(teamId, teamInfo)

        // 团队中所有成员更新team信息
        teamObj = await teamDB.findByTeamId(teamId)
        teamObj.memberList.map((item) => {
            userDB.updateTeam(item.userId, teamObj)
        })

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                teamObj: result
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }

}

const markTeam = async (req, res, next) => {
    const teamId = req.body.teamId
    const markState = req.body.markState
    const userId = req.rSession.userId 

    if(!teamId || markState == undefined) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }
        let userObj = await userDB.findByUserId(userId)
        if(!userObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '用户不存在'},
                data: {}
            });
            return
        }

        const result = await userDB.markTeam(userId, teamId, markState)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: result
        });


    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }

}

const kikMember = async (req, res, next) => {
    const teamId = req.body.teamId
    const tarMemberId = req.body.memberId
    const userId = req.rSession.userId 


    if(!tarMemberId || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        let power = false
        teamObj.memberList.map((item) => {
            if(item.userId == userId && (item.role == 'creator' || item.role == 'admin')) {
                power = true
            }
        })
        if(!power) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '没有权限'},
                data: {}
            });
            return
        }
        const result = await teamDB.delMember(teamId, tarMemberId)
        await userDB.delTeam(tarMemberId, teamId)

        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                result: result
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const teamInfo = async (req, res, next) => {
    const teamId = req.body.teamId
    if(!teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: teamObj
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

// 个人首页、获取团队列表
const teamInfoList = async (req, res, next) => {
    const teamIdList = req.body.teamIdList

    if(!teamIdList || !teamIdList.length) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        const promiseList = []
        teamIdList.map((item) => {
            promiseList.push(teamDB.findByTeamId(item))
        })
        const result = await Promise.all(promiseList)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

// 直接返回团队的成员列表
const memberList = async (req, res, next) => {
    const teamId = req.query.teamId
    if(!teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        const teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: "团队不存在" },
                data: {}
            });
            return
        }
        const promiseList = []
        teamObj.memberList.map((item) => {
            promiseList.push(userDB.baseInfoById(item.userId))
        })
        const result = await Promise.all(promiseList)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: result
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}



module.exports = [
    ['POST', '/api/team/info', apiAuth, teamInfo],
    ['POST', '/api/team/infoList', apiAuth, teamInfoList],

    ['POST', '/api/team/create', apiAuth, creatTeam],
    ['POST', '/api/team/modifyTeamInfo', apiAuth, modifyTeamInfo],
    ['POST', '/api/team/join', apiAuth, joinTeam],
    ['POST', '/api/team/roleModify', apiAuth, modifyMemberRole],
    ['POST', '/api/team/markTeam', apiAuth, markTeam],
    ['POST', '/api/team/kikMember', apiAuth, kikMember],

    ['GET', '/api/team/memberList', apiAuth, memberList],
    
];
